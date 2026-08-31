"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { REPAIR_CATEGORIES, repairCategoryLabel } from "@/lib/repairs";

type SubmitResult = { ok: boolean; id?: string; error?: string };

export function MaintenanceForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setResult(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      room: String(form.get("room") ?? "").trim(),
      requesterName: String(form.get("requesterName") ?? "").trim() || null,
      category: String(form.get("category") ?? "OTHER"),
      title: String(form.get("title") ?? "").trim(),
      description: String(form.get("description") ?? "").trim(),
    };
    try {
      const response = await fetch("/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) return setResult({ ok: false, error: data?.error ?? "Something went wrong." });
      setResult({ ok: true, id: data?.id });
      event.currentTarget.reset();
      router.refresh();
    } catch {
      setResult({ ok: false, error: "Could not reach the server." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {result && (
        <div className={result.ok ? "form-success" : "form-error"}>
          {result.ok
            ? <>Request submitted — reference <strong>#{result.id?.slice(0, 8).toUpperCase()}</strong>. Our team will review it and update the status here.</>
            : result.error}
        </div>
      )}
      <form className="repair-form" onSubmit={submit}>
        <div className="editor-grid">
          <label>Room <input name="room" required maxLength={20} placeholder="E.g. B-512" autoComplete="off" /></label>
          <label>Your name (optional) <input name="requesterName" maxLength={80} placeholder="E.g. Anong" autoComplete="name" /></label>
        </div>
        <label>Category <select name="category" defaultValue="OTHER">{REPAIR_CATEGORIES.map((category) => <option key={category} value={category}>{repairCategoryLabel[category]}</option>)}</select></label>
        <label>Short title <input name="title" required minLength={3} maxLength={160} placeholder="E.g. Bathroom sink is leaking" autoComplete="off" /></label>
        <label>Details <textarea name="description" required minLength={3} maxLength={4000} rows={5} placeholder="What's broken, since when, anything we should know…" /></label>
        <button className="button" type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit request"}</button>
      </form>
    </>
  );
}