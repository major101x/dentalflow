"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AddPracticeForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [npi, setNpi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.from("practices").insert({
      name: name.trim(),
      npi: npi.trim() || null,
      user_id: userId,
    });

    if (error) {
      setError(error.message);
    } else {
      setName("");
      setNpi("");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Practice Name *
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Smile Dental Group"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          NPI (optional)
        </label>
        <input
          type="text"
          value={npi}
          onChange={(e) => setNpi(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="1234567890"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
      >
        {loading ? "Adding..." : "Add Practice"}
      </button>
    </form>
  );
}
