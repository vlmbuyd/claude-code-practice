# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start development server with file watch (node --watch)
npm start          # Start production server
```

No test or lint tooling is configured.

## Environment Setup

Copy `.env.example` to `.env` and set `OPENAI_API_KEY`. The server exits at startup if the key is missing. Port defaults to 3000.

## Architecture

This is a single-page web app where an Express backend streams OpenAI API responses to a vanilla JS frontend via Server-Sent Events (SSE).

- **`server.js`** — Express server with one meaningful endpoint: `POST /api/generate`. It calls OpenAI (`gpt-4o-mini`) with a system prompt that instructs the model to return 5–8 naming candidates as a JSON array. The response is streamed back to the client via SSE (each chunk is a JSON message with a `text` field; the final chunk has `done: true`).
- **`public/app.js`** — Handles the SSE stream, accumulates chunks, attempts to parse the final text as JSON to extract the candidates array, and falls back to rendering raw text if parsing fails.
- **`public/index.html`** — Korean-language UI. Form inputs: identifier type, naming convention, programming language, and a required context textarea.

The system prompt (in `server.js`) is the core of the product — it defines what the model returns and in what format. Changes to the expected JSON shape must be reflected in the frontend parsing logic in `app.js`.
