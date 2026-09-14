import { Link } from "react-router-dom";
import "./Footer.css";

const GROUPS = [
  { title: "Product", links: ["Create", "Explore", "Effects", "Pricing"] },
  { title: "Models", links: ["Seedance 2.5", "Kling 3.0", "Veo 3.1", "Sora 2"] },
  { title: "Company", links: ["About", "Careers", "Enterprise", "Contact"] },
  { title: "Legal", links: ["Terms", "Privacy", "Guidelines"] },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="page footer__inner">
        <div className="footer__brandcol">
          <Link to="/" className="footer__brand">
            <span className="footer__mark" aria-hidden="true" />
            Higgsfield
          </Link>
          <p className="footer__tag">An AI-native creative suite.</p>
          <p className="footer__demo">
            Demo build — a rebuild of higgsfield.ai. Results are pre-rendered
            sample clips, not live model output.
          </p>
        </div>

        <div className="footer__groups">
          {GROUPS.map((g) => (
            <div key={g.title} className="footer__group">
              <h3 className="footer__group-title">{g.title}</h3>
              <ul>
                {g.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="footer__link">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="page footer__base">
        <span>© {new Date().getFullYear()} Higgsfield rebuild</span>
        <span>Built as an assignment piece</span>
      </div>
    </footer>
  );
}
