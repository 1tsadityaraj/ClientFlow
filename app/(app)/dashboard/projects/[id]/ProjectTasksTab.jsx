"use client";

import { useState, useEffect } from "react";
import { Can } from "../../../../../components/Can";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

function TaskSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="h-4 w-8 rounded bg-zinc-700" />
      <div className="h-4 flex-1 rounded bg-zinc-700" />
      <div className="h-6 w-20 rounded bg-zinc-700" />
    </div>
  );
}

export default function ProjectTasksTab({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    priority: "MEDIUM",
    assigneeId: "",
    dueDate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadTasks() {
    const res = await fetch(`/api/projects/${projectId}/tasks`, {
      cache: "no-store",
    });
    if (!res.ok) {
      setError("Failed to load tasks");
      return;
    }
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : []);
  }

  async function loadMembers() {
    const res = await fetch("/api/members", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setMembers(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([loadTasks(), loadMembers()]).finally(() => setLoading(false));
  }, [projectId]);

  async function handleStatusChange(taskId, newStatus) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    }
  }

  async function handleAddTask(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    const body = {
      title: form.title.trim(),
      priority: form.priority,
      assigneeId: form.assigneeId || null,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    };
    const res = await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setFormError(data.error || "Failed to create task");
      return;
    }
    setTasks((prev) => [...prev, data]);
    setForm({ title: "", priority: "MEDIUM", assigneeId: "", dueDate: "" });
    setShowForm(false);
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <TaskSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-300">Tasks</h2>
        <Can permission="createTask">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-400"
          >
            {showForm ? "Cancel" : "Add Task"}
          </button>
        </Can>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddTask}
          className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3"
        >
          <input
            type="text"
            required
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-indigo-500"
          />
          <div className="flex flex-wrap gap-3">
            <select
              value={form.priority}
              onChange={(e) =>
                setForm((f) => ({ ...f, priority: e.target.value }))
              }
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              value={form.assigneeId}
              onChange={(e) =>
                setForm((f) => ({ ...f, assigneeId: e.target.value }))
              }
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50"
            />
          </div>
          {formError && (
            <p className="text-xs text-rose-400">{formError}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
          >
            {submitting ? "Adding..." : "Add Task"}
          </button>
        </form>
      )}

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3"
          >
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(task.id, e.target.value)}
              className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="min-w-0 flex-1 text-sm font-medium text-zinc-50">
              {task.title}
            </span>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] uppercase text-zinc-400">
              {task.priority}
            </span>
            {task.dueDate && (
              <span className="text-xs text-zinc-500">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </li>
        ))}
        {tasks.length === 0 && !showForm && (
          <li className="rounded-xl border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-500">
            No tasks yet.
          </li>
        )}
      </ul>
    </div>
  );
}
