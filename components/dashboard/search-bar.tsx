"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function DashboardSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };
  return (
    <form className="dash-search" onSubmit={submit} role="search">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search announcements, categories, tags…"
        aria-label="Search DormDash"
      />
      <button className="button" type="submit">Search</button>
    </form>
  );
}