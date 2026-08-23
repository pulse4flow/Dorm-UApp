"use client";

import { useEffect, useMemo, useState } from "react";
import { AnnouncementCard, AnnouncementView } from "@/components/announcement-card";
import { localState } from "@/lib/local";

type Props = { initial: AnnouncementView[]; title?: string; bookmarkedOnly?: boolean; initialQuery?: string };
export function AnnouncementBrowser({ initial, title = "Announcements", bookmarkedOnly = false, initialQuery = "" }: Props) {
  const [items, setItems] = useState(initial);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const cached = localState.cache<AnnouncementView[]>();
    if (cached?.length) setItems(cached);
    fetch("/api/announcements").then(async (response) => {
      if (!response.ok) throw new Error("Unable to update");
      const fresh = await response.json() as AnnouncementView[];
      localState.cache(fresh); setItems(fresh); setOffline(false);
    }).catch(() => setOffline(true));
  }, []);
  const categories = [...new Set(items.map((item) => item.category?.name).filter(Boolean))] as string[];
  const filtered = useMemo(() => {
    const bookmarks = bookmarkedOnly ? localState.ids("bookmarkedAnnouncements") : null;
    const lower = query.toLowerCase();
    return items.filter((item) => (!bookmarks || bookmarks.includes(item.id)) && (!category || category === "all" || item.category?.name === category) &&
      (!lower || [item.title, item.summary, item.category?.name, ...item.tags.map(({ tag }) => tag.name)].some((value) => value?.toLowerCase().includes(lower))))
      .sort((a, b) => sort === "oldest" ? +new Date(String(a.publishAt)) - +new Date(String(b.publishAt)) : sort === "deadline" ? +new Date(String(a.eventAt ?? "9999-01-01")) - +new Date(String(b.eventAt ?? "9999-01-01")) : +new Date(String(b.publishAt)) - +new Date(String(a.publishAt)));
  }, [items, query, category, sort, bookmarkedOnly]);
  return <section className="content">
    <div className="page-heading"><div><p className="eyebrow">Official information</p><h1>{title}</h1></div><span className="sync">{offline ? "Offline — cached information" : "✓ Updated just now"}</span></div>
    <div className="filters"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search announcements, categories, tags…" aria-label="Search announcements" />{query && <button onClick={() => setQuery("")}>Clear</button>}<select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category"><option value="all">All categories</option>{categories.map((name) => <option key={name}>{name}</option>)}</select><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="deadline">Deadline soonest</option></select></div>
    <p className="result-count">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>
    <div className="feed">{filtered.map((announcement) => <AnnouncementCard key={announcement.id} announcement={announcement} />)}{filtered.length === 0 && <div className="empty">No announcements match these filters.</div>}</div>
  </section>;
}
