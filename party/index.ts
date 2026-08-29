import type * as Party from "partykit/server";

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

export default class CollabServer implements Party.Server {
  notes = new Map<string, Note>();
  cursors = new Map<string, Cursor>();

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    conn.send(
      JSON.stringify({
        type: "sync",
        notes: [...this.notes.values()],
        cursors: [...this.cursors.values()],
      }),
    );
  }

  onMessage(raw: string, sender: Party.Connection) {
    const data = JSON.parse(raw) as Record<string, unknown>;

    if (data.type === "cursor") {
      const cursor: Cursor = {
        id: sender.id,
        x: data.x as number,
        y: data.y as number,
        name: data.name as string,
        color: data.color as string,
      };
      this.cursors.set(sender.id, cursor);
      this.room.broadcast(JSON.stringify({ type: "cursor", ...cursor }), [sender.id]);
    }

    if (data.type === "note-add") {
      const note = data as unknown as Note;
      this.notes.set(note.id, note);
      this.room.broadcast(JSON.stringify({ type: "note-add", ...note }));
    }

    if (data.type === "note-update") {
      const note = this.notes.get(data.id as string);
      if (note) {
        note.text = data.text as string;
        this.room.broadcast(
          JSON.stringify({ type: "note-update", id: note.id, text: note.text }),
        );
      }
    }

    if (data.type === "note-move") {
      const note = this.notes.get(data.id as string);
      if (note) {
        note.x = data.x as number;
        note.y = data.y as number;
        this.room.broadcast(
          JSON.stringify({ type: "note-move", id: note.id, x: note.x, y: note.y }),
        );
      }
    }

    if (data.type === "join") {
      sender.setState({ name: data.name, color: data.color });
    }

    if (data.type === "presence") {
      this.room.broadcast(
        JSON.stringify({
          type: "presence",
          user: data.name,
          action: data.action,
          noteId: data.noteId,
        }),
        [sender.id],
      );
    }
  }

  onClose(conn: Party.Connection) {
    this.cursors.delete(conn.id);
    this.room.broadcast(JSON.stringify({ type: "cursor-remove", id: conn.id }));
  }
}

CollabServer satisfies Party.Worker;
