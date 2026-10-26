# Project Structure

## Project type

Small single-page educational web application with a Node.js/Express backend and Ollama adapter. The frontend is static and can be deployed to GitHub Pages; the AI backend must run separately.

## Functional domains

- **Conversation learning:** `GET /` serves the page; browser chat submits to `POST /api/chat`.
- **Guided problem solving:** browser submits a school problem to `POST /api/tutor`.
- **Practice generation and scoring:** browser requests questions from `POST /api/practice`, validates them, and records local progress.
- **Local progress and parent information:** browser-only `localStorage` state and an informational modal; no account or server persistence.

## Current layers

1. `index.html` — semantic UI and forms.
2. `styles.css` — responsive presentation.
3. `app.js` — browser state, API calls, rendering, fallback text, question validation, and local progress.
4. `ai-core.js` and `knowledge.js` — task routing, deterministic calculation, practice validation, and source-attributed retrieval.
5. `server.js` — Express transport, input limits, orchestration, Ollama HTTP call, and response shaping.
6. Ollama — one configurable local model, currently defaulting to `llama3.2:3b`.

## Evidence limits

The current environment did not provide `node` or `ollama`, so runtime behavior, model quality, latency, and memory use are not verified.
