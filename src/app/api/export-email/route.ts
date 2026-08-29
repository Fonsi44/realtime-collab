import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export const maxDuration = 25;

export async function POST(req: Request) {
  try {
    const { room, notes } = (await req.json()) as {
      room?: string;
      notes?: { text: string; user: string }[];
    };

    if (!notes?.length) return Response.json({ error: "notes required" }, { status: 400 });

    const summary = notes.map((n) => `- ${n.user}: ${n.text}`).join("\n");

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return Response.json({
        emailDraft: `Equipo,\n\nResumen del tablero ${room ?? "collab"}:\n${summary}\n\nSaludos`,
        fallback: true,
      });
    }

    const { text } = await generateText({
      model: google("gemini-3.6-flash"),
      prompt: `Write a short follow-up email in Spanish for the team after a collab session. Room: ${room}\nNotes:\n${summary}`,
    });

    return Response.json({ emailDraft: text.trim() });
  } catch (error) {
    console.error("[export-email]", error);
    return Response.json({ error: "Email draft failed" }, { status: 500 });
  }
}
