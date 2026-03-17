"use client"
import Portal from "./Portal"

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <Portal>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#1a1a2e",
            border: "1px solid #2a2a3e",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "520px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "24px",
            color: "#fff",
          }}
        >
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
            <h2 style={{ fontSize:"18px", fontWeight:700 }}>{title}</h2>
            <button onClick={onClose} style={{ background:"none", border:"none", fontSize:"22px", cursor:"pointer", color:"#888" }}>×</button>
          </div>
          {children}
        </div>
      </div>
    </Portal>
  )
}
