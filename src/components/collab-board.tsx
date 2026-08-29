"use client";

import usePartySocket from "partysocket/react";
import { nanoid } from "nanoid";
import { Plus, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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

function randomFrom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const PARTY_HOST =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "realtime-collab-party.fonsi44.partykit.dev";

export function CollabBoard() {
  const [name] = useState(() => `User-${Math.floor(Math.random() * 900 + 100)}`);
  const [color] = useState(() => randomFrom(COLORS));
  const [notes, setNotes] = useState<Note[]>([]);
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const [connected, setConnected] = useState(false);
  const socket = usePartySocket({
    host: PARTY_HOST,
    room: "portfolio-demo",
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
        setCursors((prev) => {
          const filtered = prev.filter((c) => c.id !== data.id);
          return [...filtered, data];
        });
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
    },
  });

  const boardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!boardRef.current || !connected) return;
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
  };

  const updateNote = (id: string, text: string) => {
    socket.send(JSON.stringify({ type: "note-update", id, text }));
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [socket]);

  return (
    <div className="flex h-screen flex-col bg-[#5c4a32] pt-14">
      <div className="flex items-center justify-between border-b-4 border-dashed border-yellow-400/30 bg-[#4a3828] px-6 py-3">
        <div>
          <h1 className="text-xl font-black text-yellow-100">Collab Playground</h1>
          <p className="text-xs font-medium text-yellow-200/60">
            Sticky notes + live cursors · abre 2 tabs para probar
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{cursors.length + 1} online</span>
            <span
              className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400"}`}
              aria-label={connected ? "Conectado" : "Desconectado"}
            />
          </div>
          <button
            onClick={addNote}
            className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-4 py-2 text-xs font-black text-[#3d2f1f] shadow-md transition hover:bg-yellow-300 focus-visible:ring-2 focus-visible:ring-yellow-500"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add Note
          </button>
        </div>
      </div>

      <div
        ref={boardRef}
        onMouseMove={handleMouseMove}
        className="relative flex-1 overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,220,100,0.15) 1px, transparent 0)",
          backgroundSize: "24px 24px",
          backgroundColor: "#6b5344",
        }}
      >
        {notes.map((note) => (
          <div
            key={note.id}
            className="absolute w-48 rounded-xl border border-white/10 p-3 shadow-lg"
            style={{
              left: `${note.x}%`,
              top: `${note.y}%`,
              backgroundColor: note.color,
            }}
          >
            <p className="mb-1 font-mono text-[10px] text-white/50">{note.user}</p>
            <textarea
              value={note.text}
              onChange={(e) => updateNote(note.id, e.target.value)}
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
            <p className="text-sm text-zinc-400">
              Conectando al servidor realtime…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
