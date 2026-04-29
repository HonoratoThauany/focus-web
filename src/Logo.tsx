export default function Logo({ size = "md", vertical = false }: { size?: "sm" | "md" | "lg", vertical?: boolean }) {
  const sizes = {
    sm: { box: 24, radius: 6, icon: 12, text: 13 },
    md: { box: 32, radius: 9, icon: 16, text: 15 },
    lg: { box: 56, radius: 16, icon: 28, text: 24 }
  }

  const s = sizes[size]

  return (
    <div style={{
      display: "flex",
      flexDirection: vertical ? "column" : "row",
      alignItems: "center",
      gap: vertical ? 14 : (size === "lg" ? 12 : 8)
    }}>
      <div style={{
        width: s.box,
        height: s.box,
        borderRadius: s.radius,
        background: "#7c3aed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }}>
        <svg width={s.icon} height={s.icon} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/>
          <line x1="8" y1="4.5" x2="8" y2="8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="8" y1="8.5" x2="10.5" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <span style={{
        fontSize: s.text,
        fontWeight: 600,
        letterSpacing: "-0.02em",
        color: "rgba(255,255,255,0.9)"
      }}>
        Focus Web
      </span>
    </div>
  )
}