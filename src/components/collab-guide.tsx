"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { HelpCircle, Sparkles, X } from "lucide-react";
import {
  GUIDE_STEPS,
  GUIDE_STORAGE_KEY,
  type GuideAction,
  type GuideStep,
} from "@/lib/collab-guide-steps";

export type GuideProgress = {
  addedNote: boolean;
  editedNote: boolean;
  draggedNote: boolean;
  changedColor: boolean;
  shared: boolean;
  appliedTemplate: boolean;
};

type Props = {
  progress: GuideProgress;
  active: boolean;
  onActiveChange: (active: boolean) => void;
  onRequestHelp?: () => void;
};

function actionDone(action: GuideAction, progress: GuideProgress): boolean {
  switch (action) {
    case "add-note":
      return progress.addedNote;
    case "edit-note":
      return progress.editedNote;
    case "drag-note":
      return progress.draggedNote;
    case "change-color":
      return progress.changedColor;
    case "share":
      return progress.shared;
    case "template":
      return progress.appliedTemplate;
    default:
      return true;
  }
}

function waitingLabel(step: GuideStep): string {
  switch (step.action) {
    case "add-note":
      return "Pulsa «Añadir nota»";
    case "edit-note":
      return "Escribe en la nota";
    case "drag-note":
      return "Arrastra la nota";
    case "change-color":
      return "Cambia el color";
    case "share":
      return "Pulsa «Compartir»";
    case "template":
      return "Elige una plantilla";
    default:
      return step.cta;
  }
}

export function CollabGuide({ progress, active, onActiveChange, onRequestHelp }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = GUIDE_STEPS[stepIndex];
  const isLast = stepIndex === GUIDE_STEPS.length - 1;
  const waiting = step.action !== "none" && !actionDone(step.action, progress);
  const canAdvance = !waiting;

  const updateRect = useCallback(() => {
    if (!step.target || step.position === "center") {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(`[data-guide="${step.target}"]`);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [step]);

  useEffect(() => {
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    const id = setInterval(updateRect, 400);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      clearInterval(id);
    };
  }, [updateRect, stepIndex, active]);

  useEffect(() => {
    if (!active || !waiting) return;
    if (actionDone(step.action, progress)) {
      const t = setTimeout(() => setStepIndex((i) => Math.min(i + 1, GUIDE_STEPS.length - 1)), 600);
      return () => clearTimeout(t);
    }
  }, [progress, active, waiting, step.action]);

  const finish = () => {
    localStorage.setItem(GUIDE_STORAGE_KEY, "1");
    onActiveChange(false);
  };

  const start = () => {
    setStepIndex(0);
    onActiveChange(true);
  };

  const next = () => {
    if (isLast) {
      finish();
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const back = () => setStepIndex((i) => Math.max(0, i - 1));

  if (!active) {
    return (
      <button
        type="button"
        onClick={start}
        data-guide="help-btn"
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-zinc-950/90 px-4 py-2.5 font-mono text-xs text-cyan-300 shadow-lg shadow-cyan-500/10 backdrop-blur-xl transition hover:bg-cyan-500/10 focus-visible:ring-2 focus-visible:ring-cyan-400"
        aria-label="Iniciar guía interactiva"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Guía interactiva
      </button>
    );
  }

  const tooltipStyle = (): CSSProperties => {
    if (!targetRect || step.position === "center") {
      return {};
    }
    const pad = 12;
    switch (step.position) {
      case "bottom":
        return {
          top: targetRect.bottom + pad,
          left: Math.min(Math.max(targetRect.left, 16), window.innerWidth - 340),
        };
      case "top":
        return {
          bottom: window.innerHeight - targetRect.top + pad,
          left: Math.min(Math.max(targetRect.left, 16), window.innerWidth - 340),
        };
      case "right":
        return {
          top: targetRect.top,
          left: Math.min(targetRect.right + pad, window.innerWidth - 340),
        };
      case "left":
        return {
          top: targetRect.top,
          right: window.innerWidth - targetRect.left + pad,
        };
      default:
        return {};
    }
  };

  return (
    <>
      {targetRect && step.position !== "center" && (
        <>
          <div
            className="pointer-events-none fixed z-[55] rounded-xl"
            style={{
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.72)",
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none fixed z-[56] animate-pulse rounded-xl ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#030306]"
            style={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
            }}
            aria-hidden="true"
          />
        </>
      )}

      {(!targetRect || step.position === "center") && (
        <div className="fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm" aria-hidden="true" />
      )}

      <div
        role="dialog"
        aria-labelledby="guide-title"
        className={`fixed z-[70] w-[min(100vw-2rem,22rem)] rounded-2xl border border-white/10 bg-zinc-950/95 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl ${
          step.position === "center"
            ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            : ""
        }`}
        style={step.position !== "center" ? tooltipStyle() : undefined}
      >
        <button
          type="button"
          onClick={finish}
          className="absolute right-3 top-3 rounded-lg p-1 text-zinc-500 transition hover:text-zinc-300"
          aria-label="Cerrar guía"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest text-cyan-400/80 uppercase">
            Paso {stepIndex + 1} / {GUIDE_STEPS.length}
          </span>
          <div className="flex flex-1 gap-1">
            {GUIDE_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition ${
                  i <= stepIndex ? "bg-cyan-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        <h2 id="guide-title" className="pr-6 text-base font-semibold text-zinc-100">
          {step.title}
        </h2>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-zinc-400">{step.body}</p>

        {waiting && (
          <p className="mt-3 flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 font-mono text-[11px] text-cyan-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            {waitingLabel(step)}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={back}
              className="rounded-lg border border-white/10 px-3 py-2 font-mono text-[11px] text-zinc-400 transition hover:border-white/20"
            >
              Atrás
            </button>
          )}
          {step.skippable && waiting && (
            <button
              type="button"
              onClick={next}
              className="rounded-lg border border-white/10 px-3 py-2 font-mono text-[11px] text-zinc-500 transition hover:text-zinc-300"
            >
              Saltar paso
            </button>
          )}
          <button
            type="button"
            onClick={next}
            disabled={!canAdvance}
            className="ml-auto rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 font-mono text-[11px] font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {waiting ? waitingLabel(step) : isLast ? "¡Listo!" : "Siguiente"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            finish();
            onRequestHelp?.();
          }}
          className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] text-zinc-600 transition hover:text-cyan-400"
        >
          <HelpCircle className="h-3 w-3" aria-hidden="true" />
          Ver referencia completa
        </button>
      </div>
    </>
  );
}

export function shouldAutoStartGuide(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(GUIDE_STORAGE_KEY);
}

export function resetCollabGuide() {
  localStorage.removeItem(GUIDE_STORAGE_KEY);
}
