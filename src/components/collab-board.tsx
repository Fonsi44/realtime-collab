"use client";

import usePartySocket from "partysocket/react";
import { nanoid } from "nanoid";
import { Download, GripVertical, Link2, Palette, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { JoinModal, getSavedCollabName } from "./join-modal";
import {
  NOTE_COLORS,
  ROOM_TEMPLATES,
  noteColorById,
  type NoteColorId,
} from "@/lib/room-templates";

type Note = {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  user: string;
};

type Cursor = {
  id: string;
  x: number;
  y: number;
  name: string;
  color: string;
};

const CURSOR_COLORS = ["#22d3ee", "#a78bfa", "#34d399", "#f472b6", "#60a5fa", "#fb923c"];

const PARTY_HOST =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "portfolio-live-party.fonsi44.partykit.dev";

function randomFrom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sanitizeRoom(raw: string | null): string {
  if (!raw) return "collab";
  const cleaned = raw.replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 32);
  return cleaned || "collab";
}

function resolveNoteColor(color: string) {
  const byId = NOTE_COLORS.find((c) => c.id === color);
  if (byId) return byId;
  return { id: color, bg: "#18181b", accent: "#71717a" };
}

export function CollabBoard() {
  const searchParams = useSearchParams();
  const room = sanitizeRoom(searchParams.get("room"));
  const defaultName = `User-${Math.floor(Math.random() * 900 + 100)}`;
  const [identity, setIdentity] = useState<{ name: string; color: string } | null>(null);

  useEffect(() => {
    const saved = getSavedCollabName();
    if (saved) {
      setIdentity({ name: saved, color: randomFrom(CURSOR_COLORS) });
    }
  }, []);

  if (!identity) {
    return (
      <JoinModal
        defaultName={defaultName}
        colors={CURSOR_COLORS}
        onJoin={(name, color) => setIdentity({ name, color })}
      />
    );
  }

  return <CollabBoardInner room={room} name={identity.name} color={identity.color} />;
}

function CollabBoardInner({
  room,
  name,
  color,
}: {
  room: string;
  name: string;
  color: string;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const [connected, setConnected] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false);
  const undoStack = useRef<Note[]>([]);

  const draggingRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const socket = usePartySocket({
    host: PARTY_HOST,
    room,
    onOpen() {
      setConnected(true);
      socket.send(JSON.stringify({ type: "join", name, color }));
    },
    onClose() {
      setConnected(false);
    },
    onMessage(evt) {
      const data = JSON.parse(evt.data);

      if (data.type === "sync") {
        setNotes(data.notes);
        setCursors(data.cursors);
      }
      if (data.type === "cursor") {
        setCursors((prev) => [...prev.filter((c) => c.id !== data.id), data]);
      }
      if (data.type === "cursor-remove") {
        setCursors((prev) => prev.filter((c) => c.id !== data.id));
      }
      if (data.type === "note-add") {
        setNotes((prev) => {
          if (prev.some((n) => n.id === data.id)) return prev;
          return [...prev, data];
        });
      }
      if (data.type === "note-update") {
        setNotes((prev) =>
          prev.map((n) => (n.id === data.id ? { ...n, text: data.text } : n)),
        );
      }
      if (data.type === "note-move") {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === data.id ? { ...n, x: data.x, y: data.y } : n,
          ),
        );
      }
      if (data.type === "note-delete") {
        setNotes((prev) => prev.filter((n) => n.id !== data.id));
        if (selectedId === data.id) setSelectedId(null);
      }
      if (data.type === "note-color") {
        setNotes((prev) =>
          prev.map((n) => (n.id === data.id ? { ...n, color: data.color } : n)),
        );
      }
    },
  });

  usePartySocket({
    host: PARTY_HOST,
    room: "ecosystem",
    onOpen(evt) {
      const ws = evt.target as WebSocket;
      ws.send(
        JSON.stringify({ type: "ecosystem-join", name, color, app: "collab" }),
      );
    },
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!boardRef.current || !connected || draggingRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      socket.send(JSON.stringify({ type: "cursor", x, y, name, color }));
    },
    [connected, socket, name, color],
  );

  const addNote = () => {
    const note: Note = {
      id: nanoid(8),
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 50,
      text: "",
      color: randomFrom([...NOTE_COLORS]).id,
      user: name,
    };
    socket.send(JSON.stringify({ type: "note-add", ...note }));
    setNotes((prev) => [...prev, note]);
    setSelectedId(note.id);
  };

  const updateNote = (id: string, text: string) => {
    socket.send(JSON.stringify({ type: "note-update", id, text }));
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  };

  const deleteNote = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) undoStack.current.push(note);
    socket.send(JSON.stringify({ type: "note-delete", id }));
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setSelectedId(null);
    setColorPopoverOpen(false);
  };

  const undoDelete = () => {
    const note = undoStack.current.pop();
    if (!note) return;
    socket.send(JSON.stringify({ type: "note-add", ...note }));
    setNotes((prev) => [...prev, note]);
    setSelectedId(note.id);
  };

  const applyTemplate = (templateId: string) => {
    const tpl = ROOM_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    for (const n of tpl.notes) {
      const note: Note = {
        id: nanoid(8),
        x: n.x,
        y: n.y,
        text: n.text,
        color: n.color,
        user: name,
      };
      socket.send(JSON.stringify({ type: "note-add", ...note }));
      setNotes((prev) => [...prev, note]);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undoDelete();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const setNoteColor = (id: string, noteColor: NoteColorId) => {
    socket.send(JSON.stringify({ type: "note-color", id, color: noteColor }));
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, color: noteColor } : n)));
  };

  const startDrag = (id: string, e: React.PointerEvent) => {
    if (!boardRef.current) return;
    e.preventDefault();
    const noteEl = (e.currentTarget as HTMLElement).closest("[data-note]") as HTMLElement;
    const rect = boardRef.current.getBoundingClientRect();
    const note = notes.find((n) => n.id === id);
    if (!note || !noteEl) return;

    const noteRect = noteEl.getBoundingClientRect();
    draggingRef.current = {
      id,
      offsetX: ((e.clientX - noteRect.left) / rect.width) * 100,
      offsetY: ((e.clientY - noteRect.top) / rect.height) * 100,
    };
    setSelectedId(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current || !boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const { id, offsetX, offsetY } = draggingRef.current;
      const x = Math.max(
        0,
        Math.min(85, ((e.clientX - rect.left) / rect.width) * 100 - offsetX),
      );
      const y = Math.max(
        0,
        Math.min(85, ((e.clientY - rect.top) / rect.height) * 100 - offsetY),
      );
      socket.send(JSON.stringify({ type: "note-move", id, x, y }));
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
    },
    [socket],
  );

  const endDrag = () => {
    draggingRef.current = null;
  };

  const copyRoomLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${room}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportBoard = () => {
    const blob = new Blob([JSON.stringify({ room, notes, exportedAt: new Date().toISOString() }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `collab-${room}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [socket]);

  useEffect(() => {
    if (!colorPopoverOpen) return;
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setColorPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [colorPopoverOpen]);

  const uniqueUsers = [...new Set([name, ...cursors.map((c) => c.name)])];
  const selectedNote = notes.find((n) => n.id === selectedId);

  return (
    <div className="flex h-screen flex-col pt-[57px]">
      <div className="flex items-center gap-3 border-b border-white/5 bg-zinc-950/60 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-mono text-xs text-zinc-500">{room}</span>
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400"}`}
            aria-label={connected ? "Conectado" : "Desconectado"}
          />
        </div>

        <div className="flex items-center -space-x-1.5">
          {uniqueUsers.slice(0, 6).map((u, i) => {
            const cursor = cursors.find((c) => c.name === u);
            const userColor = u === name ? color : cursor?.color ?? "#71717a";
            return (
              <span
                key={u}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-950 font-mono text-[9px] font-medium text-zinc-950"
                style={{ backgroundColor: userColor, zIndex: 6 - i }}
                title={u}
              >
                {u.slice(0, 2).toUpperCase()}
              </span>
            );
          })}
          {uniqueUsers.length > 6 && (
            <span className="ml-2 font-mono text-[10px] text-zinc-600">
              +{uniqueUsers.length - 6}
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {selectedNote && (
            <div ref={popoverRef} className="relative">
              <button
                type="button"
                onClick={() => setColorPopoverOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 font-mono text-[10px] text-zinc-400 transition hover:border-cyan-500/30 hover:text-cyan-300"
                aria-expanded={colorPopoverOpen}
              >
                <Palette className="h-3 w-3" aria-hidden="true" />
                Color
              </button>
              {colorPopoverOpen && (
                <div className="absolute top-full right-0 z-50 mt-1.5 flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900 p-2 shadow-xl">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      aria-label={`Color ${c.id}`}
                      onClick={() => setNoteColor(selectedNote.id, c.id)}
                      className={`h-5 w-5 rounded-full border-2 transition hover:scale-110 ${
                        selectedNote.color === c.id ? "border-white" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.accent }}
                    />
                  ))}
                  <div className="mx-0.5 h-4 w-px bg-white/10" />
                  <button
                    type="button"
                    onClick={() => deleteNote(selectedNote.id)}
                    className="inline-flex items-center rounded p-1 text-red-400 transition hover:bg-red-500/10"
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={addNote}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/15 px-3 py-1.5 font-mono text-[10px] text-cyan-300 ring-1 ring-cyan-500/30 transition hover:bg-cyan-500/25"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            Add note
          </button>
          <button
            type="button"
            onClick={copyRoomLink}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 font-mono text-[10px] text-zinc-400 transition hover:border-cyan-500/30 hover:text-cyan-300"
          >
            <Link2 className="h-3 w-3" aria-hidden="true" />
            {copied ? "Copied" : "Share"}
          </button>
          <button
            type="button"
            onClick={exportBoard}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 font-mono text-[10px] text-zinc-400 transition hover:border-cyan-500/30 hover:text-cyan-300"
          >
            <Download className="h-3 w-3" aria-hidden="true" />
            Export
          </button>
        </div>
      </div>

      <div
        ref={boardRef}
        onMouseMove={handleMouseMove}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClick={() => {
          setSelectedId(null);
          setColorPopoverOpen(false);
        }}
        className="relative flex-1 overflow-hidden bg-zinc-950"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(34,211,238,0.12) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      >
        {notes.length === 0 && connected && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
            <div className="pointer-events-auto max-w-md rounded-2xl border border-white/10 bg-zinc-900/80 px-8 py-6 text-center backdrop-blur-sm">
              <p className="text-base font-semibold text-zinc-100">Board vacío</p>
              <p className="mt-1 text-sm text-zinc-500">
                Elige una plantilla o añade una nota · ⌘Z deshace borrados
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {ROOM_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => applyTemplate(t.id)}
                    className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-[10px] text-zinc-400 transition hover:border-cyan-500/30 hover:text-cyan-300"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {notes.map((note) => {
          const palette = resolveNoteColor(note.color);
          return (
            <div
              key={note.id}
              data-note
              className={`absolute w-48 rounded-xl border p-3 shadow-lg transition ${
                selectedId === note.id
                  ? "ring-2 ring-cyan-500/40"
                  : "hover:border-white/15"
              }`}
              style={{
                left: `${note.x}%`,
                top: `${note.y}%`,
                backgroundColor: palette.bg,
                borderColor: `${palette.accent}33`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(note.id);
              }}
            >
              <div
                className="mb-1 flex cursor-grab items-center justify-between active:cursor-grabbing"
                onPointerDown={(e) => startDrag(note.id, e)}
              >
                <p className="font-mono text-[10px]" style={{ color: `${palette.accent}99` }}>
                  {note.user}
                </p>
                <GripVertical className="h-3 w-3 text-zinc-600" aria-hidden="true" />
              </div>
              <textarea
                value={note.text}
                onChange={(e) => updateNote(note.id, e.target.value)}
                onFocus={() => setSelectedId(note.id)}
                placeholder="Escribe algo…"
                className="w-full resize-none bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
                rows={3}
                spellCheck={false}
              />
            </div>
          );
        })}

        {cursors.map((cursor) => (
          <div
            key={cursor.id}
            className="pointer-events-none absolute z-50 transition-all duration-75"
            style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
          >
            <svg width="16" height="20" viewBox="0 0 16 20" fill={cursor.color} aria-hidden="true">
              <path d="M0 0L0 16L4 12L7 19L10 18L7 11L14 11Z" />
            </svg>
            <span
              className="ml-3 rounded px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-950"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.name}
            </span>
          </div>
        ))}

        {!connected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <p className="font-mono text-sm text-zinc-400">Conectando al servidor realtime…</p>
          </div>
        )}
      </div>
    </div>
  );
}
