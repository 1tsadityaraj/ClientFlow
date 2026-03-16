"use client";

import { useState, useEffect, useOptimistic, useRef, startTransition } from "react";
import { Can } from "../../../../../components/Can";
import { useSession } from "next-auth/react";
import { Send, MessageSquare, Loader2 } from "lucide-react";

const AVATAR_GRADIENTS = [
  "from-rose-500 to-pink-500",
  "from-violet-500 to-purple-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-indigo-500 to-blue-500",
];

function getGradient(name) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function avatarLetter(name) {
  return (name || "?").charAt(0).toUpperCase();
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function DiscussionSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-800 p-4">
      <div className="flex gap-3">
        <div className="h-8 w-8 rounded-full bg-zinc-700" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-28 rounded bg-zinc-700" />
          <div className="h-4 w-full rounded bg-zinc-700" />
          <div className="h-4 w-3/4 rounded bg-zinc-700" />
        </div>
      </div>
    </div>
  );
}

export default function ProjectDiscussionsTab({ projectId }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [optimisticComments, addOptimistic] = useOptimistic(
    comments,
    (state, newComment) => [...state, newComment]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  async function loadComments() {
    const res = await fetch(`/api/projects/${projectId}/comments`, {
      cache: "no-store",
    });
    if (!res.ok) {
      setError("Failed to load discussions");
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

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [optimisticComments.length]);

  async function handleSubmit(e) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSubmitError("");

    const optimisticMsg = {
      id: `opt-${Date.now()}`,
      body: text,
      userId: session?.user?.id,
      user: { name: session?.user?.name || "You" },
      createdAt: new Date().toISOString(),
      _sending: true,
    };

    setBody("");
    setSubmitting(true);

    startTransition(async () => {
      // 1. Optimistic update via useOptimistic
      addOptimistic(optimisticMsg);

      // 2. Server request
      try {
        const res = await fetch(`/api/projects/${projectId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: text }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          // Replace optimistic with real data
          setComments((prev) => [...prev, data]);
        } else {
          setSubmitError(data.error || "Failed to post");
          setBody(text);
        }
      } catch {
        setSubmitError("Network error");
        setBody(text);
      } finally {
        setSubmitting(false);
        inputRef.current?.focus();
      }
    });
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <DiscussionSkeleton key={i} />
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
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-brand-primary" />
        <h2 className="text-sm font-medium text-zinc-300">
          Discussions
          <span className="ml-2 text-zinc-500">
            ({optimisticComments.length})
          </span>
        </h2>
      </div>

      {/* Discussion Feed */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {optimisticComments.map((c) => {
          const isOwn = c.userId === session?.user?.id;
          return (
            <div
              key={c.id}
              className={`group flex gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 transition-all hover:border-zinc-700/80 ${
                c._sending ? "opacity-60" : ""
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getGradient(
                  c.user?.name
                )} text-xs font-bold text-white shadow-sm`}
              >
                {avatarLetter(c.user?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-semibold ${
                      isOwn ? "text-brand-primary" : "text-zinc-200"
                    }`}
                  >
                    {c.user?.name ?? "Unknown"}
                    {isOwn && (
                      <span className="ml-1 font-normal text-zinc-600">
                        (you)
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-zinc-600">
                    {c._sending ? (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      formatTime(c.createdAt)
                    )}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300 break-words">
                  {c.body}
                </p>
              </div>
            </div>
          );
        })}

        {optimisticComments.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-zinc-600" />
            <p className="mt-2 text-sm text-zinc-400 font-medium">
              No discussions yet
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Start the conversation about this project
            </p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Post Form */}
      <Can permission="comment">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 transition-colors focus-within:border-brand-primary/50 focus-within:shadow-lg focus-within:shadow-brand-primary/5"
        >
          <textarea
            ref={inputRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Post an update or ask a question... (Enter to send)"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
            style={{ maxHeight: 120 }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
        {submitError && (
          <p className="text-xs text-rose-400 mt-1">{submitError}</p>
        )}
        <p className="text-[10px] text-zinc-600 text-center">
          Discussions are visible to all project members in your workspace
        </p>
      </Can>
    </div>
  );
}
