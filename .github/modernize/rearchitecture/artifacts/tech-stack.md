# Tech Stack

## Verified source configuration

- Frontend: HTML, CSS, browser JavaScript.
- Backend: Express, ES modules, Node built-in `fetch`, `AbortSignal.timeout`.
- Model protocol: Ollama `/api/chat`, non-streaming.
- Default model: `llama3.2:3b`, configurable with `OLLAMA_MODEL`.
- AI core: `ai-core.js` task classifier, bounded calculator, and practice validator.
- Retrieval: `knowledge.js` lexical retrieval over four source-attributed chunks in `knowledge-base.json`; embeddings are not enabled yet.
- Frontend deployment: GitHub Pages workflow.
- Progress storage: browser `localStorage`.

## Hardware evidence

Collected from Windows WMI on 2026-10-15:

- Physical memory: 16,866,881,536 bytes (approximately 15.7 GiB).
- Logical processors: 16.
- GPU: NVIDIA GeForce RTX 3050 Laptop GPU, reported adapter memory 4,293,918,720 bytes.
- Integrated GPU: Intel UHD Graphics, reported adapter memory 1,073,741,824 bytes.

No Node.js or Ollama executable was found in PATH. No model load or benchmark result is claimed.

## Architecture blockers

- There is no classifier/router, retrieval store, embedding adapter, calculator, answer verifier, rate limiter, or benchmark runner.
- `/api/chat` now performs bounded classification, optional deterministic calculation, source retrieval, and one model call.
- `/api/tutor` asks for formatted sections but does not validate factual or mathematical output.
- `/api/practice` validates structure and duplicate options; it does not yet detect all ambiguity, multiple correct answers, or explanation contradictions.
- `app.js` includes a small fallback response selector. It is explicitly a connection fallback, not an AI capability.
