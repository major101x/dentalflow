"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Procedure = {
  cdtCode: string;
  description: string;
  toothNumber: string | null;
  fee: string | null;
};

type Claim = {
  patientName: string | null;
  dateOfService: string | null;
  provider: string | null;
  toothNumbers: string[];
  procedures: Procedure[];
  diagnosisCodes: string[];
  notes: string;
};

const SAMPLE_NOTES = `Patient: John Smith, DOB 04/12/1980
Date: 03/25/2026
Provider: Dr. Sarah Lee

Chief complaint: Tooth sensitivity upper right, cracked filling on #19.

Exam findings:
- Comprehensive oral exam performed
- Full mouth series X-rays taken (18 images)
- Tooth #3: decay noted on mesial surface, recommend composite restoration
- Tooth #19: existing amalgam fractured, replaced with full gold crown prep today — temporary crown placed
- Prophy performed, moderate calculus removed

Plan: Return in 3 weeks for crown seat #19. Monitor #3.`;

export default function ClaimExtractor({ practiceId }: { practiceId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleExtract() {
    setLoading(true);
    setError("");
    setClaim(null);

    try {
      const res = await fetch("/api/extract-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, practiceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setClaim(data.claim);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!claim) return;
    const lines = [
      `Patient: ${claim.patientName ?? "—"}`,
      `Date of Service: ${claim.dateOfService ?? "—"}`,
      `Provider: ${claim.provider ?? "—"}`,
      `Tooth Numbers: ${claim.toothNumbers.join(", ") || "—"}`,
      "",
      "Procedures:",
      ...claim.procedures.map(
        (p) =>
          `  ${p.cdtCode}  ${p.description}${p.toothNumber ? `  Tooth #${p.toothNumber}` : ""}${p.fee ? `  Fee: ${p.fee}` : ""}`
      ),
      "",
      `Diagnosis Codes: ${claim.diagnosisCodes.join(", ") || "—"}`,
      "",
      `Notes: ${claim.notes}`,
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Clinical Notes</h2>
          <button onClick={() => setNotes(SAMPLE_NOTES)} className="text-xs text-blue-600 hover:underline">
            Load sample
          </button>
        </div>
        <textarea
          className="w-full h-72 border border-gray-200 rounded-lg p-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          placeholder="Paste dentist's clinical notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button
          onClick={handleExtract}
          disabled={loading || !notes.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {loading ? "Extracting..." : "Extract Claim"}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {/* Output */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Claim Summary</h2>
          {claim && (
            <button onClick={handleCopy} className="text-xs text-blue-600 hover:underline">
              {copied ? "Copied!" : "Copy all"}
            </button>
          )}
        </div>

        {!claim && !loading && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm h-72">
            Claim details will appear here.
          </div>
        )}

        {loading && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm h-72 animate-pulse">
            Analyzing notes...
          </div>
        )}

        {claim && (
          <div className="text-sm space-y-4 overflow-y-auto max-h-80">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Patient" value={claim.patientName} />
              <Field label="Date of Service" value={claim.dateOfService} />
              <Field label="Provider" value={claim.provider} />
              <Field label="Tooth Numbers" value={claim.toothNumbers.join(", ") || null} />
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Procedures</p>
              <div className="space-y-2">
                {claim.procedures.map((p, i) => (
                  <div key={i} className="bg-blue-50 rounded-lg px-3 py-2 flex items-start gap-3">
                    <span className="font-mono font-bold text-blue-700 text-sm whitespace-nowrap">{p.cdtCode}</span>
                    <div className="flex-1">
                      <p className="text-gray-800">{p.description}</p>
                      <p className="text-gray-400 text-xs">
                        {p.toothNumber ? `Tooth #${p.toothNumber}` : ""}
                        {p.toothNumber && p.fee ? " · " : ""}
                        {p.fee ? `Fee: ${p.fee}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {claim.diagnosisCodes.length > 0 && (
              <Field label="Diagnosis Codes" value={claim.diagnosisCodes.join(", ")} />
            )}

            {claim.notes && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-gray-600">{claim.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-gray-800">{value || "—"}</p>
    </div>
  );
}
