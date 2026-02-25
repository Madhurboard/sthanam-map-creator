from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
import asyncio
from playwright.async_api import async_playwright
import os
import uuid
import time

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Sthanam Export Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to store exported images
EXPORT_DIR = "exports"
if not os.path.exists(EXPORT_DIR):
    os.makedirs(EXPORT_DIR)

class ExportRequest(BaseModel):
    url: str
    width: int
    height: int
    filename: str = "export.png"

@app.get("/")
async def root():
    return {"message": "Sthanam Export Service is running"}

async def capture_screenshot(url: str, width: int, height: int, output_path: str):
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        # Create a high-res viewport
        # Note: deviceScaleFactor can be used for extra sharpness if needed
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 720}, # Initial, will resize
            device_scale_factor=1
        )
        page = await context.new_page()
        
        # Navigate to the renderer URL
        await page.goto(url, wait_until="networkidle")
        
        # Give some extra time for map tiles and fonts
        await asyncio.sleep(3)
        
        # Set the actual target viewport for the capture
        await page.set_viewport_size({"width": width, "height": height})
        
        # Wait for any potential "rendering" indicators to disappear
        # or for a specific "ready" flag on the window
        await page.wait_for_function("window.renderReady === true", timeout=10000)
        
        # Capture the screenshot of the whole page (which should be just the poster)
        await page.screenshot(path=output_path, full_page=True, animations="disabled")
        
        await browser.close()

@app.post("/api/export")
async def export_map(request: ExportRequest):
    file_id = str(uuid.uuid4())
    output_path = os.path.join(EXPORT_DIR, f"{file_id}.png")
    
    try:
        # Use a timeout to prevent hanging
        await asyncio.wait_for(
            capture_screenshot(request.url, request.width, request.height, output_path),
            timeout=60.0
        )
        
        if os.path.exists(output_path):
            return FileResponse(
                output_path, 
                media_type="image/png", 
                filename=request.filename
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to generate image")
            
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Export timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
