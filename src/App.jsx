import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav/Nav.jsx";
import Footer from "./components/Footer/Footer.jsx";
import Landing from "./pages/Landing/Landing.jsx";
import Create from "./pages/Create/Create.jsx";
import Explore from "./pages/Explore/Explore.jsx";

export default function App() {
  return (
    <>
      <a className="sr-only" href="#main">Skip to content</a>
      <Nav />
      <main id="main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/create" element={<Create />} />
          <Route path="/explore" element={<Explore />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
