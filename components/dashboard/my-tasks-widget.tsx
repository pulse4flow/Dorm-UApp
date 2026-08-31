"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { localState, PersonalTask } from "@/lib/local";

export function MyTasksWidget() {
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  useEffect(() => {
    setTasks(localState.tasks());
    const sync = () => setTasks(localState.tasks());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const open = tasks.filter((task) => !task.completed);
  const preview = open.slice(0, 3);
  return (
    <section className="dash-card widget">
      <div className="widget-heading">
        <h2>My tasks</h2>
        <Link href="/tasks">Manage</Link>
      </div>
      <p className="widget-subtext">{open.length} open of {tasks.length} on this device.</p>
      {preview.length === 0 && <div className="empty compact">No open tasks — add some on the tasks page. They stay in this browser only.</div>}
      <ul className="widget-list">
        {preview.map((task) => (
          <li key={task.id}>
            <span className="task-dot" />
            <span>{task.title}</span>
            {task.dueAt && <small>Due {new Date(task.dueAt).toLocaleDateString()}</small>}
          </li>
        ))}
      </ul>
      <Link className="button secondary" href="/tasks">Open My tasks</Link>
    </section>
  );
}