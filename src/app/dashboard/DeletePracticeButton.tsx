"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeletePracticeButton({ practiceId }: { practiceId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("practices").delete().eq("id", practiceId);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
        <span className="text-xs text-muted">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-medium text-red-600 hover:underline cursor-pointer disabled:opacity-50"
        >
          {loading ? "…" : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-muted hover:text-ink cursor-pointer"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); setConfirming(true); }}
      aria-label="Delete practice"
      className="text-xs text-muted/60 hover:text-red-600 transition-colors cursor-pointer"
    >
      Delete
    </button>
  );
}
