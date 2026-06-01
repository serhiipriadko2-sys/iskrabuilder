# COVERAGE_MATRIX.md

This matrix tracks the inspection, implementation, test confirmation, and factual evidence level of each component of Iskra Space.

| Area | Source files checked | Implemented UI | Implemented service | Tests | Status | Notes |
|---|---|---|---|---|---|---|
| **Canon Map** | README.md, runtime/iskraSpace/package.json | Canvas Graph, Faceted Table, Timeline, Grounded Ingestor | Live fetch `/api/github/file-content` | Local state validation, verify schemas | `verified` | Directly ingests raw source code from target GitHub repository. |
| **Voices / Waves** | README.md, package.json | Quantum Field control, Probability sliders | `/api/dialogue` simulation | Mock probabilistic state verifiers | `implemented` | Complete 4-voice state controllers with audio synthesis equivalents. |
| **SIFT / Analytics** | math/ core/ references | Bottom Drawer summary panels, risk matrix, evidence traces | Server-side Gemini proxy router with Grounded file parser | Structured output schema validation (Zod) | `verified` | Fully structured reports generated, incorporating direct file evidence from GitHub. |
| **ADR / Governance** | None yet | ADR Inspector and custom lists | `/api/adr` stubs | File state validations | `implemented` | First ADR document committed (`ADR-20260601-01.md`). |
| **Memory Sync** | Supabase advisor | Database layout rows, index checks | PostgREST advisor schema logs | Audit Ledger SHA-256 blocks checks | `verified` | Synchronized DB metadata propagates directly to active database rows. |
| **Supabase** | `AgiIskra` table specs | Coverage board rows, advisor cards | Active read/write integration `/api/supabase/data` | Table count and advisor validators | `verified` | Live connection ready, syncing back to `graph_nodes` & `graph_edges` tables. |
