# Booklet Generator

A fully **serverless**, browser-based mini book / booklet imposition tool. Upload PDF or DOCX files, configure layout settings, preview printable sheets live, and export print-ready PDFs — all processing happens **locally in your browser** with no backend, no uploads, and no cloud APIs.

![Booklet Generator](public/vite.svg)

## Features

- **Upload** PDF and DOCX (multi-file merge with drag-to-reorder)
- **Booklet imposition** — saddle-stitch page order, automatic blank page padding
- **N-up layouts** — 1, 2, 4, 6, 8, 9, or 16 pages per sheet (custom grids supported)
- **Live preview** — canvas preview updates as you change settings (~150ms debounce)
- **Export** — Print-ready, Booklet, and Mini-book PDF presets
- **Print** — one-click browser print dialog
- **Dark / light theme**
- **Responsive** — settings and info panels become slide-over drawers on smaller screens

## Getting Started

Requires [Node.js](https://nodejs.org/) 18 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Production build

```bash
npm run build
npm run preview
```

## Usage

### 1. Upload a document

Drag and drop or browse for **PDF** or **DOCX** files. Multiple files are merged in list order.

> Legacy `.doc` (binary Word) is **not supported**. Save as `.docx` or export to PDF first.

### 2. Configure booklet settings

Use the left panel (or the **settings** button on mobile):

| Setting | Description |
|---------|-------------|
| Book Size | Target page size (A7, A6, A5, custom…) |
| Paper Size | Printer paper (A4, A3, Letter, Legal…) |
| Pages Per Sheet | How many book pages fit on each side of a sheet |
| Booklet Mode | Normal, Booklet (saddle-stitch), Mini Book, Signature |
| Margin / Spacing | Outer margin and gap between cells |
| Scaling | Fit, Fill, Actual Size, or custom % |
| Duplex | Optimize front/back layout for double-sided printing |
| Compression | Export file size vs. quality |

### 3. Preview

The center panel shows the imposed sheet layout with page thumbnails. Use:

- **Arrow keys** ← → to navigate sheets
- **Front / Back tabs** when duplex is enabled
- **Sheet slider** for large documents

### 4. Export or print

- **Export** dropdown → Print-ready / Booklet / Mini-book PDF
- **Print** button → opens the browser print dialog
- **Ctrl+P** (Cmd+P on Mac) → print
- **Ctrl+S** (Cmd+S on Mac) → download print-ready PDF

## Booklet printing guide

For **Booklet mode** (saddle-stitch), the app pads your page count to a multiple of 4 and arranges pages for folding.

### Example: 10-page document

- Padded to **12 pages** (2 blank pages added)
- Imposition order on sheets:

| Sheet | Front | Back |
|-------|-------|------|
| 1 | Blank · 1 | 2 · Blank |
| 2 | 10 · 3 | 4 · 9 |
| 3 | 8 · 5 | 6 · 7 |

*(Blank = padded page; numbers are source page numbers)*

### Print steps

1. Export or print the imposed PDF
2. Print **double-sided**, flip on **long edge** (standard duplex)
3. Stack sheets in order, **fold in half** along the spine
4. **Staple** or bind along the fold

The **Fold & Print Guide** in the document info panel (right side, or info button on tablet) shows the exact page pairs for your document.

### Mini-book (many pages per sheet)

1. Set **Book Size** to A7 (or smaller)
2. Set **Pages Per Sheet** to 8 (or 16)
3. Choose **Mini Book** or **Normal** mode
4. Print duplex, cut and assemble per your layout

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| ← → | Previous / next sheet in preview |
| Ctrl+P / Cmd+P | Print |
| Ctrl+S / Cmd+S | Download print-ready PDF |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build |
| `npm test` | Run imposition unit tests |
| `npm run lint` | ESLint |

## Supported formats

| Format | Support |
|--------|---------|
| PDF | Full support |
| DOCX | Converted in-browser (page count approximate) |
| DOC | Not supported |

## Privacy

- No files leave your device
- No API calls or cloud processing
- All bytes stay in memory; reload clears data

## Architecture

- **React 19 + TypeScript + Vite**
- **Tailwind CSS + shadcn-style UI**
- **pdf-lib** — PDF merge and export
- **PDF.js** — preview rendering
- **mammoth.js** — DOCX → HTML → PDF
- **Comlink Web Workers** — imposition and export off main thread
- **Zustand** — settings and document state
- **Framer Motion** — UI animations

## License

Private project — all rights reserved.
