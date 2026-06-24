"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { inputClass, Label } from "@/components/ui/Field";

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
    <form onSubmit={handleSubmit} className="bg-surface rounded-lg border border-border p-5 space-y-4">
      <div>
        <Label htmlFor="practice-name">Practice name *</Label>
        <input
          id="practice-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Smile Dental Group"
        />
      </div>
      <div>
        <Label htmlFor="practice-npi">NPI (optional)</Label>
        <input
          id="practice-npi"
          type="text"
          value={npi}
          onChange={(e) => setNpi(e.target.value)}
          className={inputClass}
          placeholder="1234567890"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Adding…" : "Add practice"}
      </Button>
    </form>
  );
}
