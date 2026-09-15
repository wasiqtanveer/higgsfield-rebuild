import FeatureRail from "../../components/FeatureRail/FeatureRail.jsx";
import PromoBanner from "../../components/PromoBanner/PromoBanner.jsx";
import ProductTiles from "../../components/ProductTiles/ProductTiles.jsx";
import McpBanner from "../../components/McpBanner/McpBanner.jsx";
import BandHead from "../../components/BandHead/BandHead.jsx";
import PresetGrid from "../../components/PresetGrid/PresetGrid.jsx";
import ModelBand from "../../components/ModelBand/ModelBand.jsx";
import WallReveal from "../../components/WallReveal/WallReveal.jsx";
import ProjectGrid from "../../components/ProjectGrid/ProjectGrid.jsx";
import Supercomputer from "../../components/Supercomputer/Supercomputer.jsx";
import CanvasBanner from "../../components/CanvasBanner/CanvasBanner.jsx";
import PhotodumpBanner from "../../components/PhotodumpBanner/PhotodumpBanner.jsx";
import FeatureCloud from "../../components/FeatureCloud/FeatureCloud.jsx";
import { CLIPS } from "../../data/gallery.js";
import "./Explore.css";

/* Each wall gets its own id-stamped copy of the clips: the same clip appearing
   in two walls is fine, two React children sharing a key is not. */
const wallOf = (prefix, extra = 0) =>
  [...CLIPS, ...CLIPS.slice(0, Math.max(extra, 0))]
    .slice(0, extra < 0 ? CLIPS.length + extra : undefined)
    .map((c, i) => ({ ...c, id: `${prefix}-${c.id}-${i}` }));

const GENJUTSU_WALL = wallOf("gj", 6);
const SEEDANCE_WALL = wallOf("sd", 4);
const GPT_IMAGE_WALL = wallOf("gi", 2);
const MARKETING_WALL = wallOf("mk", 3);
const SEEDANCE20_WALL = wallOf("s20", 4);
const SOUL_CINEMA_GRID = wallOf("scin", -3);
const SOUL2_WALL = wallOf("soul", 2);

export default function Explore() {

  return (
    <div className="explore">
      <div className="page page--wide">
        <FeatureRail />

        {/* Offer and product tiles share one row: the offer is the wide half,
            the six tiles the dense one. Below the desktop breakpoint they
            stack, offer first -- it is the reason the row exists. */}
        <div className="explore__promo-row">
          <PromoBanner />
          <ProductTiles />
        </div>

        <section className="explore__band">
          <McpBanner />
        </section>

        <section className="explore__band" aria-labelledby="vfx-title">
          <BandHead
            id="vfx-title"
            title="Visual Effects"
            sub="Big-budget visual effects, from explosions to surreal transformations."
            actions={[{ label: "Try for free", to: "/create" }]}
          />
          <WallReveal action={{ label: "View all presets", to: "/create" }}>
            <PresetGrid layout="wall" />
          </WallReveal>
        </section>

        <section className="explore__band">
          <ModelBand
            badge="New model"
            title="Higgsfield Genjutsu"
            sub="Reality Manipulation — transfer motion into new scenes, or swap details while everything else stays as filmed."
            actions={[
              { label: "Try free", to: "/create" },
              { label: "Learn more", to: "/create", tone: "light" },
            ]}
            /* Five columns need more than twelve tiles before the wall stops
               ending in a ragged row of half-empty columns. */
            clips={GENJUTSU_WALL}
            reveal={{ label: "View all examples", to: "/explore" }}
          />
        </section>

        <section className="explore__band">
          <ModelBand
            badge="Top model"
            title="Seedance 2.5"
            sub="Create cinematic videos up to 30 seconds, with sound."
            actions={[
              { label: "Try free", to: "/create" },
              { label: "Learn more", to: "/create", tone: "light" },
            ]}
            clips={SEEDANCE_WALL}
            reveal={{ label: "View all of Seedance 2.5", to: "/explore" }}
          />
        </section>

        <section className="explore__band" aria-labelledby="proj-title">
          <BandHead
            id="proj-title"
            title="Explore the inside of every project"
            sub="See all prompts, assets, and how each project was created"
          />
          <WallReveal action={{ label: "Explore community", to: "/explore" }}>
            <ProjectGrid />
          </WallReveal>
        </section>

        <section className="explore__band">
          <Supercomputer />
        </section>

        <section className="explore__band">
          <ModelBand
            flat
            title="GPT Image 2"
            sub="4K images with near-perfect text rendering."
            columns={4}
            clips={GPT_IMAGE_WALL}
            reveal={{ label: "View all of GPT Image 2", to: "/explore" }}
          />
        </section>

        <section className="explore__band">
          <CanvasBanner />
        </section>

        <section className="explore__band">
          <ModelBand
            flat
            title="Marketing Studio"
            sub="See what creators and brands are making with Marketing Studio."
            columns={3}
            clips={MARKETING_WALL}
            reveal={{ label: "View all of Marketing Studio", to: "/explore" }}
          />
        </section>

        <section className="explore__band">
          <ModelBand
            flat
            title="Seedance 2.0"
            sub="Browse premium AI video generations from the Higgsfield community."
            columns={4}
            clips={SEEDANCE20_WALL}
            reveal={{ label: "View all of Seedance 2.0", to: "/explore" }}
          />
        </section>

        <section className="explore__band">
          <PhotodumpBanner />
        </section>

        <section className="explore__band">
          <ModelBand
            flat
            title="Higgsfield Soul Cinema"
            sub="Explore Higgsfield Community gallery for stunning Higgsfield Soul Cinema creations."
            columns={3}
            ratio="16 / 9"
            clips={SOUL_CINEMA_GRID}
            reveal={{ label: "View all of Soul Cinema", to: "/explore" }}
          />
        </section>

        <section className="explore__band">
          <ModelBand
            flat
            title="Higgsfield Soul 2.0"
            sub="A culture-native photo model built for fashion, aesthetics, and creative expression."
            columns={3}
            clips={SOUL2_WALL}
            reveal={{ label: "View all of Soul 2.0", to: "/explore" }}
          />
        </section>

        <section className="explore__band">
          <FeatureCloud />
        </section>

      </div>
    </div>
  );
}
