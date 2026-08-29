"use client";

import { useState } from "react";
import { ArrowRight, Users } from "lucide-react";

const STORAGE_KEY = "collab-display-name";

type Props = {
  defaultName: string;
  colors: string[];
  room: string;
  onJoin: (name: string, color: string) => void;
};

export function JoinModal({ defaultName, colors, room, onJoin }: Props) {
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
        className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur-xl"
      >
        <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-400/70 uppercase">
          Collab Board
        </p>
        <h2 id="join-title" className="mt-1 text-xl font-semibold text-zinc-100">
          Entra al tablero
        </h2>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-zinc-400">
          Un mural de notas adhesivas en <strong className="text-zinc-300">tiempo real</strong>.
          Escribe, mueve post-its y colabora con tu equipo. Al entrar verás una{" "}
          <strong className="text-cyan-300/90">guía paso a paso</strong> que te enseña todo.
        </p>

        <div className="mt-4 rounded-xl border border-white/8 bg-zinc-950/60 p-3">
          <p className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase">Sala</p>
          <p className="mt-0.5 font-mono text-sm text-cyan-300">{room}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Misma sala = mismas notas. Comparte el enlace para invitar a otros.
          </p>
        </div>

        <label className="mt-5 block">
          <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
            Tu nombre
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            placeholder="Ej. Alfons"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>

        <p className="mt-4 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
          Color de tu cursor
        </p>
        <div className="mt-2 flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full border-2 transition ${
                color === c ? "scale-110 border-white" : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={submit}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 py-3 text-sm font-semibold text-zinc-950 transition hover:from-cyan-300 hover:to-cyan-400"
        >
          Entrar y empezar guía
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-zinc-600">
          <Users className="h-3 w-3" aria-hidden="true" />
          Tip: abre otra pestaña con el mismo enlace para ver cursores en vivo
        </p>
      </div>
    </div>
  );
}

export function getSavedCollabName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}
