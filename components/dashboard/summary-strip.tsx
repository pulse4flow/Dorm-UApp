"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { localState } from "@/lib/local";

export function DashboardSummary({ announcementCount }: { announcementCount: number }) {
  const [tasks, setTasks] = useState(0);
  const [bookmarks, setBookmarks] = useState(0);

  useEffect(() => {
    setTasks(localState.tasks().filter((task) => !task.completed).length);
    setBookmarks(localState.ids("bookmarkedAnnouncements").length);
  }, []);

  const items = [
    { href: "/announcements", value: announcementCount, label: "Announcements", note: "Official updates" },
    { href: "/tasks", value: tasks, label: "Open tasks", note: "Saved on this device" },
    { href: "/bookmarks", value: bookmarks, label: "Bookmarks", note: "Your saved notices" },
    { href: "/maintenance", value: "→", label: "Maintenance", note: "Report an issue" },
  ];

  return <div className="summary-strip" aria-label="DormDash summary">
    {items.map((item, index) => <Link className="summary-card" href={item.href} key={item.href} style={{ "--delay": `${index * 55}ms` } as React.CSSProperties}>
      <strong>{item.value}</strong><span>{item.label}</span><small>{item.note}</small>
    </Link>)}
  </div>;
}
