"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnnouncementView } from "@/components/announcement-card";
import { localState } from "@/lib/local";

export function BookmarksWidget({ initial }: { initial: AnnouncementView[] }) {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  useEffect(() => {
    setBookmarks(localState.ids("bookmarkedAnnouncements"));
    const sync = () => setBookmarks(localState.ids("bookmarkedAnnouncements"));
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const preview = initial.filter((item) => bookmarks.includes(item.id)).slice(0, 3);
  return (
    <section className="dash-card widget">
      <div className="widget-heading">
        <h2>Bookmarks</h2>
        <Link href="/bookmarks">Manage</Link>
      </div>
      <p className="widget-subtext">{bookmarks.length} saved announcement{bookmarks.length === 1 ? "" : "s"} on this device.</p>
      {preview.length === 0 && <div className="empty compact">Bookmark announcements to pin them here — saved locally in your browser.</div>}
      <ul className="widget-list">
        {preview.map((item) => (
          <li key={item.id}>
            <span className="task-dot" />
            <Link href={`/announcements/${item.id}`}>{item.title}</Link>
          </li>
        ))}
      </ul>
      <Link className="button secondary" href="/bookmarks">Open Bookmarks</Link>
    </section>
  );
}