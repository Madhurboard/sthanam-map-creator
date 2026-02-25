'use client';

import React, { useState } from 'react';
import { Download, Loader2, Sparkles } from 'lucide-react';
import { usePosterStore } from '@/store/usePosterStore';

export const ExportTab: React.FC = () => {
    const state = usePosterStore();
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Use local variables to avoid any potential stale state or undefined issues during stringification
            const { mainText, width, height } = state;
            const safeMainText = (mainText || 'poster').toLowerCase().replace(/\s+/g, '-');

            const renderUrl = `${window.location.origin}/render?state=${encodeURIComponent(JSON.stringify(state))}`;

            const response = await fetch('http://localhost:8000/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: renderUrl,
                    width: width,
                    height: height,
                    filename: `sthanam-${safeMainText}-${Date.now()}.png`
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `sthanam-${safeMainText}-${Date.now()}.png`;
                a.click();
            } else {
                const err = await response.json();
                alert(`Export failed: ${err.detail || 'Unknown error'}. Make sure the backend is running.`);
            }
        } catch (err) {
            console.error(err);
            alert('Export failed. Connection error.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-8">
            <section className="space-y-6">
                <div className="p-6 rounded-3xl bg-accent/5 border border-accent/20 flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                        <Sparkles size={32} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">High-Res Export</h3>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            Generate a high-resolution print-ready image using our server-side rendering service.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className={`w-full py-4 rounded-2xl bg-accent text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-accent/20 active:scale-95
            ${isExporting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-accent-soft'}`}
                >
                    {isExporting ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download size={18} />
                            Export PNG ({state.width} × {state.height})
                        </>
                    )}
                </button>

                <p className="text-[9px] text-center text-slate-400 font-medium px-4">
                    * Resolution is optimized for {state.width > 3000 ? 'printing' : 'digital'}. Capturing large maps may take 10-30 seconds.
                </p>
            </section>
        </div>
    );
};
