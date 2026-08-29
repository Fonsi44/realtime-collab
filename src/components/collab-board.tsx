"use client";

import usePartySocket from "partysocket/react";
import { nanoid } from "nanoid";
import {
  Copy,
  Download,
  GripVertical,
  Link2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { JoinModal, getSavedCollabName } from "./join-modal";
import { ROOM_TEMPLATES } from "@/lib/room-templates";

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

const COLORS = ["#22d3ee", "#a78bfa", "#fbbf24", "#34d399", "#f472b6", "#fb923c"];
const NOTE_COLORS = ["#164e63", "#4c1d95", "#713f12", "#064e3b", "#831843", "#7c2d12"];

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

export function CollabBoard() {
  const searchParams = useSearchParams();
  const room = sanitizeRoom(searchParams.get("room"));
  const defaultName = `User-${Math.floor(Math.random() * 900 + 100)}`;
  const [identity, setIdentity] = useState<{ name: string; color: string } | null>(null);

  useEffect(() => {
    const saved = getSavedCollabName();
    if (saved) {
      setIdentity({ name: saved, color: randomFrom(COLORS) });
    }
  }, []);

  if (!identity) {
    return (
      <JoinModal
        defaultName={defaultName}
        colors={COLORS}
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
  const undoStack = useRef<Note[]>([]);

  const draggingRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

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
      color: randomFrom(NOTE_COLORS),
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

  const moveNote = (id: string, x: number, y: number) => {
    socket.send(JSON.stringify({ type: "note-move", id, x, y }));
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  };

  const deleteNote = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) undoStack.current.push(note);
    socket.send(JSON.stringify({ type: "note-delete", id }));
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setSelectedId(null);
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

  const setNoteColor = (id: string, noteColor: string) => {
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

  const uniqueUsers = [...new Set([name, ...cursors.map((c) => c.name)])];

  return (
    <div className="flex h-screen flex-col bg-[#5c4a32] pt-14">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-dashed border-yellow-400/30 bg-[#4a3828] px-6 py-3">
        <div>
          <h1 className="text-xl font-black text-yellow-100">Collab Board</h1>
          <p className="text-xs font-medium text-yellow-200/60">
            Sala <span className="font-mono text-yellow-300">{room}</span> · notas, colores y
            cursores en vivo
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={exportBoard}
            className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/30 px-3 py-1.5 text-[10px] font-bold text-yellow-200 transition hover:bg-yellow-400/10"
          >
            <Download className="h-3 w-3" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            onClick={copyRoomLink}
            className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/30 px-3 py-1.5 text-[10px] font-bold text-yellow-200 transition hover:bg-yellow-400/10"
          >
            {copied ? (
              "¡Copiado!"
            ) : (
              <>
                <Link2 className="h-3 w-3" aria-hidden="true" />
                Share room
              </>
            )}
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <Users className="h-3.5 w-3.5 text-yellow-300" aria-hidden="true" />
            <div className="flex -space-x-1">
              {uniqueUsers.slice(0, 5).map((u) => (
                <span
                  key={u}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#4a3828] bg-yellow-400 text-[9px] font-black text-[#3d2f1f]"
                  title={u}
                >
                  {u.slice(-2)}
                </span>
              ))}
            </div>
            <span className="text-xs text-yellow-200/60">{uniqueUsers.length} online</span>
          </div>
          <span
            className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400"}`}
            aria-label={connected ? "Conectado" : "Desconectado"}
          />
          <button
            type="button"
            onClick={addNote}
            className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-4 py-2 text-xs font-black text-[#3d2f1f] shadow-md transition hover:bg-yellow-300 focus-visible:ring-2 focus-visible:ring-yellow-500"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add Note
          </button>
        </div>
      </div>

      {selectedId && (
        <div className="flex items-center gap-3 border-b border-yellow-400/20 bg-[#3d2f1f] px-6 py-2">
          <span className="text-[10px] font-bold tracking-widest text-yellow-200/50 uppercase">
            Note tools
          </span>
          <div className="flex gap-1">
            {NOTE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                onClick={() => setNoteColor(selectedId, c)}
                className="h-5 w-5 rounded-full border-2 border-white/20 transition hover:scale-110"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => deleteNote(selectedId)}
            className="ml-auto inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
            Delete
          </button>
        </div>
      )}

      <div
        ref={boardRef}
        onMouseMove={handleMouseMove}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className="relative flex-1 overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,220,100,0.15) 1px, transparent 0)",
          backgroundSize: "24px 24px",
          backgroundColor: "#6b5344",
        }}
      >
        {notes.length === 0 && connected && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
            <div className="pointer-events-auto max-w-md rounded-2xl border-2 border-dashed border-yellow-400/30 bg-[#5c4a32]/90 px-8 py-6 text-center backdrop-blur-sm">
              <p className="text-lg font-black text-yellow-100">Board vacío</p>
              <p className="mt-1 text-sm text-yellow-200/60">
                Elige una plantilla o añade una nota · ⌘Z deshace borrados
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {ROOM_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => applyTemplate(t.id)}
                    className="rounded-full border border-yellow-400/40 px-3 py-1.5 text-[10px] font-bold text-yellow-200 hover:bg-yellow-400/10"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {notes.map((note) => (
          <div
            key={note.id}
            data-note
            className={`absolute w-48 rounded-xl border p-3 shadow-lg transition ${
              selectedId === note.id ? "border-yellow-300 ring-2 ring-yellow-400/40" : "border-white/10"
            }`}
            style={{
              left: `${note.x}%`,
              top: `${note.y}%`,
              backgroundColor: note.color,
            }}
            onClick={() => setSelectedId(note.id)}
          >
            <div
              className="mb-1 flex cursor-grab items-center justify-between active:cursor-grabbing"
              onPointerDown={(e) => startDrag(note.id, e)}
            >
              <p className="font-mono text-[10px] text-white/50">{note.user}</p>
              <GripVertical className="h-3 w-3 text-white/30" aria-hidden="true" />
            </div>
            <textarea
              value={note.text}
              onChange={(e) => updateNote(note.id, e.target.value)}
              onFocus={() => setSelectedId(note.id)}
              placeholder="Escribe algo…"
              className="w-full resize-none bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
              rows={3}
              spellCheck={false}
            />
          </div>
        ))}

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
              className="ml-3 rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.name}
            </span>
          </div>
        ))}

        {!connected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <p className="text-sm text-zinc-400">Conectando al servidor realtime…</p>
          </div>
        )}
      </div>

      <p className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 text-[10px] text-yellow-200/30 sm:block">
        <Copy className="mr-1 inline h-3 w-3" aria-hidden="true" />
        Comparte el enlace de la sala para colaborar en tiempo real
      </p>
    </div>
  );
}
