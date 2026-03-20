"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, X, Palette } from "lucide-react";

const PROJECT_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#a855f7", // Purple
];

import { createProject } from "@/actions/project.js";
import Modal from "@/components/Modal";

export default function CreateProjectButton({ clientMembers = [] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#6366f1",
    clientUserId: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          color: form.color,
          clientUserId: form.clientUserId || null,
        }),
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.error || "Failed to create project");
      }

      setSuccess(true);
      setForm({ name: "", description: "", color: "#6366f1", clientUserId: "" });
      
      router.refresh();

      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 1500);

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-xs font-medium text-white shadow-lg shadow-brand-primary/20 transition-all hover:opacity-90 hover:shadow-xl hover:shadow-brand-primary/30"
      >
        <PlusCircle className="h-3.5 w-3.5" />
        New Project
      </button>

      <Modal 
        open={open} 
        onClose={() => setOpen(false)} 
        title="Start a New Project"
      >
        <p className="mb-6 -mt-4 text-xs text-zinc-500 font-medium">
          Fill in the details below to initialize your project space.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project Name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
              Project Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 outline-none transition-all placeholder:text-zinc-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="What's this project about?"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full resize-none rounded-xl border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 outline-none transition-all placeholder:text-zinc-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
              <Palette className="h-3 w-3" />
              Project Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color }))}
                  className={`h-8 w-8 rounded-full transition-all hover:scale-110 ${
                    form.color === color
                      ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110"
                      : "ring-1 ring-zinc-700"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Assign Client */}
          {clientMembers.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
                Assign to Client (optional)
              </label>
              <select
                value={form.clientUserId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, clientUserId: e.target.value }))
                }
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 outline-none transition-all focus:border-brand-primary"
              >
                <option value="">No client assigned</option>
                {clientMembers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 px-4 py-3 text-xs font-medium text-emerald-300">
              Project created successfully!
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 px-4 py-3 text-xs font-medium text-rose-300">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-200 dark:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-brand-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-primary/20 transition-all hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
