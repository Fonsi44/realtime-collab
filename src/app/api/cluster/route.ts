import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 30;

const schema = z.object({
  clusters: z.array(
    z.object({
      theme: z.string(),
      noteIds: z.array(z.string()),
      color: z.string(),
    }),
  ),
});

export async function POST(req: Request) {
  try {
    const { notes } = (await req.json()) as {
      notes?: { id: string; text: string; x: number; y: number }[];
    };
    if (!notes?.length) return Response.json({ clusters: [] });

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      const half = Math.ceil(notes.length / 2);
      return Response.json({
        fallback: true,
        clusters: [
          { theme: "Positivo", noteIds: notes.slice(0, half).map((n) => n.id), color: "emerald" },
          { theme: "Mejoras", noteIds: notes.slice(half).map((n) => n.id), color: "violet" },
        ],
      });
    }

    const { object } = await generateObject({
      model: google("gemini-3.6-flash"),
      schema,
      prompt: `Group sticky notes into 2-4 retro themes. Notes:\n${JSON.stringify(notes)}`,
    });

    return Response.json(object);
  } catch (error) {
    console.error("[cluster]", error);
    return Response.json({ error: "Cluster failed" }, { status: 500 });
  }
}
