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
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
        No claims yet. Extract your first claim above.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {claims.map((c) => (
        <div key={c.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 text-sm">{c.claim_data.patientName ?? "Unknown patient"}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {c.claim_data.procedures.map((p) => p.cdtCode).join(", ")}
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <p className="text-xs text-gray-400">{c.claim_data.dateOfService ?? "—"}</p>
            <p className="text-xs text-gray-300">{c.created_at.slice(0, 10)}</p>
            {confirmingId === c.id ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Delete?</span>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  className="text-xs text-red-600 font-semibold hover:underline"
                >
                  {deletingId === c.id ? "..." : "Yes"}
                </button>
                <button onClick={() => setConfirmingId(null)} className="text-xs text-gray-400 hover:underline">
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingId(c.id)}
                className="text-xs text-gray-300 hover:text-red-400 transition-colors"
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
