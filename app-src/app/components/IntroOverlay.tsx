"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

export default function IntroOverlay() {
  const overlayRef  = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const lineRef     = useRef<HTMLDivElement>(null);
  const subRef      = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl
      // 1 — title drops in
      .from(titleRef.current, { y: 48, opacity: 0, duration: 0.75 })
      // 2 — accent line expands
      .from(lineRef.current, { scaleX: 0, opacity: 0, duration: 0.45, ease: "power2.out" }, "-=0.25")
      // 3 — subtitle rises
      .from(subRef.current, { y: 20, opacity: 0, duration: 0.5 }, "-=0.2")
      // 4 — pause so the visitor can read it
      .to({}, { duration: 0.65 })
      // 5 — curtain slides upward, revealing the board
      .to(overlayRef.current, {
        yPercent: -100,
        duration: 0.9,
        ease: "power3.inOut",
      })
      // 6 — remove from DOM so it can't block clicks
      .set(overlayRef.current, { display: "none" });
  }, { scope: overlayRef });

  return (
    <div
      ref={overlayRef}
      style={{
        position:       "fixed",
        inset:          0,
        zIndex:         1000,
        background:     "#e9e8e2",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        gap:            "14px",
        /* block interaction until it leaves */
        pointerEvents:  "all",
      }}
    >
      {/* main heading */}
      <h1
        ref={titleRef}
        style={{
          fontFamily: "var(--font-caveat)",
          fontSize:   "clamp(40px, 6vw, 72px)",
          fontWeight: 700,
          color:      "#1a1a1a",
          textAlign:  "center",
          lineHeight: 1.1,
          padding:    "0 24px",
        }}
      >
        hang your Favorite photos
      </h1>

      {/* cork-brown accent line */}
      <div
        ref={lineRef}
        style={{
          width:           "64px",
          height:          "3px",
          background:      "#b97c40",
          borderRadius:    "2px",
          transformOrigin: "left center",
        }}
      />

      {/* tagline */}
      <p
        ref={subRef}
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize:   "15px",
          color:      "#888",
          textAlign:  "center",
          padding:    "0 24px",
        }}
      >
        your memories, your board
      </p>
    </div>
  );
}
