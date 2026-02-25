'use client';

import React, { useState } from 'react';
import {
    MapPin,
    Palette,
    Maximize2,
    Sliders,
    Download,
    Search,
    ChevronLeft,
    ChevronRight,
    Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePosterStore } from '@/store/usePosterStore';
import { LocationTab } from './LocationTab';
import { StyleTab } from './StyleTab';
import { SizeTab } from './SizeTab';
import { TweaksTab } from './TweaksTab';
import { ExportTab } from './ExportTab';

const TABS = [
    { id: 'location', icon: MapPin, label: 'Location' },
    { id: 'style', icon: Palette, label: 'Style' },
    { id: 'size', icon: Maximize2, label: 'Size' },
    { id: 'tweaks', icon: Sliders, label: 'Tweaks' },
    { id: 'export', icon: Download, label: 'Export' },
] as const;

export const Sidebar: React.FC = () => {
    const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('location');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-xl shadow-lg text-slate-600"
            >
                <Menu size={24} />
            </button>

            {/* Sidebar Container */}
            <motion.aside
                initial={false}
                animate={{ x: isSidebarOpen ? 0 : -320 }}
                className="fixed inset-y-0 left-0 z-40 w-[320px] m-4 bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden flex flex-col lg:relative lg:m-4"
            >
                {/* Header/Tabs */}
                <div className="flex border-b border-slate-100 p-2 gap-1 overflow-x-auto no-scrollbar">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 gap-1
                  ${isActive ? 'bg-accent text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                            >
                                <Icon size={20} />
                                <span className="text-[10px] font-bold uppercase tracking-tight">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-8 no-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'location' && <LocationTab />}
                            {activeTab === 'style' && <StyleTab />}
                            {activeTab === 'size' && <SizeTab />}
                            {activeTab === 'tweaks' && <TweaksTab />}
                            {activeTab === 'export' && <ExportTab />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Info */}
                <div className="p-4 border-t border-slate-100 bg-white/50">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                        <span>Sthanam Map Creator</span>
                        <span>V2.0</span>
                    </div>
                </div>
            </motion.aside>
        </>
    );
};
