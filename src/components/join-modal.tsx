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
        className="w-full max-w-sm rounded-2xl border-4 border-yellow-400/40 bg-[#4a3828] p-6 shadow-2xl"
      >
        <h2 id="join-title" className="text-xl font-black text-yellow-100">
          Join the board
        </h2>
        <p className="mt-1 text-sm text-yellow-200/60">
          Elige tu nombre y color. Se guardará para futuras visitas.
        </p>
        <label className="mt-4 block">
          <span className="text-xs font-bold text-yellow-300/70">Display name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-yellow-400/30 bg-[#3d2f1f] px-3 py-2 text-sm text-yellow-100 outline-none focus:border-yellow-400"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>
        <p className="mt-4 text-xs font-bold text-yellow-300/70">Cursor color</p>
        <div className="mt-2 flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full border-2 transition ${
                color === c ? "scale-110 border-white" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={submit}
          className="mt-6 w-full rounded-full bg-yellow-400 py-2.5 text-sm font-black text-[#3d2f1f] hover:bg-yellow-300"
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
