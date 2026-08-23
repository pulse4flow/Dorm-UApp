"use client";

export type PersonalTask = { id: string; title: string; dueAt?: string; priority: "normal" | "important"; completed: boolean };

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)) as T; } catch { return fallback; }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const localState = {
  ids: (key: "bookmarkedAnnouncements" | "readAnnouncements" | "hiddenAnnouncements") => read<string[]>(key, []),
  toggleId(key: "bookmarkedAnnouncements" | "readAnnouncements" | "hiddenAnnouncements", id: string) {
    const ids = this.ids(key);
    write(key, ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  },
  tasks: () => read<PersonalTask[]>("personalTasks", []),
  saveTasks: (tasks: PersonalTask[]) => write("personalTasks", tasks),
  cache: <T,>(value?: T) => value === undefined ? read<T | null>("announcementCache", null) : write("announcementCache", value),
};
