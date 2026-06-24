"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ClaimRow = {
  id: string;
  claim_data: {
    patientName: string | null;
    dateOfService: string | null;
    procedures: { cdtCode: string; description: string }[];
  };
  created_at: string;
};

export default function ClaimHistory({
  initialClaims,
  practiceId,
}: {
  initialClaims: ClaimRow[];
  practiceId: string;
}) {
  const router = useRouter();
  const [claims, setClaims] = useState<ClaimRow[]>(initialClaims);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  async function handleDelete(claimId: string) {
    setDeletingId(claimId);
    const supabase = createClient();
    await supabase.from("claims").delete().eq("id", claimId);
    setClaims((prev) => prev.filter((c) => c.id !== claimId));
    setDeletingId(null);
    setConfirmingId(null);
    router.refresh();
  }

  useEffect(() => {
    setClaims(initialClaims);
  }, [initialClaims]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`claims:${practiceId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "claims", filter: `practice_id=eq.${practiceId}` },
        (payload) => {
          setClaims((prev) => [payload.new as ClaimRow, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [practiceId]);

  if (claims.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
        No claims yet. Extract your first claim above.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {claims.map((c) => (
        <div key={c.id} className="bg-surface rounded-lg border border-border px-5 py-3.5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium text-ink text-sm truncate">{c.claim_data.patientName ?? "Unknown patient"}</p>
            <p className="gl-label mt-1 truncate">
              {c.claim_data.procedures.map((p) => p.cdtCode).join(", ")}
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-1 shrink-0">
            <p className="text-xs text-muted">{c.claim_data.dateOfService ?? "—"}</p>
            <p className="gl-label">{c.created_at.slice(0, 10)}</p>
            {confirmingId === c.id ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Delete?</span>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  className="text-xs font-medium text-red-600 hover:underline cursor-pointer disabled:opacity-50"
                >
                  {deletingId === c.id ? "…" : "Yes"}
                </button>
                <button onClick={() => setConfirmingId(null)} className="text-xs text-muted hover:text-ink cursor-pointer">
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingId(c.id)}
                aria-label="Delete claim"
                className="text-xs text-muted/60 hover:text-red-600 transition-colors cursor-pointer"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
