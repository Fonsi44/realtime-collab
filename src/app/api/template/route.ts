import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 30;

const schema = z.object({
  notes: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
      text: z.string(),
      color: z.string(),
    }),
  ),
});

export async function POST(req: Request) {
  try {
    const { prompt: userPrompt } = (await req.json()) as { prompt?: string };
    if (!userPrompt?.trim()) return Response.json({ error: "prompt required" }, { status: 400 });

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return Response.json({
        fallback: true,
        notes: [
          { x: 120, y: 100, text: "What went well?", color: "cyan" },
          { x: 320, y: 100, text: "What to improve?", color: "violet" },
          { x: 520, y: 100, text: "Action items", color: "emerald" },
        ],
      });
    }

    const { object } = await generateObject({
      model: google("gemini-3.6-flash"),
      schema,
      prompt: `Generate 4-8 sticky notes for a collaborative board based on: ${userPrompt}
Use colors: cyan, violet, emerald, rose, sky, amber. Spread x 80-700, y 80-400.`,
    });

    return Response.json(object);
  } catch (error) {
    console.error("[template]", error);
    return Response.json({ error: "Template failed" }, { status: 500 });
  }
}
