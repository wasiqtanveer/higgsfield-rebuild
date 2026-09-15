/* Route smoke test. Server-renders every route and fails the run if any of
   them throws. A production build only proves the modules resolve; this
   proves each page actually renders. Run with `npm run smoke`. */
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "../src/App.jsx";

const ROUTES = ["/", "/explore", "/landing", "/create", "/video", "/audio", "/mcp", "/pricing", "/nope-404"];
let fail = 0;
for (const r of ROUTES) {
  try {
    const html = renderToString(
      React.createElement(StaticRouter, { location: r }, React.createElement(App))
    );
    console.log(String(html.length).padStart(7) + " chars  OK   " + r);
  } catch (e) {
    fail++;
    console.log("             FAIL " + r + "  -> " + e.message);
  }
}
process.exit(fail ? 1 : 0);
