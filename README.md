# MyAI Agent

A Ukrainian-language AI chat app built with React, Express, MongoDB, and the OpenAI Responses API.

## Requirements

- Node.js 20.19+ or 22.12+
- MongoDB
- An OpenAI API key, unless using the mock AI mode

## Run locally

1. Copy `server/.env.example` to `server/.env`, then set `MONGODB_URI`, a unique `JWT_SECRET` of at least 32 characters, and `OPENAI_API_KEY`.
2. In `server/`, run `npm install` and `npm run dev`.
3. Optionally copy `client/.env.example` to `client/.env` and set `VITE_API_URL` if the API is not at `http://localhost:5000/api`.
4. In `client/`, run `npm install` and `npm run dev`, then open the URL printed by Vite.

Set `MOCK_AI=true` to exercise chat flows without calling the OpenAI API. Set `OPENAI_MODEL` to any model available to your API account. For a deployed frontend, set `CLIENT_ORIGIN` to its origin; multiple allowed origins can be comma-separated.

## Checks

Run `npm run lint` and `npm run build` from `client/`. The server starts only after it connects to MongoDB and validates its required environment variables. `/api/health` reports API and database readiness.
