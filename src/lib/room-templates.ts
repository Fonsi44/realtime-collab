export const NOTE_COLORS = [
  { id: "cyan", bg: "#152428", accent: "#22d3ee" },
  { id: "violet", bg: "#1f1a2e", accent: "#a78bfa" },
  { id: "emerald", bg: "#152822", accent: "#34d399" },
  { id: "rose", bg: "#281a22", accent: "#f472b6" },
  { id: "sky", bg: "#1a2430", accent: "#60a5fa" },
  { id: "amber", bg: "#282018", accent: "#fbbf24" },
] as const;

export type NoteColorId = (typeof NOTE_COLORS)[number]["id"];

export function noteColorById(id: string) {
  return NOTE_COLORS.find((c) => c.id === id) ?? NOTE_COLORS[0];
}

export function noteColorBg(id: string) {
  return noteColorById(id).bg;
}

export const ROOM_TEMPLATES = [
  {
    id: "retro",
    name: "Sprint Retro",
    notes: [
      { x: 15, y: 20, text: "✅ What went well", color: "emerald" },
      { x: 40, y: 20, text: "⚠️ What to improve", color: "amber" },
      { x: 65, y: 20, text: "💡 Action items", color: "violet" },
    ],
  },
  {
    id: "brainstorm",
    name: "Brainstorm",
    notes: [
      { x: 20, y: 25, text: "Idea 1 — ", color: "cyan" },
      { x: 45, y: 35, text: "Idea 2 — ", color: "rose" },
      { x: 30, y: 55, text: "Wild idea — ", color: "violet" },
    ],
  },
  {
    id: "kanban",
    name: "Mini Kanban",
    notes: [
      { x: 10, y: 30, text: "To Do", color: "amber" },
      { x: 38, y: 30, text: "Doing", color: "cyan" },
      { x: 66, y: 30, text: "Done", color: "emerald" },
    ],
  },
] as const;
