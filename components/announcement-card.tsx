"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Countdown } from "@/components/countdown";
import { localState } from "@/lib/local";

export type AnnouncementView = {
  id: string; title: string; summary: string; priority: string; publishAt: string | Date | null;
  expiresAt: string | Date | null; eventAt: string | Date | null; imageUrl: string | null;
  category: { name: string; color: string } | null; tags: { tag: { id: string; name: string } }[]; attachments: { id: string }[];
};

export function AnnouncementCard({ announcement }: { announcement: AnnouncementView }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [read, setRead] = useState(false);
  useEffect(() => {
    setBookmarked(localState.ids("bookmarkedAnnouncements").includes(announcement.id));
    setRead(localState.ids("readAnnouncements").includes(announcement.id));
  }, [announcement.id]);
  const toggle = (key: "bookmarkedAnnouncements" | "readAnnouncements") => {
    localState.toggleId(key, announcement.id);
    key === "bookmarkedAnnouncements" ? setBookmarked((value) => !value) : setRead((value) => !value);
  };
  return <article className={`announcement-card ${read ? "is-read" : ""} priority-${announcement.priority.toLowerCase()}`}>
    {announcement.imageUrl && <img src={announcement.imageUrl} alt="" className="announcement-image" />}
    <div className="card-body">
      <div className="card-meta">{announcement.category && <span className="category" style={{ backgroundColor: announcement.category.color }}>{announcement.category.name}</span>} {announcement.priority !== "NORMAL" && <strong>{announcement.priority}</strong>}</div>
      <h3><Link href={`/announcements/${announcement.id}`}>{announcement.title}</Link></h3>
      <p>{announcement.summary}</p>
      <div className="tags">{announcement.tags.map(({ tag }) => <Link href={`/search?q=${encodeURIComponent(tag.name)}`} key={tag.id}>#{tag.name}</Link>)}</div>
      <div className="details"><span>Published {announcement.publishAt ? new Date(announcement.publishAt).toLocaleDateString() : "now"}</span>{announcement.eventAt && <Countdown target={String(announcement.eventAt)} />}{announcement.attachments.length > 0 && <span>📎 {announcement.attachments.length}</span>}</div>
      <div className="card-actions"><Link className="button secondary" href={`/announcements/${announcement.id}`}>Read more</Link><button onClick={() => toggle("bookmarkedAnnouncements")} aria-pressed={bookmarked}>{bookmarked ? "★ Bookmarked" : "☆ Bookmark"}</button><button onClick={() => toggle("readAnnouncements")}>{read ? "Mark unread" : "Mark read"}</button></div>
    </div>
  </article>;
}
