"use client";

import { useState, useEffect } from "react";
import { Can } from "../../../../../components/Can";
import { PlusCircle, Calendar, MessageSquare, GripVertical } from "lucide-react";

/**
 * Optimistic Kanban Board
 */
const COLUMNS = [
  { id: "TODO", title: "To Do", color: "border-zinc-700 bg-zinc-900/50" },
  { id: "IN_PROGRESS", title: "In Progress", color: "border-brand-primary/50 bg-brand-primary/10" },
  { id: "DONE", title: "Done", color: "border-emerald-500/50 bg-emerald-500/10" },
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

export default function ProjectTasksTab({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Drag state
  const [draggedTaskId, setDraggedTaskId] = useState(null);

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

  // Handle Drag & Drop with Optimistic UI Update
  async function handleDrop(e, targetStatus) {
    e.preventDefault();
    if (!draggedTaskId) return;

    const taskToUpdate = tasks.find(t => t.id === draggedTaskId);
    if (!taskToUpdate || taskToUpdate.status === targetStatus) return;

    // Optimistic Update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === draggedTaskId ? { ...t, status: targetStatus } : t))
    );
    setDraggedTaskId(null);

    // API Call
    const res = await fetch(`/api/tasks/${draggedTaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: targetStatus }),
    });

    if (!res.ok) {
      // Revert on failure
      setTasks(previousTasks);
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
      <div className="flex animate-pulse gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 flex-1 rounded-2xl bg-zinc-900 border border-zinc-800" />
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-300">Kanban Board</h2>
        <Can permission="createTask">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-full bg-brand-primary px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            {showForm ? "Cancel" : <><PlusCircle className="h-4 w-4" /> Add Task</>}
          </button>
        </Can>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddTask}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4"
        >
          <input
            type="text"
            required
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-50 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50"
          />
          <div className="flex flex-wrap gap-4">
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none transition-all focus:border-brand-primary"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={form.assigneeId}
              onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none transition-all focus:border-brand-primary"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={form.dueDate ? form.dueDate.split('T')[0] : ''}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none transition-all focus:border-brand-primary [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
          {formError && <p className="text-xs text-rose-400 font-medium">{formError}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-brand-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {submitting ? "Adding..." : "Create Task"}
            </button>
          </div>
        </form>
      )}

      {/* Kanban Board Grid */}
      <div className="grid gap-6 md:grid-cols-3 min-h-[500px] overflow-auto pb-4">
        {COLUMNS.map(col => {
          const columnTasks = tasks.filter(t => t.status === col.id);
          
          return (
            <div
              key={col.id}
              className={`flex flex-col rounded-2xl border ${col.color} p-4`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="mb-4 flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-zinc-200">{col.title}</h3>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950/50 text-xs font-medium text-zinc-400">
                  {columnTasks.length}
                </span>
              </div>

              <div className="flex-1 space-y-3">
                {columnTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedTaskId(task.id)}
                    className="group relative cursor-grab active:cursor-grabbing rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-4 shadow-sm transition-all hover:border-brand-primary/50 hover:shadow-brand-primary/10 hover:-translate-y-0.5"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug text-zinc-100">
                        {task.title}
                      </p>
                      <Can permission="updateTask">
                        <GripVertical className="h-4 w-4 shrink-0 text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Can>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-2">
                         <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider
                          ${task.priority === "HIGH" ? "bg-rose-500/10 text-rose-400" :
                            task.priority === "MEDIUM" ? "bg-amber-500/10 text-amber-400" :
                            "bg-emerald-500/10 text-emerald-400"
                          }
                        `}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>

                      {task.assignee && (
                        <div 
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-300 ring-2 ring-zinc-950"
                          title={task.assignee?.name}
                        >
                          {task.assignee?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-zinc-700/50 text-xs font-medium text-zinc-600">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
