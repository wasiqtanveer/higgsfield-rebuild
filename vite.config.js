import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Serve /api during `npm run dev`.
 *
 * Vercel runs everything in /api as a serverless function in production, but
 * Vite knows nothing about that, so without this the Generate button is dead
 * locally and the only way to exercise the real endpoint is to deploy. That is
 * a bad loop to develop a composer in.
 *
 * This mounts the SAME handler files Vercel will run — it does not reimplement
 * them — and adapts Node's req/res to the small slice of the Express-ish API
 * those handlers use. Dev only: `apply: "serve"` keeps it out of the build.
 */
function apiDev() {
  return {
    name: "graft-api-dev",
    apply: "serve",
    configureServer(server) {
      // Load .env for the dev process. Vite only exposes VITE_-prefixed vars to
      // the client, and these must never reach it — they are read here, in the
      // Node process, exactly as they will be on Vercel.
      try {
        const env = readFileSync(new URL(".env", import.meta.url), "utf8");
        for (const line of env.split(/\r?\n/)) {
          const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
          if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
        }
      } catch {
        /* No .env: the handlers fall back to the keyless provider, which is
           exactly what they are built to do. */
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();

        const route = req.url.split("?")[0].replace(/\/+$/, "");
        let handler;
        try {
          // Fresh import each request so editing a handler does not need a
          // server restart, matching the HMR the rest of dev already gives.
          const mod = await server.ssrLoadModule(`.${route}.js`);
          handler = mod.default;
        } catch {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: `No handler for ${route}` }));
        }

        const body = await new Promise((resolve) => {
          const chunks = [];
          req.on("data", (c) => chunks.push(c));
          req.on("end", () => {
            const raw = Buffer.concat(chunks).toString("utf8");
            try {
              resolve(raw ? JSON.parse(raw) : {});
            } catch {
              resolve(raw);
            }
          });
        });

        // The handler contract: status().json(), setHeader().
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (payload) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(payload));
          return res;
        };

        try {
          await handler({ ...req, body, method: req.method }, res);
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(err?.message || err) }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiDev()],
});
