<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Solomon X

Solomon X is a React + Vite cognitive control surface backed by an Express/WebSocket server.

## Architecture

- Frontend: `src/App.tsx` orchestrates the cognitive console, memory cortex, agent senate, trust terminal, and telemetry views.
- Server: `server.ts` serves the app, handles WebSocket messaging, and exposes `/api/health`, `/api/chat`, and `/api/predict`.
- Persistence: the main client substrates now persist to `localStorage`, so agents, chat, memory, audit logs, telemetry, and notifications survive reloads.
- Tests: `src/tests/predict.test.ts` exercises the live server routes with a mocked GenAI client.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
4. Run the tests:
   `npm run test`

## Notes

- `npm run build` creates the browser bundle and the Node server bundle in `dist/`.
- `npm run clean` removes generated artifacts using a Windows-safe command.
- The active implementation is the root workspace; imported reference trees are historical material.
