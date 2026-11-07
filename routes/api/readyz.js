import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/readyz")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        try {
          const page = await context
            .getBase44()
            .asServiceRole.entities.MenuItem.list({ limit: 1 });
          return Response.json({ status: "ready", db: "ok", menu_items: page.items.length });
        } catch {
          return Response.json({ status: "not-ready", db: "unreachable" }, { status: 503 });
        }
      },
    },
  },
});