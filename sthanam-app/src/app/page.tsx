'use client';

import { Sidebar } from "@/components/sidebar/Sidebar";
import { Poster } from "@/components/poster/Poster";

export default function Home() {
  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#f0ece1]">
      {/* Search/Controls Sidebar */}
      <Sidebar />

      {/* Main Preview Area */}
      <Poster />

      {/* Credits/Logo (Floating) */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none">
        <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">
          Sthanam
        </h1>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          Map Creator
        </span>
      </div>
    </main>
  );
}
