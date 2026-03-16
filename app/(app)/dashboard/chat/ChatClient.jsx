"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Send,
  ArrowLeft,
  MessageCircle,
  Users,
  Loader2,
  Hash,
} from "lucide-react";

const POLL_INTERVAL = 3000; // 3 seconds

const ROLE_COLORS = {
  admin: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  manager: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  member: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  client: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

const AVATAR_GRADIENTS = [
  "from-rose-500 to-pink-500",
  "from-violet-500 to-purple-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-indigo-500 to-blue-500",
  "from-pink-500 to-rose-500",
  "from-teal-500 to-emerald-500",
];

function getAvatarGradient(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const oneDay = 86400000;

  if (diff < oneDay && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (diff < oneDay * 2 && date.getDate() === now.getDate() - 1) {
    return (
      "Yesterday " +
      date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    );
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function shouldShowDateSeparator(messages, index) {
  if (index === 0) return true;
  const prev = new Date(messages[index - 1].createdAt);
  const curr = new Date(messages[index].createdAt);
  return (
    prev.getFullYear() !== curr.getFullYear() ||
    prev.getMonth() !== curr.getMonth() ||
    prev.getDate() !== curr.getDate()
  );
}

function formatDateSeparator(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const oneDay = 86400000;

  if (diff < oneDay && date.getDate() === now.getDate()) return "Today";
  if (diff < oneDay * 2 && date.getDate() === now.getDate() - 1)
    return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function ChatClient({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineMembers, setOnlineMembers] = useState([]);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Check if user is scrolled to bottom
  const checkIfAtBottom = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const threshold = 100;
    isAtBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold;
  }, []);

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/messages", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const msgs = data.messages || [];
      setMessages(msgs);

      // Auto-scroll if user is at bottom or new messages arrived
      if (
        isAtBottomRef.current ||
        msgs.length > prevMessageCountRef.current
      ) {
        setTimeout(() => scrollToBottom(), 50);
      }
      prevMessageCountRef.current = msgs.length;
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, [scrollToBottom]);

  // Load online members for sidebar
  const loadMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/members", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setOnlineMembers(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  // Initial load
  useEffect(() => {
    setLoading(true);
    Promise.all([loadMessages(), loadMembers()]).finally(() => {
      setLoading(false);
      setTimeout(() => scrollToBottom("instant"), 100);
    });
  }, [loadMessages, loadMembers, scrollToBottom]);

  // Polling for new messages
  useEffect(() => {
    const interval = setInterval(loadMessages, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadMessages]);

  // Send message
  async function handleSend(e) {
    e.preventDefault();
    const body = input.trim();
    if (!body || sending) return;

    // Optimistic add
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      body,
      createdAt: new Date().toISOString(),
      user: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
      },
      _optimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");
    setSending(true);
    setTimeout(() => scrollToBottom(), 50);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? msg : m))
        );
      } else {
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  // Group consecutive messages from the same user
  function isConsecutive(messages, index) {
    if (index === 0) return false;
    const prev = messages[index - 1];
    const curr = messages[index];
    if (prev.user.id !== curr.user.id) return false;
    const timeDiff =
      new Date(curr.createdAt) - new Date(prev.createdAt);
    return timeDiff < 5 * 60 * 1000; // 5 minutes
  }

  return (
    <main className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden">
      {/* Sidebar - Members List */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-950 lg:flex">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800/80 px-4 py-4">
          <Link
            href="/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-sm font-semibold">Team Chat</h2>
            <p className="text-[10px] text-zinc-500">
              {onlineMembers.length} members
            </p>
          </div>
        </div>

        {/* Channel */}
        <div className="px-3 py-3">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Channel
          </p>
          <div className="flex items-center gap-2 rounded-xl bg-brand-primary/10 px-3 py-2 text-sm font-medium text-brand-primary">
            <Hash className="h-4 w-4" />
            general
          </div>
        </div>

        {/* Members */}
        <div className="flex-1 overflow-auto px-3 py-2">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Members
          </p>
          <div className="space-y-1">
            {onlineMembers
              .filter((m) => m.role !== "client")
              .map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-zinc-800/50"
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarGradient(
                      m.name
                    )} text-[10px] font-bold text-white`}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-zinc-300">
                      {m.name}
                      {m.id === currentUser.id && (
                        <span className="ml-1 text-zinc-600">(you)</span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider ${
                      ROLE_COLORS[m.role] || ROLE_COLORS.member
                    }`}
                  >
                    {m.role}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Chat Header */}
        <header className="flex items-center gap-3 border-b border-zinc-800/80 bg-zinc-950/90 px-4 py-3 backdrop-blur-xl lg:px-6">
          <Link
            href="/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">
                <Hash className="mr-1 inline h-3.5 w-3.5 text-zinc-500" />
                general
              </h1>
              <p className="text-[10px] text-zinc-500">
                Team-wide conversation
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <div className="flex -space-x-1.5">
              {onlineMembers.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarGradient(
                    m.name
                  )} text-[9px] font-bold text-white ring-2 ring-zinc-950`}
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {onlineMembers.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[9px] font-bold text-zinc-400 ring-2 ring-zinc-950">
                  +{onlineMembers.length - 3}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div
          ref={chatContainerRef}
          onScroll={checkIfAtBottom}
          className="flex-1 overflow-y-auto px-4 py-4 lg:px-6"
        >
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10">
                <MessageCircle className="h-8 w-8 text-brand-primary" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-300">
                No messages yet
              </h3>
              <p className="text-xs text-zinc-500 max-w-xs">
                Start the conversation! Messages are visible to all team
                members in your workspace.
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {messages.map((msg, i) => {
                const isOwn = msg.user.id === currentUser.id;
                const consecutive = isConsecutive(messages, i);
                const showDate = shouldShowDateSeparator(messages, i);

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-zinc-800/80" />
                        <span className="text-[10px] font-medium text-zinc-500">
                          {formatDateSeparator(msg.createdAt)}
                        </span>
                        <div className="h-px flex-1 bg-zinc-800/80" />
                      </div>
                    )}

                    <div
                      className={`group flex items-start gap-3 rounded-xl px-3 py-1 transition-colors hover:bg-zinc-900/60 ${
                        consecutive ? "mt-0" : "mt-3"
                      } ${msg._optimistic ? "opacity-70" : ""}`}
                    >
                      {/* Avatar */}
                      {!consecutive ? (
                        <div
                          className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarGradient(
                            msg.user.name
                          )} text-xs font-bold text-white shadow-lg`}
                        >
                          {msg.user.name.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-8 shrink-0" />
                      )}

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        {!consecutive && (
                          <div className="mb-0.5 flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                isOwn
                                  ? "text-brand-primary"
                                  : "text-zinc-200"
                              }`}
                            >
                              {msg.user.name}
                              {isOwn && (
                                <span className="ml-1 text-[10px] font-normal text-zinc-600">
                                  (you)
                                </span>
                              )}
                            </span>
                            <span
                              className={`rounded-full border px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider ${
                                ROLE_COLORS[msg.user.role] ||
                                ROLE_COLORS.member
                              }`}
                            >
                              {msg.user.role}
                            </span>
                            <span className="text-[10px] text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100">
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed text-zinc-300 break-words whitespace-pre-wrap">
                          {msg.body}
                        </p>
                      </div>

                      {/* Timestamp on hover for consecutive */}
                      {consecutive && (
                        <span className="mt-1 shrink-0 text-[10px] text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100">
                          {new Date(msg.createdAt).toLocaleTimeString(
                            undefined,
                            {
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-zinc-800/80 bg-zinc-950/90 p-4 lg:px-6">
          <form
            onSubmit={handleSend}
            className="flex items-end gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 transition-colors focus-within:border-brand-primary/50 focus-within:shadow-lg focus-within:shadow-brand-primary/5"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
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
              disabled={!input.trim() || sending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
          <p className="mt-2 text-center text-[10px] text-zinc-600">
            Messages are visible to all team members
          </p>
        </div>
      </div>
    </main>
  );
}
