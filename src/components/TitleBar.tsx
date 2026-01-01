"use client";

import { Minimize2, Maximize2, X } from "lucide-react";

export default function TitleBar() {
  return (
    <div className="futuristic-border flex items-center justify-between h-12 px-4 bg-gradient-to-r from-background via-[#0a0a0a] to-background border-b border-[#00f2ff]/20">
      {/* Draggable Area */}
      <div
        className="flex-1 flex items-center gap-3 cursor-move"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {/* App Icon/Logo */}
        <div className="relative w-8 h-8">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="w-full h-full rounded-full border-2 border-[#00f2ff]/40 border-t-[#00f2ff] border-r-transparent" />
          </div>

          {/* Middle counter-rotating ring */}
          <div className="absolute inset-[3px] animate-spin-reverse">
            <div className="w-full h-full rounded-full border-2 border-[#bc13fe]/40 border-b-[#bc13fe] border-l-transparent" />
          </div>

          {/* Inner pulsing core */}
          <div className="absolute inset-[6px] animate-pulse-glow">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#00f2ff] to-[#bc13fe] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white animate-ping-slow" />
            </div>
          </div>

          {/* Corner accents */}
          <div className="absolute -top-0.5 -left-0.5 w-1 h-1 bg-[#00f2ff] rounded-full animate-pulse" />
          <div className="absolute -bottom-0.5 -right-0.5 w-1 h-1 bg-[#bc13fe] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* App Title */}
        <span className="text-sm font-semibold glowing-text tracking-wider">
          FLUXMAIL
        </span>

        {/* Decorative line */}
        <div className="flex-1 h-px bg-gradient-to-r from-[#00f2ff]/40 via-transparent to-transparent max-w-xs" />
      </div>

      {/* Window Controls */}
      <div
        className="flex items-center gap-2"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={() => window.electron?.minimize()}
          className="w-10 h-10 rounded flex items-center justify-center hover:bg-[#00f2ff]/10 transition-all duration-200 group"
          aria-label="Minimize"
        >
          <Minimize2 className="w-4 h-4 text-[#00f2ff]/60 group-hover:text-[#00f2ff] transition-colors" />
        </button>

        <button
          onClick={() => window.electron?.maximize()}
          className="w-10 h-10 rounded flex items-center justify-center hover:bg-[#bc13fe]/10 transition-all duration-200 group"
          aria-label="Maximize"
        >
          <Maximize2 className="w-4 h-4 text-[#bc13fe]/60 group-hover:text-[#bc13fe] transition-colors" />
        </button>

        <button
          onClick={() => window.electron?.close()}
          className="w-10 h-10 rounded flex items-center justify-center hover:bg-red-500/20 transition-all duration-200 group"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-red-400/60 group-hover:text-red-400 transition-colors" />
        </button>
      </div>
    </div>
  );
}
