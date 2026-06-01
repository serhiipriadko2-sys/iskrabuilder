# HANDOFF.md

## Current state
- **What works**: 
  - Entire interactive Workspace Canvas (`/src/App.tsx`) supporting multiple view-selectors (**Canvas Map**, **Faceted Table**, **Committed Timeline**, **Risk Matrix**, and **Evidence Trace**).
  - Dynamic **Left Rail** panel featuring toggles between **Metrics/Simulators** and **Faceted Filters & Source tags**.
  - Advanced **Bottom Drawer** with comprehensive diagnostics, raw **Factual Verification Matrix**, structured **Gemini Report engine**, and block hash verifiers.
  - **Durable Database Active Binding**: Fully integrated lazy-initialized Supabase Client, active GET/POST `/api/supabase/data` proxy nodes, and background background state propagation syncing nodes to active Postgres tables (`graph_nodes` & `graph_edges`).
  - **Deep Research Grounding**: Added live file ingestion tool under Node Inspector. Clicking "Scrape Raw GitHub" fetches raw files (e.g., `README.md`, `runtime/iskraSpace/package.json`, etc.) instantly from target GitHub repo (`serhiipriadko2-sys/iskra`), displaying and feeding direct source evidence dynamically to server-side Gemini Content Generator.
  - **Advanced Flow Graph layouts**: Integrated an interactive verticallayered auto-alignment engine. Under Canvas Map mode, the user can click "Auto-Align" to dynamically arrange layered positions by rank mapping to hierarchical dependencies correctly.
  - Documented strict project workflows, architectural choices in `/docs/adr/`, and memory states preserved in `/docs/agent/`.
- **What is broken**: 
  - No active bugs. Linting and full bundle compilation compiles fully clean (`PASS`).
- **Last successful command**: `npm run build`
- **Last failed command**: none

## Next 3 actions
1. **Instruction Panel Customization**: Author custom workspace rules so users can persist instruction prompts that customize Gemini suggestions instantly.
2. **Dynamic Canvas Edge Metrics**: Add hover states on typed SVG edges and display validation signals / weights directly on the map.
3. **Ledger Verification Expansion**: Enable cryptographic block verification simulations with visual hash sequence highlights inside the Ledger Panel.

## Do not touch without confirmation
- Initial seed elements and verification states in the preloaded dictionary.
- Node types and Edge constraints defined in the system specifications.

## Critical context for next session
- The application uses Node.js standard runtime on Port 3000 mapping securely to the browser.
- Ensure all custom environment variables remain server-side and are mapped via `.env.example`.
