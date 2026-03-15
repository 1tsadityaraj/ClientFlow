"use client";

import { useState } from "react";
import Link from "next/link";
import { Can } from "../../../../../components/Can";
import ProjectTasksTab from "./ProjectTasksTab";
import ProjectFilesTab from "./ProjectFilesTab";
import ProjectCommentsTab from "./ProjectCommentsTab";
import ProjectActivityTab from "./ProjectActivityTab";

const TABS = [
  { id: "tasks", label: "Tasks" },
  { id: "files", label: "Files" },
  { id: "comments", label: "Comments" },
  { id: "activity", label: "Activity", permission: "manageMembers" },
];

export default function ProjectTabs({ project }) {
  const [activeTab, setActiveTab] = useState("tasks");

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/dashboard"
          className="text-xs text-zinc-400 hover:text-zinc-200"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{project.name}</h1>
        {project.description && (
          <p className="mt-1 text-sm text-zinc-400">{project.description}</p>
        )}

        <div className="mt-6 flex gap-1 border-b border-zinc-800">
          {TABS.map((tab) => {
            const Button = (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
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

        <div className="mt-6">
          {activeTab === "tasks" && (
            <ProjectTasksTab projectId={project.id} />
          )}
          {activeTab === "files" && (
            <ProjectFilesTab projectId={project.id} />
          )}
          {activeTab === "comments" && (
            <ProjectCommentsTab projectId={project.id} />
          )}
          {activeTab === "activity" && (
            <ProjectActivityTab projectId={project.id} />
          )}
        </div>
      </div>
    </main>
  );
}
