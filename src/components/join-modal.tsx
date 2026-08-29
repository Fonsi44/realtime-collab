"use client";

import { useState } from "react";

const STORAGE_KEY = "collab-display-name";

type Props = {
  defaultName: string;
  colors: string[];
  onJoin: (name: string, color: string) => void;
};

export function JoinModal({ defaultName, colors, onJoin }: Props) {
  const [name, setName] = useState(defaultName);
  const [color, setColor] = useState(colors[0]);

  const submit = () => {
    const trimmed = name.trim() || defaultName;
    localStorage.setItem(STORAGE_KEY, trimmed);
    onJoin(trimmed, color);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-labelledby="join-title"
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur-xl"
      >
        <h2 id="join-title" className="text-lg font-semibold text-zinc-100">
          Join the board
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Elige tu nombre y color. Se guardará para futuras visitas.
        </p>
        <label className="mt-5 block">
          <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
            Display name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>
        <p className="mt-4 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
          Cursor color
        </p>
        <div className="mt-2 flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full border-2 transition ${
                color === c ? "scale-110 border-white" : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={submit}
          className="mt-6 w-full rounded-lg bg-cyan-500/15 py-2.5 text-sm font-medium text-cyan-300 ring-1 ring-cyan-500/30 transition hover:bg-cyan-500/25"
        >
          Enter board
        </button>
      </div>
    </div>
  );
}

export function getSavedCollabName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}
