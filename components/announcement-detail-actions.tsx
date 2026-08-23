"use client";
import { useEffect, useState } from "react";
import { localState } from "@/lib/local";
export function AnnouncementDetailActions({ id }: { id: string }) {
  const [bookmarked, setBookmarked] = useState(false);
  useEffect(() => setBookmarked(localState.ids("bookmarkedAnnouncements").includes(id)), [id]);
  return <button className="button" onClick={() => { localState.toggleId("bookmarkedAnnouncements", id); setBookmarked((value) => !value); }}>{bookmarked ? "★ Bookmarked" : "☆ Bookmark"}</button>;
}
