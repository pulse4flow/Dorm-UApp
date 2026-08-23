"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminAuthForm({ register = false }: { register?: boolean }) {
  const router = useRouter(); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch(`/api/auth/${register ? "register" : "login"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    setBusy(false);
    if (response.ok) router.push("/admin"); else setError((await response.json()).error ?? "Unable to continue.");
  }
  return <form className="auth-form" onSubmit={submit}><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Password<input name="password" type="password" minLength={12} required autoComplete={register ? "new-password" : "current-password"} /></label>{register && <label>Registration key<input name="registrationKey" type="password" required /></label>}{error && <p className="form-error">{error}</p>}<button className="button" disabled={busy}>{busy ? "Please wait…" : register ? "Create admin account" : "Log in"}</button></form>;
}
