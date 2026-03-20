"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Can } from "../../../../../components/Can";
import ProjectTasksTab from "./ProjectTasksTab";
import ProjectFilesTab from "./ProjectFilesTab";
import ProjectDiscussionsTab from "./ProjectDiscussionsTab";
import ProjectActivityTab from "./ProjectActivityTab";
import {
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  FileText,
  Trash2,
  AlertTriangle,
  Users,
} from "lucide-react";
import Modal from "../../../../../components/Modal";
import Breadcrumb from "../../../../../components/Breadcrumb";

const TABS = [
  { id: "tasks", label: "Tasks", icon: CheckCircle2 },
  { id: "discussions", label: "Discussions", icon: MessageSquare },
  { id: "files", label: "Files", icon: FileText },
  { id: "activity", label: "Activity", permission: "manageMembers" },
];

const STATUS_STYLE = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  completed: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  on_hold: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

export default function ProjectTabs({ project, userRole }) {
  const [activeTab, setActiveTab] = useState("tasks");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const canDelete = userRole === "admin";

  async function handleDeleteProject() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete project");
        setDeleting(false);
      }
    } catch {
      alert("Failed to delete project");
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-900 dark:text-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Breadcrumb project={project} />
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>

        {/* Project Header */}
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: project.color || "#6366f1" }}
              />
              <h1 className="text-xl font-semibold tracking-tight">
                {project.name}
              </h1>
              <span
                className={`shrink-0 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                  STATUS_STYLE[project.status] || STATUS_STYLE.active
                }`}
              >
                {project.status?.replace("_", " ")}
              </span>
            </div>
            {project.description && (
              <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 max-w-2xl">
                {project.description}
              </p>
            )}

            {/* Meta info */}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
              {project.manager && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Manager: {project.manager.name}
                </span>
              )}
              {project.clientUser && (
                <span className="flex items-center gap-1">
                  Client: {project.clientUser.name}
                </span>
              )}
              <span>
                {project._count?.tasks ?? 0} tasks · {project._count?.comments ?? 0} discussions · {project._count?.files ?? 0} files
              </span>
            </div>
          </div>

          {/* Delete Project */}
          {canDelete && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="shrink-0 flex items-center gap-1.5 rounded-lg border border-rose-900/50 bg-rose-950/20 px-3 py-1.5 text-[11px] font-medium text-rose-400 transition-all hover:bg-rose-900/30 hover:text-rose-300"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          )}
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
              Progress
            </span>
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              {project.progress}%
              <span className="ml-2 font-normal text-zinc-500">
                ({project.doneTasks}/{project.totalTasks} tasks done)
              </span>
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${project.progress}%`,
                backgroundColor: project.color || "#6366f1",
              }}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex gap-1 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const Button = (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200"
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {tab.label}
              </button>
            );

            if (tab.permission) {
              return (
                <Can key={tab.id} permission={tab.permission}>
                  {Button}
                </Can>
              );
            }
            return Button;
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "tasks" && (
            <ProjectTasksTab projectId={project.id} />
          )}
          {activeTab === "discussions" && (
            <ProjectDiscussionsTab projectId={project.id} />
          )}
          {activeTab === "files" && (
            <ProjectFilesTab projectId={project.id} />
          )}
          {activeTab === "activity" && (
            <ProjectActivityTab projectId={project.id} />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal 
        open={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        title="Delete Project"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                This action cannot be undone
              </p>
            </div>
          </div>
          
          <p className="text-sm text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
            Are you sure you want to delete{" "}
            <strong className="text-zinc-800 dark:text-zinc-200">{project.name}</strong>? All
            tasks, comments, and files associated with this project will be
            permanently removed.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
              className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-200 dark:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteProject}
              disabled={deleting}
              className="flex-1 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-rose-500 disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete Project"}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
