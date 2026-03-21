export default function AuthLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {children}
    </div>
  )
}
