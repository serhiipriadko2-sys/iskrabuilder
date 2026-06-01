# AGENT_MEMORY.md

## 0. Status
- Project: Iskra Builder / Compass / Canvas
- Current phase: implementation
- Last verified date: 2026-06-01
- Confidence: 0.95

## 1. Stable decisions
| ID | Decision | Evidence | ADR/link | Status |
|---|---|---|---|---|
| DEC-001 | Build multi-tab bottom drawer combining Quantum Dialogue, Evidence Coverage, structured Gemini API reports, and Cryptographic ledger block inspector | Tested & validated in UI compilation | `/src/App.tsx` | Stable |
| DEC-002 | Strict server-side Gemini integration and read-only environment mocks for Git / DB queries | Code verification of API routes | `/server.ts` | Stable |
| DEC-003 | Fully interactive faceted layout in left rail (Collapsible Metrics vs filters) | Filter state reactivity checks | `/src/App.tsx` / `/src/components/MetricsPanel.tsx` | Stable |

## 2. Architecture constraints
- **Frontend**: React 19 / TypeScript 5.8 / Vite 6.2 with Tailwind CSS. Layout must be desktop-first precision, fully fluid on 100vh screens.
- **Backend**: Express + Vite custom server running on Port 3000. All Gemini APIs proxied server-side using `@google/genai`.
- **Storage**: Client-side reactive memory with local JSON snap state backup, synced back to a placeholder state service on Node runtime.
- **Auth**: None in MVP phase, read-only first.
- **Secrets**: Server-side only via `.env` loaded into Node environment, never bundled in the frontend bundle.
- **Deployment**: Production build via `npm run build` targeting `dist/server.cjs` and `dist/index.html`.
- **Forbidden**: No client-side Gemini requests, no hardcoded secrets, no destructive SQL mutations or automatic unapproved canvas restructures.

## 3. Source map
| Source | Purpose | Truth level | Notes |
|---|---|---|---|
| `serhiipriadko2-sys/iskra` | Main monorepo source containing `@iskra/core`, `@iskra/math` and `@iskra/engine`. | `[FACT]` | Verified in README, default branch `main`. Found during API ingestion. |
| `AgiIskra` Supabase Ref | Postgres backplane containing core journal, habit, and graph nodes. | `[FACT]` | Verified via API endpoint schemas output. |
| Supabase Security Advisor warnings | Public schema vulnerability vector checks. | `[FACT]` | Verified in db logs schemas output. |

## 4. Known risks / drift
| Risk | Signal | Mitigation | Owner |
|---|---|---|---|
| Mutable function search paths | Supabase advisor vulnerability check trigger | Force explicit `search_path` scopes inside DB schema | Backend |
| AST workspace loose models | Untracked app changes in apps/iskra-web | Synchronize with coverage matrix checklist | Agent |

## 5. Open questions
| Question | Why it matters | Next evidence |
|---|---|---|
| Full state sync latency over Websockets | Crucial for real-time high-throughput multi-user setups | Test WebSocket message limits in Node.js server |
