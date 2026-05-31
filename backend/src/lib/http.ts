import { toClientError } from "./errors.ts";

export function json<T>(data: T, init?: ResponseInit): Response {
  return Response.json(data, init);
}

export function errorResponse(error: unknown): Response {
  const { status, body } = toClientError(error);
  return json(body, { status });
}

export function parseCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get("cookie");
  if (!header) return undefined;

  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export function setSessionCookie(sessionId: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `sid=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax${secure}`;
}
