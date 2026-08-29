export const ROOM_TEMPLATES = [
  {
    id: "retro",
    name: "Sprint Retro",
    notes: [
      { x: 15, y: 20, text: "✅ What went well", color: "#064e3b" },
      { x: 40, y: 20, text: "⚠️ What to improve", color: "#713f12" },
      { x: 65, y: 20, text: "💡 Action items", color: "#4c1d95" },
    ],
  },
  {
    id: "brainstorm",
    name: "Brainstorm",
    notes: [
      { x: 20, y: 25, text: "Idea 1 — ", color: "#164e63" },
      { x: 45, y: 35, text: "Idea 2 — ", color: "#831843" },
      { x: 30, y: 55, text: "Wild idea — ", color: "#7c2d12" },
    ],
  },
  {
    id: "kanban",
    name: "Mini Kanban",
    notes: [
      { x: 10, y: 30, text: "To Do", color: "#713f12" },
      { x: 38, y: 30, text: "Doing", color: "#164e63" },
      { x: 66, y: 30, text: "Done", color: "#064e3b" },
    ],
  },
] as const;
