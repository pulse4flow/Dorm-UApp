"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; name: string };
type Input = { id?: string; title: string; summary: string; content: string; status: string; priority: string; publishAt?: string | null; expiresAt?: string | null; eventAt?: string | null; categoryId?: string | null; tagIds?: string[]; attachmentIds?: string[]; imageUrl?: string | null };
const blank: Input = { title: "", summary: "", content: "", status: "DRAFT", priority: "NORMAL", tagIds: [], attachmentIds: [] };
const datetime = (value?: string | null) => value ? new Date(value).toISOString().slice(0, 16) : "";

export function AnnouncementEditor({ initial }: { initial?: Input }) {
  const router = useRouter(); const [value, setValue] = useState<Input>(initial ?? blank); const [categories, setCategories] = useState<Option[]>([]); const [tags, setTags] = useState<Option[]>([]); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { Promise.all([fetch("/api/categories").then((r) => r.json()), fetch("/api/tags").then((r) => r.json())]).then(([c, t]) => { setCategories(c); setTags(t); }); }, []);
  const update = (key: keyof Input, value: string | string[]) => setValue((current) => ({ ...current, [key]: value }));
  async function upload(file: File, kind: "image" | "attachment") {
    const form = new FormData(); form.set("file", file); form.set("kind", kind);
    const response = await fetch("/api/uploads", { method: "POST", body: form });
    if (!response.ok) throw new Error((await response.json()).error);
    return response.json() as Promise<{ id?: string; url: string }>;
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const body = { ...value, categoryId: value.categoryId || null, publishAt: value.publishAt ? new Date(value.publishAt).toISOString() : null, expiresAt: value.expiresAt ? new Date(value.expiresAt).toISOString() : null, eventAt: value.eventAt ? new Date(value.eventAt).toISOString() : null };
      const response = await fetch(value.id ? `/api/announcements/${value.id}` : "/api/announcements", { method: value.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error((await response.json()).error ?? "Unable to save.");
      router.push("/admin/announcements"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save."); setSaving(false); }
  }
  return <form className="editor" onSubmit={submit}><label>Title<input value={value.title} onChange={(e) => update("title", e.target.value)} required /></label><label>Short description<textarea value={value.summary} onChange={(e) => update("summary", e.target.value)} required /></label><label>Full description<textarea rows={8} value={value.content} onChange={(e) => update("content", e.target.value)} required /></label><div className="editor-grid"><label>Category<select value={value.categoryId ?? ""} onChange={(e) => update("categoryId", e.target.value)}><option value="">None</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Priority<select value={value.priority} onChange={(e) => update("priority", e.target.value)}>{["NORMAL", "IMPORTANT", "URGENT"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Status<select value={value.status} onChange={(e) => update("status", e.target.value)}>{["DRAFT", "PUBLISHED", "ARCHIVED"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Publish date<input type="datetime-local" value={datetime(value.publishAt)} onChange={(e) => update("publishAt", e.target.value)} /></label><label>Expiry date<input type="datetime-local" value={datetime(value.expiresAt)} onChange={(e) => update("expiresAt", e.target.value)} /></label><label>Event/deadline<input type="datetime-local" value={datetime(value.eventAt)} onChange={(e) => update("eventAt", e.target.value)} /></label></div><fieldset><legend>Tags</legend>{tags.map((tag) => <label className="check" key={tag.id}><input type="checkbox" checked={value.tagIds?.includes(tag.id)} onChange={(event) => update("tagIds", event.target.checked ? [...(value.tagIds ?? []), tag.id] : (value.tagIds ?? []).filter((id) => id !== tag.id))} />#{tag.name}</label>)}</fieldset><label>Image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { update("imageUrl", (await upload(file, "image")).url); } catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed."); } }} /></label>{value.imageUrl && <img className="image-preview" src={value.imageUrl} alt="Selected announcement" />}<label>Attachment<input type="file" accept=".pdf,.docx,.xlsx,.zip,image/jpeg,image/png,image/webp" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { const attachment = await upload(file, "attachment"); if (attachment.id) update("attachmentIds", [...(value.attachmentIds ?? []), attachment.id]); } catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed."); } }} /></label>{value.attachmentIds?.length ? <p>{value.attachmentIds.length} attachment(s) ready to save.</p> : null}{error && <p className="form-error">{error}</p>}<button className="button" disabled={saving}>{saving ? "Saving…" : value.status === "DRAFT" ? "Save draft" : "Save announcement"}</button></form>;
}
