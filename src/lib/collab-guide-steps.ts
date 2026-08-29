export type GuideAction =
  | "none"
  | "join"
  | "add-note"
  | "edit-note"
  | "drag-note"
  | "select-note"
  | "change-color"
  | "share"
  | "template"
  | "open-help";

export type GuideStep = {
  id: string;
  title: string;
  body: string;
  cta: string;
  target?: string;
  action: GuideAction;
  position?: "top" | "bottom" | "left" | "right" | "center";
  skippable?: boolean;
};

export const GUIDE_STEPS: GuideStep[] = [
  {
    id: "welcome",
    title: "Bienvenido a Collab Board",
    body: "Un tablero colaborativo en tiempo real. Varias personas pueden ver las mismas notas, moverlas y escribir a la vez — como un mural digital compartido.",
    cta: "Empezar tour",
    action: "none",
    position: "center",
  },
  {
    id: "toolbar",
    title: "Tu barra de herramientas",
    body: "Arriba tienes el nombre de la sala, quién está conectado y las acciones principales. El punto verde significa que estás conectado al servidor en vivo.",
    cta: "Entendido",
    target: "toolbar",
    action: "none",
    position: "bottom",
  },
  {
    id: "add-note",
    title: "Crea tu primera nota",
    body: "Pulsa «Añadir nota». Aparecerá un post-it en el tablero. Haz click en el botón resaltado.",
    cta: "Esperando…",
    target: "add-note",
    action: "add-note",
    position: "bottom",
  },
  {
    id: "edit-note",
    title: "Escribe dentro de la nota",
    body: "Haz click en el área de texto y escribe algo — una idea, una tarea, lo que quieras. Todos en la sala lo verán al instante.",
    cta: "Esperando texto…",
    target: "board-note",
    action: "edit-note",
    position: "right",
  },
  {
    id: "drag-note",
    title: "Arrastra para reorganizar",
    body: "Coge la nota por la barra superior (icono ≡) y arrástrala por el tablero. Su posición se sincroniza con el resto de usuarios.",
    cta: "Esperando arrastre…",
    target: "board-note",
    action: "drag-note",
    position: "right",
    skippable: true,
  },
  {
    id: "color",
    title: "Cambia el color",
    body: "Con la nota seleccionada, pulsa «Color» y elige un tono. Sirve para categorizar: verde = hecho, ámbar = pendiente, etc.",
    cta: "Esperando color…",
    target: "color-btn",
    action: "change-color",
    position: "bottom",
    skippable: true,
  },
  {
    id: "share",
    title: "Invita a tu equipo",
    body: "Pulsa «Compartir» para copiar el enlace de la sala. Ábrelo en otra pestaña o envíalo a alguien — veréis los cursores y cambios en vivo.",
    cta: "Esperando compartir…",
    target: "share-btn",
    action: "share",
    position: "bottom",
  },
  {
    id: "template",
    title: "O empieza con una plantilla",
    body: "¿Tablero vacío? Elige Sprint Retro, Brainstorm o Mini Kanban para cargar notas de ejemplo y editarlas.",
    cta: "Esperando plantilla…",
    target: "templates",
    action: "template",
    position: "top",
    skippable: true,
  },
  {
    id: "multiplayer",
    title: "Prueba el modo multijugador",
    body: "Abre esta misma URL en otra pestaña del navegador. Verás un segundo cursor con otro nombre — así funciona la colaboración real.",
    cta: "Genial, continuar",
    target: "users",
    action: "none",
    position: "bottom",
  },
  {
    id: "shortcuts",
    title: "Atajos útiles",
    body: "⌘Z (Ctrl+Z) deshace el último borrado · «Exportar» descarga el tablero en JSON · Click fuera de una nota para deseleccionar.",
    cta: "Finalizar tour",
    action: "none",
    position: "center",
  },
];

export const GUIDE_STORAGE_KEY = "collab-guide-completed";

export const HELP_SECTIONS = [
  {
    title: "¿Qué es esto?",
    body: "Collab Board es un tablero de notas adhesivas sincronizado en tiempo real. Ideal para retros, brainstorms y planificación rápida en equipo.",
  },
  {
    title: "Notas",
    items: [
      "Añadir nota — crea un post-it nuevo",
      "Escribir — click en el texto, edita libremente",
      "Mover — arrastra por la barra superior",
      "Color — selecciona la nota → botón Color",
      "Borrar — Color → icono papelera",
    ],
  },
  {
    title: "Salas y colaboración",
    items: [
      "Cada URL con ?room=nombre es una sala distinta",
      "Compartir copia el enlace actual",
      "Todos ven las mismas notas al instante",
      "Los cursores de colores muestran dónde está cada persona",
    ],
  },
  {
    title: "Plantillas",
    items: [
      "Sprint Retro — qué fue bien, mejorar, acciones",
      "Brainstorm — ideas sueltas para iterar",
      "Mini Kanban — To Do, Doing, Done",
    ],
  },
  {
    title: "Atajos",
    items: ["⌘Z / Ctrl+Z — deshacer borrado", "Export — descarga JSON del tablero"],
  },
] as const;
