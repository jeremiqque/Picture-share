import CorkBoard from "./components/CorkBoard";
import IntroOverlay from "./components/IntroOverlay";

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        /* height (not min-height) so flex:1 on the board fills the rest */
        height: "100dvh",
        background: "#e9e8e2",
        overflow: "hidden",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          paddingTop: "36px",
          paddingBottom: "24px",
          background: "#e9e8e2",
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-caveat)",
            fontSize: "clamp(38px, 4.5vw, 60px)",
            fontWeight: 700,
            lineHeight: 1.1,
            color: "#1a1a1a",
            textAlign: "center",
          }}
        >
          hang your Favorite photos
        </h1>

        {/* Plain subtitle — no border, matches Figma */}
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "16px",
            fontWeight: 400,
            color: "#555",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          <span className="desktop-subtitle">Drag the photos and arrange them</span>
          <span className="mobile-subtitle">tap a photo to pick it up, tap again to place it</span>
        </p>
      </header>

      {/* ── Cork Board ──────────────────────────────────────────────────────── */}
      <CorkBoard />

      {/* ── Intro curtain — sits on top, animates away on load ──────────────── */}
      <IntroOverlay />

      <style>{`
        .desktop-subtitle { display: inline; }
        .mobile-subtitle  { display: none; }
        @media (max-width: 767px) {
          .desktop-subtitle { display: none; }
          .mobile-subtitle  { display: inline; }
        }
      `}</style>
    </main>
  );
}
