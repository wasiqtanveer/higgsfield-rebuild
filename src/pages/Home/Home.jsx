import { useEffect, useRef, useState } from "react";
import Hero from "../../components/Hero/Hero.jsx";
import Arrive from "../../components/Arrive/Arrive.jsx";
import ForkLive from "../../components/ForkLive/ForkLive.jsx";
import ForkDiff from "../../components/ForkDiff/ForkDiff.jsx";
import ModelSpec from "../../components/ModelSpec/ModelSpec.jsx";
import CloseCall from "../../components/CloseCall/CloseCall.jsx";
import SiteFoot from "../../components/SiteFoot/SiteFoot.jsx";
import "./Home.css";

/**
 * The home surface, for a visitor who has not signed in.
 *
 * The argument runs in four beats after the hero, and the order is the argument:
 * here is a prompt you can change (feed) → here is what changing one line
 * actually does (how) → here is what you can drive (models) → here is the door
 * (close). Nothing below the hero is a placeholder any more, so the slot
 * scaffolding that used to hold this page's shape is gone with them.
 *
 * What is real below the hero: the section you are reading is lit and the rest
 * recede, decided by observation rather than by a scroll handler doing
 * arithmetic on every section's bounding box.
 */

/* Section order, and the ids the focus observer ranks. The components that own
   their own <section id> are listed here too — the observer looks the ids up in
   the document, so it does not care which of us rendered the element. */
const IDS = ["feed", "how", "models", "close"];

/**
 * Which section currently owns the screen.
 *
 * The winner is the most-visible section rather than the first one to cross a
 * line: with sections of different heights, a "first past the threshold" rule
 * hands focus to a tall section long before you are actually reading it.
 */
function useSectionInFocus(ids) {
  const [active, setActive] = useState(null);
  const ratios = useRef(new Map());

  useEffect(() => {
    const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!nodes.length || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.current.set(entry.target.id, entry.intersectionRatio);
        }
        let best = null;
        let bestRatio = 0.12; // below this nothing is really being read
        for (const [id, ratio] of ratios.current) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        // Mid-flight on a long scroll, leave the previous section lit rather
        // than dropping focus to nothing.
        if (best) setActive(best);
      },
      // A step every 10% so the ranking stays accurate for sections taller than
      // the viewport, which never reach a high ratio at all.
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export default function Home() {
  const active = useSectionInFocus(IDS);

  /* The lit rail is the one thing the page still applies from the outside: each
     section owns its own composition, but "you are here" belongs to the page
     that knows the running order. */
  const rail = (id) => `home-band${active === id ? " is-focus" : ""}`;

  return (
    <>
      <Hero />

      {/* Every band arrives the same way: it comes up out of the page, tied to
          its own scroll position, and settles once it owns the screen. One
          grammar for all four, so moving between sections reads as one page
          rather than as four pages that happen to be stacked. */}
      <Arrive as="section" id="feed" className={rail("feed")} aria-labelledby="feed-title">
        <div className="page">
          <ForkLive />
        </div>
      </Arrive>

      {/* ForkDiff and ModelSpec bring their own <section id> and their own
          vertical rhythm, so they are mounted bare rather than wrapped in a
          second sectioning element. */}
      <Arrive className={rail("how")}>
        <ForkDiff />
      </Arrive>

      <Arrive className={rail("models")}>
        <ModelSpec />
      </Arrive>

      {/* The closing band travels least. It is the end of the argument and runs
          straight into the foot, so a long arrival here would read as the page
          still starting something when it is finishing. */}
      <Arrive as="section" id="close" className={rail("close")} aria-labelledby="cc-title" lift={40}>
        <CloseCall />
      </Arrive>

      <SiteFoot />
    </>
  );
}
