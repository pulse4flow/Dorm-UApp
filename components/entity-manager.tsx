"use client";
import { FormEvent, useEffect, useState } from "react";
type Entity = { id: string; name: string; color?: string };
export function EntityManager({ kind }: { kind: "categories" | "tags" }) {
  const [items, setItems] = useState<Entity[]>([]); const [name, setName] = useState(""); const [error, setError] = useState("");
  const load = () => fetch(`/api/${kind}`).then((res) => res.json()).then(setItems);
  useEffect(() => { void load(); }, [kind]);
  async function add(event: FormEvent) {
    event.preventDefault(); setError("");
    const response = await fetch(`/api/${kind}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, ...(kind === "categories" ? { color: "#2563eb" } : {}) }) });
    if (!response.ok) { setError((await response.json()).error ?? "Could not save."); return; }
    setName(""); load();
  }
  async function remove(id: string) { if (confirm("Delete this item?")) { await fetch(`/api/${kind}/${id}`, { method: "DELETE" }); load(); } }
  return <section className="admin-panel"><form className="inline-form" onSubmit={add}><input value={name} onChange={(event) => setName(event.target.value)} placeholder={`New ${kind.slice(0, -1)}`} required /><button className="button">Add</button></form>{error && <p className="form-error">{error}</p>}<div className="entity-list">{items.map((item) => <div key={item.id}><span className="dot" style={{ backgroundColor: item.color }} />{item.name}<button onClick={() => remove(item.id)}>Delete</button></div>)}</div></section>;
}
