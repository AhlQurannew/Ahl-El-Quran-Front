/**
 * Single source of truth for the backend URL.
 *
 * Set NEXT_PUBLIC_API_BASE_URL in `.env.local` (see `.env.example`).
 * The port must match BACKEND_PORT in the backend's `.env` (docker-compose
 * publishes the container on that host port; it defaults to 8000).
 *
 * NEXT_PUBLIC_* values are inlined at build/dev-server start, so restart
 * `npm run dev` after changing them.
 */
// Production builds fall back to the Render API: a build that misses the variable (wrong Vercel
// project, cached build) would otherwise send every visitor's browser to their own localhost.
const DEFAULT_API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://ahlquran-api.onrender.com/api/v1'
  : 'http://localhost:8000/api/v1';

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  DEFAULT_API_BASE_URL
).replace(/\/+$/, '');

/** Backend origin without the `/api/v1` suffix (used for WebSockets, static files). */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '');
