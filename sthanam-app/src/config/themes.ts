export const themes: Record<string, any> = {
    standard: {
        name: "Marg (Classic)",
        tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        tileUrlNoLabels: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        background: "#ffffff",
        bg: "#f2efe9",
        water: "#aad3df",
        road: "#ffffff",
        textColor: "#000000",
        accent: "#3b82f6",
        overlayBg: "rgba(255, 255, 255, 0.8)",
        description: "The classic OpenStreetMap look that everyone knows."
    },
    dark: {
        name: "Ratri (Dark)",
        tileUrl: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        tileUrlNoLabels: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
        background: "#111111",
        bg: "#222222",
        water: "#111111",
        road: "#333333",
        textColor: "#ffffff",
        accent: "#818cf8",
        overlayBg: "rgba(17, 17, 17, 0.85)",
        description: "Sleek and professional dark map for a premium feel."
    },
    minimal: {
        name: "Shwet (Minimal)",
        tileUrl: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        tileUrlNoLabels: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
        background: "#ffffff",
        bg: "#f8f9fa",
        water: "#cdd2d4",
        road: "#ffffff",
        textColor: "#000000",
        accent: "#6366f1",
        overlayBg: "rgba(255, 255, 255, 0.8)",
        description: "Clean, elegant, and light. Perfect for modern spaces."
    },
    voyager: {
        name: "Yatri (Modern)",
        tileUrl: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        tileUrlNoLabels: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
        background: "#ffffff",
        bg: "#f4f3f0",
        water: "#9cdcf1",
        road: "#fdfcfa",
        textColor: "#1e293b",
        accent: "#6366f1",
        overlayBg: "rgba(255, 255, 255, 0.85)",
        description: "Beautifully colored map with clear terrain and roads."
    },
    satellite: {
        name: "Antariksh (Satellite)",
        tileUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        tileUrlNoLabels: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        background: "#000000",
        bg: "#2a4f15",
        water: "#132b40",
        road: "#555555",
        textColor: "#ffffff",
        accent: "#10b981",
        overlayBg: "rgba(0, 0, 0, 0.6)",
        description: "High-resolution satellite imagery from above."
    }
};
