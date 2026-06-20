"use client";

import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(useGSAP, Draggable);

type Photo = {
  src: string;
  w: number;
  h: number;
  rot: number;
  left: string;
  top: string;
  z: number;
  caption?: string;
};

type UserPhoto = {
  id: string;
  src: string;       // data URL
  caption: string;
  left: string;
  top: string;
  rot: number;
  z: number;
};

const PHOTOS: Photo[] = [
  // ↓ save image → public/photos/turban.jpg
  { src: "/photos/turban.jpg",      w: 256, h: 277, rot:  8,   left: "4%",  top: "5%",  z: 3, caption: "vibes only"   },
  { src: "/photos/photo3.svg",      w: 269, h: 286, rot:  3,   left: "51%", top: "13%", z: 4 },
  // ↓ save image → public/photos/310mb.jpg
  { src: "/photos/310mb.jpg",       w: 258, h: 279, rot: -8,   left: "1%",  top: "50%", z: 3, caption: "310 Mbps 🔥"  },
  { src: "/photos/photo5.svg",      w: 225, h: 251, rot:  6,   left: "14%", top: "48%", z: 5 },
  // ↓ save image → public/photos/my-darling.jpg
  { src: "/photos/my-darling.jpg",  w: 252, h: 273, rot: -5,   left: "26%", top: "34%", z: 2, caption: "My darling"   },
  { src: "/photos/photo7.svg",      w: 302, h: 310, rot: 12,   left: "43%", top: "48%", z: 4 },
  // ↓ save image → public/photos/went-to-swim.jpg
  { src: "/photos/went-to-swim.jpg",w: 214, h: 241, rot: -10,  left: "67%", top: "46%", z: 3, caption: "went to swim" },
];

/** Resize + compress a data-URL to ≤800 px wide at JPEG 0.75 quality.
 *  Keeps base64 blobs small enough to survive localStorage's ~5 MB cap. */
function compressImage(dataUrl: string, maxWidth = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const ratio  = Math.min(maxWidth / img.width, 1);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.src = dataUrl;
  });
}

const STORAGE_KEY = "corkboard-user-photos";

function loadSaved(): UserPhoto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserPhoto[]) : [];
  } catch {
    return [];
  }
}

function saveToDisk(photos: UserPhoto[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  } catch {
    // quota exceeded — silently ignore (photos still show in session)
    console.warn("localStorage quota exceeded; photos won't persist across reloads.");
  }
}

export default function CorkBoard() {
  const boardRef     = useRef<HTMLDivElement>(null);
  const cardRefs     = useRef<HTMLDivElement[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userCardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [mobile, setMobile]             = useState(false);
  const [userPhotos, setUserPhotos]     = useState<UserPhoto[]>([]);
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const [captionInput, setCaptionInput] = useState("");

  /* ── Restore saved photos on first mount ────────────────────────── */
  useEffect(() => {
    const saved = loadSaved();
    if (saved.length) setUserPhotos(saved);
  }, []);

  /* ── Persist to localStorage whenever photos change ─────────────── */
  useEffect(() => {
    saveToDisk(userPhotos);
  }, [userPhotos]);

  /* ── responsive breakpoint ───────────────────────────────────────── */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* ── original photos: entrance + hover + drag ────────────────────── */
  useGSAP(
    () => {
      const cards = cardRefs.current.filter(Boolean);
      if (!cards.length) return;

      // delay matches intro overlay exit (~2.6 s total)
      gsap.from(cards, {
        y: 100, opacity: 0, scale: 0.82,
        duration: 0.65, stagger: 0.09,
        ease: "back.out(1.5)", delay: 2.6,
      });

      cards.forEach((card, i) => {
        const origRot = PHOTOS[i].rot;
        const origZ   = PHOTOS[i].z;
        card.addEventListener("mouseenter", () =>
          gsap.to(card, { scale: 1.08, rotation: origRot * 0.2, zIndex: 20, duration: 0.22, ease: "power2.out" })
        );
        card.addEventListener("mouseleave", () => {
          if (!card.classList.contains("is-dragging"))
            gsap.to(card, { scale: 1, rotation: origRot, zIndex: origZ, duration: 0.28, ease: "power2.inOut" });
        });
      });

      if (!mobile) {
        Draggable.create(cards, {
          bounds: boardRef.current ?? undefined,
          type: "x,y", edgeResistance: 0.6,
          onPress() {
            const i = cards.indexOf(this.target as HTMLDivElement);
            this.target.classList.add("is-dragging");
            gsap.to(this.target, { scale: 1.1, rotation: PHOTOS[i].rot * 0.1, duration: 0.18, ease: "power2.out" });
            gsap.set(this.target, { zIndex: 30 });
          },
          onRelease() {
            const i = cards.indexOf(this.target as HTMLDivElement);
            this.target.classList.remove("is-dragging");
            gsap.to(this.target, { scale: 1, rotation: PHOTOS[i].rot, duration: 0.32, ease: "back.out(1.3)" });
          },
        });
      }

      if (mobile) {
        let held: HTMLDivElement | null = null;
        cards.forEach((card, i) => {
          card.addEventListener("click", () => {
            if (held === card) {
              gsap.to(card, { scale: 1, duration: 0.25, ease: "power2.inOut" });
              gsap.set(card, { zIndex: PHOTOS[i].z });
              held = null;
            } else {
              if (held) {
                const pi = cards.indexOf(held);
                gsap.to(held, { scale: 1, duration: 0.2 });
                gsap.set(held, { zIndex: PHOTOS[pi].z });
              }
              gsap.to(card, { scale: 1.12, duration: 0.28, ease: "back.out(1.5)" });
              gsap.set(card, { zIndex: 30 });
              held = card;
            }
          });
        });
      }
    },
    { scope: boardRef, dependencies: [mobile] }
  );

  /* ── user-added photo: animate in + make draggable ───────────────── */
  useEffect(() => {
    if (!userPhotos.length) return;
    const last = userPhotos[userPhotos.length - 1];
    // wait a tick for the ref to be set
    requestAnimationFrame(() => {
      const el = userCardRefs.current.get(last.id);
      if (!el) return;

      gsap.from(el, { y: 140, opacity: 0, scale: 0.75, duration: 0.65, ease: "back.out(1.7)" });

      if (!mobile) {
        Draggable.create(el, {
          bounds: boardRef.current ?? undefined,
          type: "x,y", edgeResistance: 0.6,
          onPress() {
            gsap.to(el, { scale: 1.1, duration: 0.18, ease: "power2.out" });
            gsap.set(el, { zIndex: 30 });
          },
          onRelease() {
            gsap.to(el, { scale: 1, duration: 0.32, ease: "back.out(1.3)" });
            gsap.set(el, { zIndex: last.z });
          },
        });
      }
    });
  }, [userPhotos, mobile]);

  /* ── file picker handler — read → compress → preview ────────────── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw        = ev.target?.result as string;
      const compressed = await compressImage(raw);   // ≤800 px, JPEG 0.75
      setPendingPhoto(compressed);
      setCaptionInput("");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /* ── commit the pending photo to the board ───────────────────────── */
  const addPhoto = () => {
    if (!pendingPhoto) return;
    const left = `${Math.random() * 58 + 8}%`;
    const top  = `${Math.random() * 48 + 8}%`;
    const rot  = (Math.random() - 0.5) * 22;
    setUserPhotos(prev => [
      ...prev,
      { id: `user-${Date.now()}`, src: pendingPhoto, caption: captionInput.trim(), left, top, rot, z: 10 },
    ]);
    setPendingPhoto(null);
  };

  /* ── helpers ─────────────────────────────────────────────────────── */
  const isRaster = (src: string) => /\.(jpg|jpeg|png|webp)$/i.test(src);

  return (
    <div
      ref={boardRef}
      style={{
        position: "relative",
        flex: 1,
        width: "100%",
        overflow: "hidden",
        backgroundImage: "url('/mosaic.svg'), linear-gradient(135deg, #c9894a 0%, #a8692e 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#b97c40",
      }}
    >
      {/* ── Original photo cards ──────────────────────────────────────── */}
      {PHOTOS.map((p, i) => {
        const scale  = mobile ? 0.72 : 1;
        const cardW  = Math.round(p.w * scale);
        const photoH = Math.round((p.h - 52) * scale);

        return (
          <div
            key={p.src}
            ref={(el) => { if (el) cardRefs.current[i] = el; }}
            style={{
              position: "absolute",
              left: p.left,
              top: p.top,
              width: cardW,
              zIndex: p.z,
              transform: `rotate(${p.rot}deg)`,
              transformOrigin: "center center",
              cursor: mobile ? "pointer" : "grab",
              userSelect: "none",
              willChange: "transform",
            }}
          >
            {isRaster(p.src) ? (
              <div style={{ background: "white", borderRadius: "10px", padding: "10px 10px 0 10px", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", overflow: "hidden" }}>
                <div style={{ width: "100%", height: photoH, overflow: "hidden", borderRadius: "6px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={p.caption ?? `photo ${i + 1}`} draggable={false}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
                {p.caption && (
                  <div style={{ margin: "8px -10px 0", padding: "9px 12px 11px", background: "#a8d8ea", textAlign: "center" }}>
                    <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: Math.round(13 * scale) + "px", color: "#1a1a1a" }}>
                      {p.caption}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Plain <img> for SVG assets — bypasses Next.js image pipeline
                 so the embedded base64 raster data renders correctly on Vercel */
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.src} alt={`photo ${i + 1}`} draggable={false}
                style={{ display: "block", width: "100%", height: "auto" }} />
            )}
          </div>
        );
      })}

      {/* ── User-added photo cards ────────────────────────────────────── */}
      {userPhotos.map((p) => {
        const cardW  = mobile ? 170 : 230;
        const photoH = mobile ? 130 : 180;
        return (
          <div
            key={p.id}
            ref={(el) => { if (el) userCardRefs.current.set(p.id, el); }}
            style={{
              position: "absolute",
              left: p.left,
              top: p.top,
              width: cardW,
              zIndex: p.z,
              transform: `rotate(${p.rot}deg)`,
              transformOrigin: "center center",
              cursor: mobile ? "pointer" : "grab",
              userSelect: "none",
              willChange: "transform",
            }}
          >
            <div style={{ background: "white", borderRadius: "10px", padding: "10px 10px 0 10px", boxShadow: "0 4px 18px rgba(0,0,0,0.22)", overflow: "hidden" }}>
              <div style={{ width: "100%", height: photoH, overflow: "hidden", borderRadius: "6px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.caption || "photo"} draggable={false}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              {p.caption && (
                <div style={{ margin: "8px -10px 0", padding: "9px 12px 11px", background: "#a8d8ea", textAlign: "center" }}>
                  <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: mobile ? "11px" : "13px", color: "#1a1a1a" }}>
                    {p.caption}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* ── Hidden file input ─────────────────────────────────────────── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* ── "+" floating button ───────────────────────────────────────── */}
      <button
        onClick={() => fileInputRef.current?.click()}
        title="Add your photo"
        onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.15, duration: 0.18, ease: "power2.out" })}
        onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1,    duration: 0.22, ease: "power2.inOut" })}
        style={{
          position:     "absolute",
          bottom:       "22px",
          right:        "22px",
          width:        "52px",
          height:       "52px",
          borderRadius: "50%",
          background:   "white",
          border:       "none",
          fontSize:     "28px",
          lineHeight:   "1",
          cursor:       "pointer",
          boxShadow:    "0 4px 16px rgba(0,0,0,0.28)",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          zIndex:       100,
          color:        "#1a1a1a",
        }}
      >
        +
      </button>

      {/* ── Caption modal ─────────────────────────────────────────────── */}
      {pendingPhoto && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setPendingPhoto(null); }}
          style={{
            position:       "fixed",
            inset:          0,
            background:     "rgba(0,0,0,0.55)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            zIndex:         200,
          }}
        >
          <div style={{ background: "white", borderRadius: "20px", padding: "24px", width: "min(340px, 92vw)", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 24px 64px rgba(0,0,0,0.35)" }}>
            <p style={{ fontFamily: "var(--font-caveat)", fontSize: "24px", fontWeight: 700, textAlign: "center", color: "#1a1a1a", margin: 0 }}>
              Hang it up ✦
            </p>

            {/* preview */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pendingPhoto} alt="preview"
              style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px" }} />

            {/* caption input */}
            <input
              type="text"
              placeholder="Add a caption… (optional)"
              value={captionInput}
              onChange={(e) => setCaptionInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addPhoto(); }}
              autoFocus
              style={{
                border:       "1.5px solid #e0e0e0",
                borderRadius: "10px",
                padding:      "11px 14px",
                fontSize:     "15px",
                fontFamily:   "var(--font-dm-sans)",
                outline:      "none",
                color:        "#1a1a1a",
              }}
            />

            {/* actions */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setPendingPhoto(null)}
                style={{ flex: 1, padding: "12px", border: "1.5px solid #e0e0e0", borderRadius: "10px", background: "transparent", cursor: "pointer", fontFamily: "var(--font-dm-sans)", fontSize: "15px", color: "#555" }}
              >
                Cancel
              </button>
              <button
                onClick={addPhoto}
                style={{ flex: 1, padding: "12px", border: "none", borderRadius: "10px", background: "#1a1a1a", color: "white", cursor: "pointer", fontFamily: "var(--font-dm-sans)", fontSize: "15px", fontWeight: 500 }}
              >
                Add to board ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
