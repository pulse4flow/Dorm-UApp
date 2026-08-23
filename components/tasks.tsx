"use client";

import { FormEvent, useState } from "react";
import { localState, PersonalTask } from "@/lib/local";

export function Tasks() {
  const [tasks, setTasks] = useState<PersonalTask[]>(() => localState.tasks());
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const save = (next: PersonalTask[]) => { setTasks(next); localState.saveTasks(next); };
  const add = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    save([{ id: crypto.randomUUID(), title: title.trim(), dueAt: dueAt || undefined, priority: "normal", completed: false }, ...tasks]);
    setTitle(""); setDueAt("");
  };
  return <section className="task-panel"><form onSubmit={add} className="task-add"><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Add a personal task" aria-label="Task title" /><input type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} aria-label="Due date" /><button className="button">Add task</button></form><div className="task-list">{tasks.map((task) => <label className={task.completed ? "task done" : "task"} key={task.id}><input type="checkbox" checked={task.completed} onChange={() => save(tasks.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item))} /><span>{task.title}</span>{task.dueAt && <small>Due {new Date(task.dueAt).toLocaleDateString()}</small>}<button aria-label={`Delete ${task.title}`} onClick={() => save(tasks.filter((item) => item.id !== task.id))}>×</button></label>)}{tasks.length === 0 && <div className="empty">Add a task to keep track of your own to-dos. These stay in this browser only.</div>}</div></section>;
}
