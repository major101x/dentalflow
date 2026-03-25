import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { notes, practiceId } = await req.json();

    if (!notes || typeof notes !== "string" || notes.trim().length === 0) {
      return NextResponse.json({ error: "Clinical notes are required." }, { status: 400 });
    }

    if (!practiceId) {
      return NextResponse.json({ error: "practiceId is required." }, { status: 400 });
    }

    // Validate session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
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

    let claim;
    try {
      claim = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response.", raw }, { status: 500 });
    }

    // Save to DB
    await supabase.from("claims").insert({
      practice_id: practiceId,
      user_id: user.id,
      raw_notes: notes,
      claim_data: claim,
    });

    return NextResponse.json({ claim });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
