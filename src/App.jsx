import { Routes, Route, useLocation } from "react-router-dom";
import Nav from "./components/Nav/Nav.jsx";
import Footer from "./components/Footer/Footer.jsx";
import Landing from "./pages/Landing/Landing.jsx";
import Create from "./pages/Create/Create.jsx";
import Studio from "./pages/Studio/Studio.jsx";
import Audio from "./pages/Audio/Audio.jsx";
import Explore from "./pages/Explore/Explore.jsx";
import Mcp from "./pages/Mcp/Mcp.jsx";
import Pricing from "./pages/Pricing/Pricing.jsx";

/* The studio owns the viewport: it is an app shell with its own scrolling
   panes, so the marketing footer is suppressed there rather than hanging a
   second scroll region off the bottom of a fixed-height layout. */
const BARE = ["/video", "/audio"];

export default function App() {
  const { pathname } = useLocation();
  const bare = BARE.includes(pathname);

  return (
    <>
      <a className="sr-only" href="#main">Skip to content</a>
      <Nav />
      <main id="main">
        {/* Home and Explore are the same surface on Higgsfield -- the feed is
            the landing page. The marketing page keeps its own route rather
            than being deleted outright. */}
        <Routes>
          <Route path="/" element={<Explore />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/create" element={<Create />} />
          <Route path="/video" element={<Studio />} />
          <Route path="/audio" element={<Audio />} />
          <Route path="/mcp" element={<Mcp />} />
          <Route path="/pricing" element={<Pricing />} />
          {/* Unknown URLs fall back to the feed rather than a blank shell. */}
          <Route path="*" element={<Explore />} />
        </Routes>
      </main>
      {!bare && <Footer />}
    </>
  );
}
