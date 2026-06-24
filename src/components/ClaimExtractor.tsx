"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { cardClass } from "@/components/ui/Card";
import { inputClass } from "@/components/ui/Field";
import { ArrowRight } from "@/components/ui/icons";

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

export default function ClaimExtractor({
  practiceId,
  subscribed,
  remaining,
}: {
  practiceId: string;
  subscribed: boolean;
  remaining: number;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [copied, setCopied] = useState(false);

  const atLimit = !subscribed && (remaining <= 0 || limitReached);

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
      if (res.status === 402) {
        setLimitReached(true);
        setError(data.error || "Free extraction limit reached.");
        return;
      }
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
      <div className={`${cardClass} p-6 flex flex-col gap-4`}>
        <div className="flex items-center justify-between">
          <h2 className="gl-label">Clinical notes</h2>
          <button
            onClick={() => setNotes(SAMPLE_NOTES)}
            className="text-xs font-medium text-muted hover:text-ink transition-colors cursor-pointer"
          >
            Load sample
          </button>
        </div>
        <textarea
          className={`${inputClass} h-72 font-mono leading-relaxed resize-none`}
          placeholder="Paste the dentist's clinical notes here…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Button
          onClick={handleExtract}
          disabled={loading || !notes.trim() || atLimit}
          className="w-full"
        >
          {loading ? "Extracting…" : "Extract claim"}
        </Button>
        {!subscribed && !atLimit && (
          <p className="text-center text-xs text-muted">
            <span className="font-mono text-ink">{remaining}</span> free extraction
            {remaining === 1 ? "" : "s"} remaining
          </p>
        )}
        {atLimit ? (
          <div className="rounded-md border border-border border-l-2 border-l-accent bg-neutral px-4 py-3 text-sm text-ink">
            {error || "You've used all your free extractions."}{" "}
            <Link
              href="/pricing"
              className="group inline-flex items-center gap-1 font-medium text-accent hover:text-accent-hover cursor-pointer"
            >
              Subscribe to continue
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        ) : (
          error && <p className="text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Output */}
      <div className={`${cardClass} p-6 flex flex-col gap-4`}>
        <div className="flex items-center justify-between">
          <h2 className="gl-label">Claim summary</h2>
          {claim && (
            <button
              onClick={handleCopy}
              className="text-xs font-medium text-accent hover:text-accent-hover transition-colors cursor-pointer"
            >
              {copied ? "Copied" : "Copy all"}
            </button>
          )}
        </div>

        {!claim && !loading && (
          <div className="flex-1 flex items-center justify-center text-sm text-muted h-72">
            Claim details will appear here.
          </div>
        )}

        {loading && (
          <div className="flex-1 flex flex-col gap-3 h-72 animate-pulse" aria-hidden="true">
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 rounded-md bg-neutral" />
              <div className="h-10 rounded-md bg-neutral" />
              <div className="h-10 rounded-md bg-neutral" />
              <div className="h-10 rounded-md bg-neutral" />
            </div>
            <div className="h-16 rounded-md bg-neutral" />
            <div className="h-16 rounded-md bg-neutral" />
          </div>
        )}

        {claim && (
          <div className="text-sm space-y-5 overflow-y-auto max-h-80">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Field label="Patient" value={claim.patientName} />
              <Field label="Date of service" value={claim.dateOfService} />
              <Field label="Provider" value={claim.provider} />
              <Field label="Tooth numbers" value={claim.toothNumbers.join(", ") || null} />
            </div>

            <div>
              <p className="gl-label mb-2">Procedures</p>
              <div className="space-y-2">
                {claim.procedures.map((p, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-border bg-neutral px-3 py-2 flex items-start gap-3"
                  >
                    <span className="font-mono font-medium text-ink text-sm whitespace-nowrap">
                      {p.cdtCode}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-ink">{p.description}</p>
                      {(p.toothNumber || p.fee) && (
                        <p className="text-muted text-xs mt-0.5">
                          {p.toothNumber ? `Tooth #${p.toothNumber}` : ""}
                          {p.toothNumber && p.fee ? " · " : ""}
                          {p.fee ? `Fee: ${p.fee}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {claim.diagnosisCodes.length > 0 && (
              <Field label="Diagnosis codes" value={claim.diagnosisCodes.join(", ")} />
            )}

            {claim.notes && (
              <div>
                <p className="gl-label mb-1">Notes</p>
                <p className="text-muted leading-relaxed">{claim.notes}</p>
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
      <p className="gl-label">{label}</p>
      <p className="text-ink mt-0.5">{value || "—"}</p>
    </div>
  );
}
