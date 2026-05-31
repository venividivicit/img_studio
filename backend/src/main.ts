import { routes } from "./controllers";
import { config } from "./core/config.ts";
import { toClientError } from "./lib/errors";

void config;

const server = Bun.serve({
  port: config.port,
  routes,
  fetch(_req: Request) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Not found" } },
      { status: 404 },
    );
  },
  error(error) {
    const { status, body } = toClientError(error);
    return Response.json(body, { status });
  },
});

console.log(`Server is running on ${server.url}`);
