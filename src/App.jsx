import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header/Header.jsx";
import Home from "./pages/Home/Home.jsx";
import Credits from "./pages/Credits/Credits.jsx";
import GraftMcp from "./pages/Mcp/Graft.jsx";
import Soon from "./pages/Soon/Soon.jsx";

/**
 * Every route on this product is Graft.
 *
 * The migration seam is gone: there is no longer a set of routes carrying the
 * previous design behind a different header, because those surfaces have been
 * deleted rather than kept alive. One header, one design system, one product.
 *
 * The catch-all is a real dead end, not the feed. Sending unknown paths to a
 * working page is how a dead link disguises itself as a working one — it is
 * what made the old clone's pages keep surfacing under the new nav.
 */
export default function App() {
  return (
    <>
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/mcp" element={<GraftMcp />} />

          {/* Designed, not built. These render as an honest "next" page rather
              than as links that go nowhere or land somewhere unrelated. */}
          <Route path="/create" element={<Soon />} />
          <Route path="/explore" element={<Soon />} />
          <Route path="/lineage" element={<Soon />} />
          <Route path="/library" element={<Soon />} />
          <Route path="/models" element={<Soon />} />
          <Route path="/about" element={<Soon />} />

          {/* Paths the clone owned, kept as redirects so anything already
              linked to them lands on the surface that replaced it rather than
              on a dead end. */}
          <Route path="/pricing" element={<Navigate to="/credits" replace />} />
          <Route path="/api" element={<Navigate to="/mcp" replace />} />
          <Route path="/landing" element={<Navigate to="/" replace />} />
          <Route path="/video" element={<Navigate to="/" replace />} />
          <Route path="/audio" element={<Navigate to="/" replace />} />

          <Route path="*" element={<Soon />} />
        </Routes>
      </main>
    </>
  );
}
