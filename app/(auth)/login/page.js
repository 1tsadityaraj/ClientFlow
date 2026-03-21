"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setAttempts(prev => prev + 1)
      setError("Invalid email or password. Please try again.")
    } else if (result?.ok) {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "var(--bg-primary)",
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Left decorative panel - hidden on mobile */}
      <div style={{
        flex: 1,
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
        position: "relative",
        overflow: "hidden",
      }}
        className="hidden lg:flex"
      >
        {/* Background pattern */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)`,
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", color: "#fff" }}>
          {/* Logo */}
          <div style={{
            width: 64,
            height: 64,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 32px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}>
            <span style={{ fontSize: 28, fontWeight: 800 }}>CF</span>
          </div>

          <h1 style={{
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: 16,
            lineHeight: 1.1,
          }}>
            Your clients deserve<br />a better experience
          </h1>
          <p style={{
            fontSize: 16,
            opacity: 0.8,
            lineHeight: 1.7,
            maxWidth: 340,
            margin: "0 auto 48px",
          }}>
            Manage projects, share files, and communicate — 
            all in one branded portal.
          </p>

          {/* Stats */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            maxWidth: 320,
            margin: "0 auto",
          }}>
            {[
              { value: "4-tier", label: "Role system" },
              { value: "100%", label: "Data isolated" },
              { value: "Live", label: "Real-time chat" },
              { value: "Free", label: "To get started" },
            ].map((stat, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "16px",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div style={{
        width: "100%",
        maxWidth: 480,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 32px",
      }}>
        {/* Mobile logo */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 40,
        }}
          className="flex lg:hidden"
        >
          <div style={{
            width: 36,
            height: 36,
            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>CF</span>
          </div>
          <span style={{
            fontSize: 20,
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}>
            ClientFlow
          </span>
        </div>

        <div style={{ width: "100%", maxWidth: 380 }}>
          <h2 style={{
            fontSize: 28,
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}>
            Welcome back
          </h2>
          <p style={{
            color: "var(--text-muted)",
            fontSize: 14,
            marginBottom: 32,
            lineHeight: 1.6,
          }}>
            Sign in to your ClientFlow workspace
          </p>

          {/* Demo accounts hint */}
          {attempts >= 2 && (
            <div style={{
              background: "var(--accent-light)",
              border: "1px solid var(--accent)",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 20,
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}>
              💡 Try the demo: <strong>alice@pixel.co</strong> / <strong>password123</strong>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              background: "var(--danger-light)",
              border: "1px solid var(--danger)",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 20,
              color: "var(--danger)",
              fontSize: 13,
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}>
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alice@pixel.co"
                required
                style={{
                  width: "100%",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "11px 14px",
                  fontSize: 14,
                  color: "var(--text-primary)",
                  outline: "none",
                  transition: "border-color 0.15s",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}>
                <label style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  Password
                </label>
                <Link href="#" style={{
                  fontSize: 12,
                  color: "var(--accent)",
                  textDecoration: "none",
                  fontWeight: 500,
                }}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                style={{
                  width: "100%",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "11px 14px",
                  fontSize: 14,
                  color: "var(--text-primary)",
                  outline: "none",
                  transition: "border-color 0.15s",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              style={{
                width: "100%",
                padding: "12px",
                background: loading || !email || !password
                  ? "var(--border)"
                  : "linear-gradient(to right, #6366f1, #8b5cf6)",
                color: loading || !email || !password
                  ? "var(--text-muted)"
                  : "#ffffff",
                border: "none",
                borderRadius: 9999,
                boxShadow: loading || !email || !password
                  ? "none"
                  : "0 10px 15px -3px rgba(99, 102, 241, 0.3), 0 4px 6px -4px rgba(99, 102, 241, 0.3)",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading || !email || !password ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                fontFamily: "inherit",
                letterSpacing: "0.01em",
                marginTop: 4,
              }}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "24px 0",
          }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
              New to ClientFlow?
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <Link href="/signup" style={{
            display: "block",
            width: "100%",
            padding: "11px",
            background: "var(--surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            borderRadius: 9999,
            fontSize: 14,
            fontWeight: 600,
            textAlign: "center",
            textDecoration: "none",
            transition: "all 0.15s",
            boxSizing: "border-box",
          }}>
            Create a workspace
          </Link>
        </div>
      </div>
    </div>
  )
}
