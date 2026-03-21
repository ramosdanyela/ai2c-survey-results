# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev           # Dev server on http://localhost:8080

# Build
npm run build         # Production build
npm run build:dev     # Dev-mode build (useful for debugging)
npm run preview       # Serve dist/ locally

# Linting
npm run lint

# JSON validation
npm run validate:json src/data/yourFile.json  # Single file
npm run validate      # All JSON files in src/data/

# Analysis
npm run analyze:all   # Unused code, unused fields, unused deps

# Docker
npm run build         # Build dist/ first
docker-compose up     # Serves on http://localhost:8888/reports/
```

No test framework is configured.

## Architecture

This is a **schema-driven report dashboard** — the entire UI is generated from a JSON report file with no hardcoded sections. The rendering stack is:

```
JSON Report File
  → useSurveyData() (React Query, 5 min stale)
    → GenericSectionRenderer (per section)
      → ComponentRegistry.renderComponent(type, data, props)
        → ChartRenderers / CardRenderers / TableRenderers / WidgetRenderers
          → Recharts / shadcn/ui / custom components
```

### Key Rendering Files

- [src/components/survey/common/ComponentRegistry.jsx](src/components/survey/common/ComponentRegistry.jsx) — Factory that maps `type` strings (e.g. `"barChart"`, `"recommendationsTable"`) to React components. **Add new component types here.**
- [src/components/survey/common/GenericSectionRenderer.jsx](src/components/survey/common/GenericSectionRenderer.jsx) — Iterates `renderSchema[]`, resolves data paths, and calls `renderComponent()`. Handles export mode wrapping.
- [src/report-engine/dataResolvers.ts](src/report-engine/dataResolvers.ts) — Pure TS functions (no React). `resolveDataPath(obj, "section.barChart")` resolves dot-notation paths; `resolveTemplate(template, data)` replaces `{{path}}` placeholders. Safe to use in Node.js/Workers.
- [src/services/surveyDataService.js](src/services/surveyDataService.js) — Currently imports a mock JSON. To switch to a real API, replace `fetchSurveyData()` here. See `docs/MIGRACAO_MOCKS_PARA_API_REAL.md`.

### JSON Report Schema

Each section in the report JSON follows this shape:
```json
{
  "id": "string",
  "title": "string",
  "renderSchema": [
    {
      "type": "barChart",
      "dataPath": "sectionData.barChart",
      "config": {},
      "components": []
    }
  ],
  "data": {}
}
```

`uiTexts` at the root provides all display strings (fully documented in `docs/REFERENCIA_UITEXTS_JSON.md`).

### Routes

- `/` — Index/landing
- `/export` — Section selection + sidebar stats
- `/export/preview` — A4-ready print preview (accepts URL params for section selection)
- `/json-viewer` — JSON inspection/debug tool

### Styling

- Tailwind CSS with class-based dark mode
- Colors: primary orange `#ff9e2b`, custom blue `#1982d8` — see [src/lib/colors.js](src/lib/colors.js)
- Custom breakpoint `top3: 1360px` for 2-column layouts
- Fonts: Inter (body), Poppins (headings) via Google Fonts

### Export

- **Word export:** [src/utils/wordExport/](src/utils/wordExport/) — uses `docx` + `html2canvas`. Components to be captured as images are marked with `data-word-export="image"` by GenericSectionRenderer in export mode.
- **PDF:** Browser print dialog via the A4 ExportPreview page.

### Mixed JS/TS

- `src/components/ui/` and `src/report-engine/` are TypeScript (`.tsx`/`.ts`)
- Everything else is JavaScript (`.jsx`/`.js`)
- TypeScript strict mode is **disabled** (`noImplicitAny`, `strictNullChecks` both false)

### Path Alias

`@` maps to `./src` (configured in both `vite.config.js` and `tsconfig.json`).

### Production Deployment

The app is designed to be served under the `/reports/` sub-path in production:

- **Base URL:** `vite.config.js` sets `base: "/reports/"` when `mode === "production"`. In dev, base is `/`.
- **Router:** `BrowserRouter` uses `basename={import.meta.env.BASE_URL}`, so all routes (e.g. `/export`) are automatically prefixed with `/reports/` in production.
- **Nginx:** `nginx.conf` maps `/reports/` to `dist/` with `try_files` fallback to `index.html` for SPA routing. The docker-compose mounts `./dist` into the container at `/usr/share/nginx/html/reports`.
- **Build before Docker:** Run `npm run build` to generate `dist/` before starting `docker-compose up`.
