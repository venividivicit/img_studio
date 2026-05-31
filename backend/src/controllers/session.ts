import { withSession } from "../middleware/session.ts";
import { json } from "../lib/http.ts";

export const sessionRoutes = {
  "/api/sessions": {
    POST: withSession(async (_req, ctx) => {
      return json({ sessionId: ctx.sessionId });
    }),
  },
} as const;
