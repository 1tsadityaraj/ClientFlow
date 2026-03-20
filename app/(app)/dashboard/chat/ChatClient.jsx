"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Send,
  ArrowLeft,
  MessageCircle,
  Hash,
  Loader2,
  CheckCircle2,
  Wifi,
  WifiOff,
  User,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusherClient";
import Breadcrumb from "@/components/Breadcrumb";

const MAX_CHAR_LIMIT = 2000;

const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-pink-500",
  "bg-orange-500",
];

function getUserColor(userId) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatMessageTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isSameDay(d1, d2) {
  return new Date(d1).toDateString() === new Date(d2).toDateString();
}

export default function ChatClient({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState(new Set());
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const orgId = currentUser.orgId; // Assuming orgId is passed or available via session

  const [onlineMembers, setOnlineMembers] = useState(new Set());
  const [allMembers, setAllMembers] = useState([]);

  // Fetch initial messages and members
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [chatRes, membersRes] = await Promise.all([
        fetch("/api/chat"),
        fetch("/api/members")
      ]);

      if (chatRes.ok) {
        const data = await chatRes.json();
        setMessages(data.messages || []);
      }
      if (membersRes.ok) {
        const data = await membersRes.json();
        setAllMembers(data || []);
      }
      
      setTimeout(() => scrollToBottom("instant"), 100);
    } catch (error) {
      console.error("Failed to load initial data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Pusher Real-time logic
  useEffect(() => {
    if (!orgId) return;

    const pusher = getPusherClient();
    const channelName = `org-${orgId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("new-message", (data) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
      setTimeout(() => scrollToBottom(), 50);
    });

    // Handle connection status
    pusher.connection.bind("state_change", (states) => {
      setConnected(states.current === "connected");
    });
    setConnected(pusher.connection.state === "connected");

    // Presence channel
    const presenceChannel = pusher.subscribe(`presence-org-${orgId}`);
    presenceChannel.bind("pusher:subscription_succeeded", (members) => {
      setOnlineCount(members.count);
      const onlineIds = new Set();
      members.each((member) => onlineIds.add(member.id));
      setOnlineMembers(onlineIds);
    });
    presenceChannel.bind("pusher:member_added", (member) => {
      setOnlineCount((prev) => prev + 1);
      setOnlineMembers((prev) => new Set([...prev, member.id]));
    });
    presenceChannel.bind("pusher:member_removed", (member) => {
      setOnlineCount((prev) => prev - 1);
      setOnlineMembers((prev) => {
        const next = new Set(prev);
        next.delete(member.id);
        return next;
      });
    });

    // Typing indicators
    presenceChannel.bind("client-typing", (data) => {
      if (data.userId === currentUser.id) return;
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.add(data.name);
        return next;
      });

      // Auto-remove after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(data.name);
          return next;
        });
      }, 3000);
    });

    return () => {
      pusher.unsubscribe(channelName);
      pusher.unsubscribe(`presence-org-${orgId}`);
    };
  }, [orgId]);

  const handleSend = async (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    } catch (error) {
      console.error(error);
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const groupedMessages = useMemo(() => {
    const groups = [];
    messages.forEach((msg, i) => {
      const prevMsg = messages[i - 1];
      const showDateSeparator = !prevMsg || !isSameDay(msg.createdAt, prevMsg.createdAt);
      const isConsecutive = prevMsg && prevMsg.user.id === msg.user.id && !showDateSeparator;

      if (showDateSeparator) groups.push({ type: "date-separator", date: msg.createdAt });

      if (isConsecutive) {
        groups[groups.length - 1].messages.push(msg);
      } else {
        groups.push({ type: "message-group", user: msg.user, messages: [msg] });
      }
    });
    return groups;
  }, [messages]);

  return (
    <main className="flex h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 overflow-hidden">
      {/* Sidebar - Members List */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 lg:flex">
        <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800/80 px-6 py-5">
           <Link
            href="/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h2 className="text-sm font-semibold">Team members</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1">
            {allMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/50">
                <div className="relative">
                  {member.avatar ? (
                    <img src={member.avatar} className="h-8 w-8 rounded-full object-cover" alt="" />
                  ) : (
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white ${getUserColor(member.id)}`}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {onlineMembers.has(member.id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 bg-emerald-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">{member.name}</p>
                  <p className="text-[10px] text-zinc-500 capitalize">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Breadcrumb />
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/50 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 transition-colors hover:text-white lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold tracking-tight">#general</h1>
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                  <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"}`} />
                  {connected ? "Live" : "Connecting..."}
                </div>
              </div>
              <p className="text-[10px] text-zinc-500">
                {onlineCount} members online
              </p>
            </div>
          </div>
        </header>

        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
        >
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                  <div className="h-16 w-64 rounded-2xl bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
              <MessageCircle className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">No messages yet</h3>
              <p className="mt-1 text-xs text-zinc-500">Be the first to say hello 👋</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedMessages.map((group, gIdx) => {
              if (group.type === "date-separator") {
                const dateLabel = new Date(group.date).toDateString() === new Date().toDateString() 
                  ? "Today" 
                  : new Date(group.date).toDateString() === new Date(Date.now() - 86400000).toDateString()
                    ? "Yesterday"
                    : new Date(group.date).toLocaleDateString([], { month: "long", day: "numeric" });
                
                return (
                  <div key={`date-${group.date}`} className="flex items-center gap-4 py-4">
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800/50" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{dateLabel}</span>
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800/50" />
                  </div>
                );
              }

              const isOwn = group.user.id === currentUser.id;

              return (
                <div 
                  key={`group-${gIdx}`} 
                  className={`flex gap-3 group/msg animate-in fade-in slide-in-from-bottom-2 duration-300 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  {!isOwn && (
                    <div className="flex flex-col justify-end pb-1">
                      {group.user.avatar ? (
                        <img src={group.user.avatar} className="h-9 w-9 rounded-full object-cover shadow-lg" alt="" />
                      ) : (
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${getUserColor(group.user.id)}`}>
                          {group.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`flex max-w-[75%] flex-col space-y-1 ${isOwn ? "items-end" : "items-start"}`}>
                    {!isOwn && (
                      <span className="ml-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
                        {group.user.name}
                      </span>
                    )}
                    {group.messages.map((msg, mIdx) => (
                      <div key={msg.id} className="group/item relative">
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${
                            isOwn 
                              ? "bg-indigo-600 text-white rounded-tr-none" 
                              : "bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-none"
                          }`}
                        >
                          {msg.text || msg.body}
                        </div>
                        <span 
                          className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] text-zinc-500 opacity-0 transition-opacity group-hover/item:opacity-100 ${
                            isOwn ? "right-full mr-3" : "left-full ml-3"
                          }`}
                        >
                          {formatMessageTime(msg.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/80 p-6 backdrop-blur-md">
        <form onSubmit={handleSend} className="relative">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              
              // Trigger typing event
              if (!typingTimeoutRef.current && orgId) {
                const pusher = getPusherClient();
                const chan = pusher.channel(`presence-org-${orgId}`);
                if (chan && chan.subscribed) {
                  chan.trigger("client-typing", {
                    userId: currentUser.id,
                    name: currentUser.name,
                  });
                }
                
                typingTimeoutRef.current = setTimeout(() => {
                  typingTimeoutRef.current = null;
                }, 2000); // 2 second throttle
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full resize-none rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/40 py-3 pl-4 pr-16 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 sm:py-4"
            style={{ maxHeight: "160px" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
            }}
          />
          <div className="absolute right-2 top-2 flex h-8 items-center gap-2 sm:right-3 sm:top-3">
            {input.length >= 1800 && (
              <span className={`text-[10px] font-mono ${input.length >= MAX_CHAR_LIMIT ? "text-rose-500" : "text-zinc-500"}`}>
                {input.length}/{MAX_CHAR_LIMIT}
              </span>
            )}
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400 disabled:opacity-30 sm:h-10 sm:w-10"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>
        <div className="mt-3 flex items-center justify-between px-2">
          <p className="text-[10px] text-zinc-600">
            Shift + Enter for new line
          </p>
          <div className={`flex items-center gap-1.5 transition-opacity duration-300 ${typingUsers.size > 0 ? "opacity-100" : "opacity-0"}`}>
            <span className="flex gap-1">
              <span className="h-1 w-1 rounded-full bg-indigo-400 animate-bounce" />
              <span className="h-1 w-1 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
              <span className="h-1 w-1 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
            </span>
            <span className="text-[10px] text-indigo-400 font-medium tracking-tight">
              {Array.from(typingUsers).join(", ")} {typingUsers.size === 1 ? "is" : "are"} typing...
            </span>
          </div>
        </div>
      </div>
    </div>
  </main>
  );
}
