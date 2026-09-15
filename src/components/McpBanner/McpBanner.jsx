import { Link } from "react-router-dom";
import PerspectiveRoom from "../PerspectiveRoom/PerspectiveRoom.jsx";
import { Compass, Knot, Mark } from "../Icon/Icon.jsx";
import "./McpBanner.css";

/**
 * The MCP / Astra banner.
 *
 * The lockup sets the model name as the headline with the partner glyph inline
 * between the two words, so it reads as one title rather than as a logo placed
 * next to some text.
 */
export default function McpBanner() {
  return (
    <section className="mcp" aria-labelledby="mcp-title">
      <PerspectiveRoom />
      <div className="mcp__glow" aria-hidden="true" />

      <div className="mcp__body">
        <p className="mcp__eyebrow">Higgsfield MCP with</p>

        <h2 className="mcp__title display" id="mcp-title">
          <span className="mcp__word">GPT-6</span>
          <Knot size={72} className="mcp__glyph" />
          <span className="mcp__word">Astra</span>
        </h2>

        <p className="mcp__sub">
          Build games, motion graphics, and interactive 3D
          <br />
          experiences with Higgsfield MCP
        </p>

        <div className="mcp__actions">
          <Link to="/create" className="mcp__btn mcp__btn--primary">
            <Mark size={18} />
            Install Higgsfield plugin
          </Link>
          <Link to="/explore" className="mcp__btn mcp__btn--secondary">
            <Compass size={18} />
            Explore use cases
          </Link>
        </div>
      </div>
    </section>
  );
}
