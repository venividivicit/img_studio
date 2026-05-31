import { AppError } from "../lib/errors.ts";
import { errorResponse, parseCookie, setSessionCookie } from "../lib/http.ts";
import { sessionRepository } from "../repositories/session_repository.ts";

const COOKIE_NAME = "sid";

export type SessionContext = {
  sessionId: string;
};

function createSession(): string {
  const sessionId = crypto.randomUUID();
  sessionRepository.create(sessionId);
  return sessionId;
}

export function resolveSession(req: Request): {
  sessionId: string;
  setCookie: boolean;
} {
  const fromCookie = parseCookie(req, COOKIE_NAME);
  if (fromCookie && sessionRepository.exists(fromCookie)) {
    return { sessionId: fromCookie, setCookie: false };
  }
  const sessionId = createSession();
  return { sessionId, setCookie: true };
}

export function withSession<T extends Request = Request>(
  handler: (req: T, ctx: SessionContext) => Promise<Response>,
): (req: T) => Promise<Response> {
  return async (req: T) => {
    try {
      const { sessionId, setCookie } = resolveSession(req);
      const response = await handler(req, { sessionId });
      if (setCookie) {
        response.headers.append("Set-Cookie", setSessionCookie(sessionId));
      }
      return response;
    } catch (error) {
      return errorResponse(error);
    }
  };
}

export function requireSession(req: Request): SessionContext {
  const sessionId = parseCookie(req, COOKIE_NAME);
  if (!sessionId || !sessionRepository.exists(sessionId)) {
    throw new AppError(
      "UNAUTHORIZED_SESSION",
      "Session is invalid. Refresh the page.",
      401,
    );
  }
  return { sessionId };
}
