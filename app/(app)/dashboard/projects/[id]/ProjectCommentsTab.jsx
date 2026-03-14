"use client";

import { useState, useEffect } from "react";
import { Can } from "../../../../../components/Can";
import { useSession } from "next-auth/react";

function CommentSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-800 p-3">
      <div className="flex gap-2">
        <div className="h-8 w-8 rounded-full bg-zinc-700" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded bg-zinc-700" />
          <div className="h-4 rounded bg-zinc-700" />
        </div>
      </div>
    </div>
  );
}

function avatarLetter(name) {
  return (name || "?").charAt(0).toUpperCase();
}

export default function ProjectCommentsTab({ projectId }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function loadComments() {
    const res = await fetch(`/api/projects/${projectId}/comments`, {
      cache: "no-store",
    });
    if (!res.ok) {
      setError("Failed to load comments");
      return;
    }
    const data = await res.json();
    setComments(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadComments().finally(() => setLoading(false));
  }, [projectId]);

  async function handleSubmit(e) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSubmitError("");

    const optimistic = {
      id: `opt-${Date.now()}`,
      body: text,
      userId: session?.user?.id,
      user: { name: session?.user?.name || "You" },
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, optimistic]);
    setBody("");
    setSubmitting(true);

    const res = await fetch(`/api/projects/${projectId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setSubmitError(data.error || "Failed to post comment");
      setBody(text);
      return;
    }

    setComments((prev) =>
      prev.map((c) => (c.id === optimistic.id ? data : c))
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <CommentSkeleton key={i} />
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
      <h2 className="text-sm font-medium text-zinc-300">Comments</h2>

      <ul className="space-y-3">
        {comments.map((c) => (
          <li
            key={c.id}
            className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-200">
              {avatarLetter(c.user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-zinc-300">
                {c.user?.name ?? "Unknown"}
                <span className="ml-2 font-normal text-zinc-500">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">
                {c.body}
              </p>
            </div>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="rounded-xl border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-500">
            No comments yet.
          </li>
        )}
      </ul>

      <Can permission="comment">
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none focus:border-brand-primary"
          />
          {submitError && (
            <p className="text-xs text-rose-400">{submitError}</p>
          )}
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="rounded-full bg-brand-primary px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {submitting ? "Posting..." : "Post comment"}
          </button>
        </form>
      </Can>
    </div>
  );
}
