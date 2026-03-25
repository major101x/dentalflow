"use client";

import { useState, useEffect } from "react";
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
  const [claims, setClaims] = useState<ClaimRow[]>(initialClaims);

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
          <div className="text-right">
            <p className="text-xs text-gray-400">{c.claim_data.dateOfService ?? "—"}</p>
            <p className="text-xs text-gray-300">{new Date(c.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
