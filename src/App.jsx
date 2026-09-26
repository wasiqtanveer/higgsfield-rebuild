import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header/Header.jsx";
import AuthModal from "./components/AuthModal/AuthModal.jsx";
import SiteFoot from "./components/SiteFoot/SiteFoot.jsx";
import { loadSession } from "./lib/auth.js";
import Home from "./pages/Home/Home.jsx";
import Credits from "./pages/Credits/Credits.jsx";
import GraftMcp from "./pages/Mcp/Graft.jsx";
import Create from "./pages/Create/Create.jsx";
import About from "./pages/About/About.jsx";
import Explore from "./pages/Explore/Explore.jsx";
import Models from "./pages/Models/Models.jsx";
import Lineage from "./pages/Lineage/Lineage.jsx";
import Library from "./pages/Library/Library.jsx";
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
  /* The dialog lives here rather than in the header: it is a page-level overlay,
     and mounting it inside a floating pill would trap it under that pill's
     stacking context. `null` means closed; otherwise it carries which door was
     used, so the copy matches. */
  const [authMode, setAuthMode] = useState(null);

  /* The session is an httpOnly cookie the client cannot read, so who we are is
     a question only the server can answer. Asked once, on boot. */
  useEffect(() => {
    loadSession();
  }, []);

  return (
    <>
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <Header onAuth={setAuthMode} />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/mcp" element={<GraftMcp />} />

          {/* Designed, not built. These render as an honest "next" page rather
              than as links that go nowhere or land somewhere unrelated. */}
          <Route path="/create" element={<Create />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/lineage" element={<Lineage />} />
          <Route path="/library" element={<Library />} />
          <Route path="/models" element={<Models />} />
          <Route path="/about" element={<About />} />

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

      {/* Mounted once here rather than per page. Two of nine surfaces carried
          it and seven did not, which is the shape a per-page footer always
          drifts into -- every new route is a chance to forget it. */}
      <SiteFoot />

      {authMode && (
        <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />
      )}
    </>
  );
}
