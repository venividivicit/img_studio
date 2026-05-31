export async function healthCheck(req: Request) {
  return new Response(JSON.stringify({ message: "OK" }), { status: 200 });
}

export const healthRoutes = {
  "/api/health": {
    GET: healthCheck,
  },
} as const;
