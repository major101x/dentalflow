import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { notes } = await req.json();

    if (!notes || typeof notes !== "string" || notes.trim().length === 0) {
      return NextResponse.json({ error: "Clinical notes are required." }, { status: 400 });
    }

    const result = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a dental billing expert. Extract the billing information from the following clinical notes and return a JSON object only — no explanation, no markdown.

The JSON must have this exact shape:
{
  "patientName": string or null,
  "dateOfService": string or null,
  "provider": string or null,
  "toothNumbers": string[],
  "procedures": [
    {
      "cdtCode": string,
      "description": string,
      "toothNumber": string or null,
      "fee": string or null
    }
  ],
  "diagnosisCodes": string[],
  "notes": string
}

CDT codes follow the format D#### (e.g. D0120, D2750, D7140). Use the most accurate CDT codes based on the procedures described. If a procedure is ambiguous, pick the most likely code and note it.

Clinical notes:
${notes}`,
    });

    const raw = result.text ?? "";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

    try {
      const claim = JSON.parse(cleaned);
      return NextResponse.json({ claim });
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response.", raw }, { status: 500 });
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
