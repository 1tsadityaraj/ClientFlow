"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    orgName: "",
    orgSlug: "",
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState(null)
  const [showLoginLink, setShowLoginLink] = useState(false)

  const checkSlug = async (currentSlug) => {
    if (!currentSlug) {
      setSlugAvailable(null)
      return
    }
    setCheckingSlug(true)
    try {
      const res = await fetch(`/api/orgs/check-slug?slug=${currentSlug}`)
      if (res.ok) {
        const data = await res.json()
        setSlugAvailable(data.available)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCheckingSlug(false)
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/orgs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || "Something went wrong. Please try again.")
      
      if (res.status === 409 && data.error?.includes('email')) {
        setError('An account with this email already exists.')
        setShowLoginLink(true)
      }
      return
    }

    window.location.href = "/onboarding"
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
            Set up your agency<br />portal in 2 minutes
          </h1>
          <p style={{
            fontSize: 16,
            opacity: 0.8,
            lineHeight: 1.7,
            maxWidth: 340,
            margin: "0 auto 48px",
          }}>
            Create an isolated workspace where your team and clients can collaborate seamlessly.
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

      {/* Right: Signup form */}
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
            Create workspace
          </h2>
          <p style={{
            color: "var(--text-muted)",
            fontSize: 14,
            marginBottom: 32,
            lineHeight: 1.6,
          }}>
            Step {step} of 2
          </p>

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
              {showLoginLink && (
                <span>
                  {' '}
                  <Link href="/login" style={{ color: "var(--danger)", textDecoration: "underline", fontWeight: 700 }}>
                    Sign in instead →
                  </Link>
                </span>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {step === 1 && (
              <>
                {/* Agency Name */}
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
                    Agency Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.orgName}
                    onChange={(e) => {
                      updateField("orgName", e.target.value)
                      const generated = e.target.value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 30)
                      updateField("orgSlug", generated)
                      setSlugAvailable(null)
                    }}
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
                    onBlur={e => {
                      e.target.style.borderColor = "var(--border)"
                      checkSlug(form.orgSlug)
                    }}
                  />
                </div>

                {/* Workspace Slug */}
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
                    Workspace Slug
                  </label>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "11px 14px",
                    transition: "border-color 0.15s",
                  }}>
                    <span style={{ fontSize: 14, color: "var(--text-dim)" }}>
                      clientflow.app/
                    </span>
                    <input
                      type="text"
                      required
                      value={form.orgSlug}
                      onChange={(e) => {
                        updateField(
                          "orgSlug",
                          e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                        )
                        setSlugAvailable(null)
                      }}
                      onBlur={(e) => checkSlug(e.target.value)}
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        fontSize: 14,
                        color: "var(--text-primary)",
                        outline: "none",
                        fontFamily: "inherit",
                      }}
                    />
                    {checkingSlug && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>checking...</span>}
                    {!checkingSlug && slugAvailable === true && <span style={{ fontSize: 12, color: "var(--success)" }}>✓</span>}
                    {!checkingSlug && slugAvailable === false && <span style={{ fontSize: 12, color: "var(--danger)" }}>✗</span>}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* Your Name */}
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
                    Your name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
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

                {/* Work Email */}
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
                    Work email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
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
                  <label style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
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
              </>
            )}

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 8,
            }}>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 14,
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: 0,
                    fontWeight: 600,
                  }}
                >
                  ← Back
                </button>
              ) : (
                <span />
              )}
              
              <button
                type={step === 2 ? "submit" : "button"}
                disabled={loading || (step === 1 && slugAvailable === false)}
                onClick={step === 1 ? () => setStep(2) : undefined}
                style={{
                  padding: "12px 24px",
                  background: loading || (step === 1 && slugAvailable === false)
                    ? "var(--border)"
                    : "var(--accent)",
                  color: loading || (step === 1 && slugAvailable === false)
                    ? "var(--text-muted)"
                    : "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loading || (step === 1 && slugAvailable === false) ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                  letterSpacing: "0.01em",
                }}
              >
                {step === 2 ? (loading ? "Creating..." : "Create workspace") : "Continue"}
              </button>
            </div>
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
              Already have an account?
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <Link href="/login" style={{
            display: "block",
            width: "100%",
            padding: "11px",
            background: "var(--surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textAlign: "center",
            textDecoration: "none",
            transition: "all 0.15s",
            boxSizing: "border-box",
          }}>
            Log in to workspace
          </Link>
        </div>
      </div>
    </div>
  )
}
