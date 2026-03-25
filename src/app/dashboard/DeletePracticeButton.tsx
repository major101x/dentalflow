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
        <span className="text-xs text-gray-500">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-red-600 font-semibold hover:underline"
        >
          {loading ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-gray-400 hover:underline"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); setConfirming(true); }}
      className="text-xs text-gray-300 hover:text-red-400 transition-colors"
    >
      Delete
    </button>
  );
}
