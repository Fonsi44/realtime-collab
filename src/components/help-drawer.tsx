"use client";

import { BookOpen, Keyboard, Layers, Users, X } from "lucide-react";
import { HELP_SECTIONS } from "@/lib/collab-guide-steps";

type Props = {
  open: boolean;
  onClose: () => void;
  onRestartGuide: () => void;
};

const ICONS = [BookOpen, Layers, Users, Layers, Keyboard];

export function HelpDrawer({ open, onClose, onRestartGuide }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-labelledby="help-title"
        className="relative flex h-full w-full max-w-md flex-col border-l border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div>
            <p className="font-mono text-[10px] tracking-widest text-cyan-400/70 uppercase">
              Centro de ayuda
            </p>
            <h2 id="help-title" className="text-lg font-semibold text-zinc-100">
              Cómo usar Collab Board
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300"
            aria-label="Cerrar ayuda"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {HELP_SECTIONS.map((section, i) => {
            const Icon = ICONS[i] ?? BookOpen;
            return (
              <section key={section.title} className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-cyan-500/80" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-zinc-200">{section.title}</h3>
                </div>
                {"body" in section && (
                  <p className="text-pretty text-sm leading-relaxed text-zinc-500">{section.body}</p>
                )}
                {"items" in section && (
                  <ul className="mt-2 space-y-1.5">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-sm text-zinc-400 before:mt-2 before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-cyan-500/60 before:content-['']"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <p className="text-sm font-medium text-cyan-300">Truco multijugador</p>
            <p className="mt-1 text-pretty text-sm text-zinc-400">
              Copia el enlace con «Compartir» y ábrelo en otra pestaña. Verás dos cursores distintos
              moviéndose — así demuestras la colaboración en vivo.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 p-5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onRestartGuide();
            }}
            className="w-full rounded-xl border border-cyan-500/30 bg-cyan-500/10 py-3 font-mono text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20"
          >
            Repetir guía interactiva
          </button>
        </div>
      </aside>
    </div>
  );
}
