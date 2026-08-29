import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 30;

const retroSchema = z.object({
  themes: z.array(
    z.object({
      title: z.string(),
      noteIds: z.array(z.string()),
      summary: z.string(),
    }),
  ),
  actionItems: z.array(
    z.object({
      text: z.string(),
      owner: z.string().optional(),
      priority: z.enum(["high", "medium", "low"]),
    }),
  ),
  emailDraft: z.string(),
});

export async function POST(req: Request) {
  try {
    const { notes, room } = (await req.json()) as {
      notes?: { id: string; text: string; color: string; user: string }[];
      room?: string;
    };

    if (!notes?.length) {
      return Response.json({ error: "notes array required" }, { status: 400 });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return Response.json({
        fallback: true,
        themes: [{ title: "General", noteIds: notes.map((n) => n.id), summary: "Mock retro summary." }],
        actionItems: [{ text: "Follow up on top themes", priority: "medium" }],
        emailDraft: `Retro summary for room ${room ?? "collab"} — configure API key for live Gemini output.`,
      });
    }

    const { object } = await generateObject({
      model: google("gemini-3.6-flash"),
      schema: retroSchema,
      prompt: `You are a sprint retro facilitator. Group these sticky notes into themes, extract action items, and draft a short follow-up email in Spanish.

Notes JSON:
${JSON.stringify(notes)}`,
    });

    return Response.json(object);
  } catch (error) {
    console.error("[retro]", error);
    return Response.json({ error: "Retro failed" }, { status: 500 });
  }
}
