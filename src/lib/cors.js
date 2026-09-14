const allowedOrigins = [
  process.env.FRONTEND_URL || "https://auth-frontend-red-two.vercel.app",
  "http://localhost:5173",
].filter(Boolean);

export function getCorsHeaders(origin) {
  const allowedOrigin = allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0];

  return {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}