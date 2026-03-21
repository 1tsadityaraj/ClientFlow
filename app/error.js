"use client"
import { useEffect } from "react"

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary)",
      color: "var(--text-primary)",
      fontFamily: "sans-serif",
      gap: 16,
      padding: 20,
    }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Something went wrong</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0, textAlign: "center" }}>
        {error?.message || "An unexpected error occurred"}
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button
          onClick={reset}
          style={{
            padding: "8px 20px",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Try again
        </button>
        
        <a
          href="/dashboard"
          style={{
            padding: "8px 20px",
            background: "var(--surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Go to dashboard
        </a>
      </div>
    </div>
  )
}
