# hang your Favorite photos

A photo-ledge experience built from Figma — scatter and drag your favourite memories on a virtual cork board.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Animations | GSAP 3.12+ · `@gsap/react` · `Draggable` |
| Fonts | Caveat Bold (heading 60 px) · DM Sans Regular (body 16 px) |

---

## Getting started

### 1. Prerequisites

- Node.js 18+
- npm 9+

### 2. Open the project folder

```bash
cd "day 6 challenge/app-src"
```

### 3. Install dependencies

```bash
npm install
```

### 4. Environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` if you need to override any values (defaults work for local dev).

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project structure

```
app-src/
├── app/
│   ├── components/
│   │   └── CorkBoard.tsx      # Client component — board + all GSAP logic
│   ├── globals.css             # @font-face, CSS variables, base reset
│   ├── layout.tsx              # Root layout (metadata, font wiring)
│   └── page.tsx                # Server page — header + CorkBoard
├── public/
│   ├── fonts/
│   │   ├── Caveat-Bold.ttf
│   │   └── DMSans-Regular.ttf
│   └── photos/
│       └── photo1.svg … photo8.svg   # Polaroid assets from Figma
├── .env.example
├── .env.local                  # gitignored — local overrides
├── next.config.ts
└── README.md
```

---

## Animations

| Trigger | Effect |
|---|---|
| Page load | Photos fly in from below with stagger (`back.out(1.5)`) |
| Hover (desktop) | Card lifts 8% · subtly straightens toward 0° |
| Drag (desktop) | GSAP `Draggable` — bounded to the board, snaps rotation on release |
| Tap (mobile) | First tap picks up (scales + raises z-index); second tap places |

---

## Fonts

Both fonts load from local TTF files via `@font-face` in `globals.css`, exposed as CSS variables:

```css
--font-caveat:  "Caveat",  cursive;
--font-dm-sans: "DMSans", "DM Sans", sans-serif;
```

---

## Build for production

```bash
npm run build
npm start
```

---

## Figma reference

- Desktop frame `node-id=79-4610`
- Mobile frame `node-id=79-4640`
- File: Codex-Figma-MCP-Verification
