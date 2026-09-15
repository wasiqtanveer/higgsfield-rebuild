/**
 * Authored icon set.
 *
 * One consistent grid (24), one stroke weight (1.6), round caps and joins.
 * Drawn rather than pulled from a font or emoji so the whole set shares a
 * single hand -- mixing sources is the tell that an interface was assembled.
 */

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Svg({ children, size = 20, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Search = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" {...S} />
    <path d="M16 16l4.5 4.5" {...S} />
  </Svg>
);

export const Bell = (p) => (
  <Svg {...p}>
    <path d="M18 9a6 6 0 10-12 0c0 4-1.5 5.5-1.5 5.5h15S18 13 18 9z" {...S} />
    <path d="M10.3 18.5a2 2 0 003.4 0" {...S} />
  </Svg>
);

export const Diamond = (p) => (
  <Svg {...p}>
    <path d="M12 3l4.5 5.2L12 21 7.5 8.2 12 3z" {...S} />
    <path d="M4.6 8.2h14.8" {...S} />
  </Svg>
);

export const Sparkle = (p) => (
  <Svg {...p}>
    <path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9L12 3.5z" {...S} />
  </Svg>
);

export const Globe = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" {...S} />
    <path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.4 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.4-3.3-8.5S9.8 5.9 12 3.5z" {...S} />
  </Svg>
);

export const Chevron = (p) => (
  <Svg {...p}>
    <path d="M9 5l7 7-7 7" {...S} />
  </Svg>
);

export const Bars = (p) => (
  <Svg {...p}>
    <path d="M5 20V11M12 20V4M19 20v-6" {...S} />
  </Svg>
);

export const Film = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="14" rx="2.5" {...S} />
    <path d="M8 5v14M16 5v14M3.5 12h17" {...S} />
  </Svg>
);

export const Image = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="14" rx="2.5" {...S} />
    <circle cx="9" cy="10" r="1.6" {...S} />
    <path d="M4.5 17l4.6-4.3 4 3.4 2.6-2.2 3.8 3.3" {...S} />
  </Svg>
);

export const Wave = (p) => (
  <Svg {...p}>
    <path d="M3.5 14.5c3-7 5.5-7 8.5 0s5.5 7 8.5 0" {...S} />
  </Svg>
);

export const Terminal = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="14" rx="2.5" {...S} />
    <path d="M7.5 10l2.5 2.2-2.5 2.2M12.5 15h4" {...S} />
  </Svg>
);

export const Burst = (p) => (
  <Svg {...p}>
    <path d="M12 3v5M12 16v5M3 12h5M16 12h5M5.6 5.6l3.5 3.5M14.9 14.9l3.5 3.5M18.4 5.6l-3.5 3.5M9.1 14.9l-3.5 3.5" {...S} />
  </Svg>
);

export const Cube = (p) => (
  <Svg {...p}>
    <path d="M12 3l8 4.4v9.2L12 21l-8-4.4V7.4L12 3z" {...S} />
    <path d="M4 7.4l8 4.4 8-4.4M12 11.8V21" {...S} />
  </Svg>
);

/** The wordmark's squiggle. Used in the nav and footer marks. */
export const Mark = ({ size = 22, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...rest}>
    <path
      d="M3 15.5c2.8-6.5 5.2-6.5 7.6 0s4.8 6.5 7.6 0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
    />
    <path
      d="M6 9.2c2.4-4.6 4.4-4.6 6.4 0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      opacity="0.55"
    />
  </svg>
);

export const Folder = (p) => (
  <Svg {...p}>
    <path d="M3.5 8.2a2 2 0 012-2h3.3l2 2.2h7.7a2 2 0 012 2v6.4a2 2 0 01-2 2h-13a2 2 0 01-2-2V8.2z" {...S} />
  </Svg>
);

export const ArrowLeft = (p) => (
  <Svg {...p}>
    <path d="M14.5 5.5L8 12l6.5 6.5" {...S} />
  </Svg>
);

export const ArrowRight = (p) => (
  <Svg {...p}>
    <path d="M9.5 5.5L16 12l-6.5 6.5" {...S} />
  </Svg>
);

/* --- menu glyphs --------------------------------------------------------
 * The mega-menu needs ~40 distinct marks. Drawn on the same 24 grid and the
 * same 1.6 stroke as the rest of the set rather than pulled from brand logos:
 * a panel that mixes authored icons with vendor wordmarks looks assembled. */

export const Camera = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="6.5" width="17" height="11" rx="2.5" {...S} />
    <circle cx="12" cy="12" r="3" {...S} />
  </Svg>
);

export const Nodes = (p) => (
  <Svg {...p}>
    <circle cx="6" cy="6" r="2.3" {...S} />
    <circle cx="18" cy="9" r="2.3" {...S} />
    <circle cx="8.5" cy="18" r="2.3" {...S} />
    <path d="M8.1 7.1l7.8 1.2M6.6 8.2l1.5 7.6" {...S} />
  </Svg>
);

export const Head = (p) => (
  <Svg {...p}>
    <path d="M12 3.5a5.5 5.5 0 00-4.4 8.8v3.2a2 2 0 002 2h1v3" {...S} />
    <path d="M12 3.5a5.5 5.5 0 014.4 8.8v3.2a2 2 0 01-2 2h-1v3" {...S} />
  </Svg>
);

export const Portrait = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="16" height="16" rx="2.5" {...S} />
    <circle cx="12" cy="10" r="2.4" {...S} />
    <path d="M7.5 17.5c1.1-2.1 2.7-3.1 4.5-3.1s3.4 1 4.5 3.1" {...S} />
  </Svg>
);

export const Light = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3.6" {...S} />
    <path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7" {...S} />
  </Svg>
);

export const Brush = (p) => (
  <Svg {...p}>
    <path d="M19.2 4.8c1 1 1 2.4 0 3.3l-7.4 7.4-3.3-3.3 7.4-7.4c1-1 2.4-1 3.3 0z" {...S} />
    <path d="M8.5 12.2c-2 0-3.6 1.6-3.6 3.6 0 1.1-.4 2.2-1.4 3 1.9.5 5.6.9 7.2-1.4a3.6 3.6 0 00-2.2-5.2z" {...S} />
  </Svg>
);

export const Upscale = (p) => (
  <Svg {...p}>
    <path d="M4 9V4.5h4.5M20 15v4.5h-4.5M15.5 4.5H20V9M8.5 19.5H4V15" {...S} />
    <rect x="9" y="9" width="6" height="6" rx="1.2" {...S} />
  </Svg>
);

export const Swap = (p) => (
  <Svg {...p}>
    <path d="M4 8.5h12.5l-3-3M20 15.5H7.5l3 3" {...S} />
  </Svg>
);

export const Layers = (p) => (
  <Svg {...p}>
    <path d="M12 3.5l8.5 4.4L12 12.3 3.5 7.9 12 3.5z" {...S} />
    <path d="M4.5 12.3L12 16.2l7.5-3.9M4.5 16.5L12 20.4l7.5-3.9" {...S} />
  </Svg>
);

export const Bolt = (p) => (
  <Svg {...p}>
    <path d="M13.5 3L5.5 13.5h5L10 21l8.5-10.5h-5.2L13.5 3z" {...S} />
  </Svg>
);

export const Aperture = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" {...S} />
    <path d="M12 3.5L8 12l4 8.5M20.5 12H12l-4-8.5M3.5 12h8.5l4 8.5" {...S} />
  </Svg>
);

export const Scissors = (p) => (
  <Svg {...p}>
    <circle cx="6.5" cy="17.5" r="2.4" {...S} />
    <circle cx="17.5" cy="17.5" r="2.4" {...S} />
    <path d="M8.2 15.6L18 4M15.8 15.6L6 4" {...S} />
  </Svg>
);

export const Frame = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="6" width="17" height="12" rx="2" {...S} />
    <path d="M8.5 3.5v17M15.5 3.5v17" {...S} />
  </Svg>
);

export const Tag = (p) => (
  <Svg {...p}>
    <path d="M11.2 3.5H20v8.8l-8.7 8.7a1.6 1.6 0 01-2.3 0L3.5 15.5a1.6 1.6 0 010-2.3l7.7-9.7z" {...S} />
    <circle cx="16.2" cy="7.8" r="1.3" {...S} />
  </Svg>
);

export const Palette = (p) => (
  <Svg {...p}>
    <path d="M12 3.5a8.5 8.5 0 000 17c1.4 0 2-1 2-1.9 0-1.5-1.6-1.7-1.6-3 0-1 .9-1.7 2-1.7h1.7a4.4 4.4 0 004.4-4.4c0-3.3-3.8-6-8.5-6z" {...S} />
    <circle cx="8" cy="10" r="1.1" {...S} />
    <circle cx="12" cy="7.5" r="1.1" {...S} />
    <circle cx="16" cy="10" r="1.1" {...S} />
  </Svg>
);

export const Mic = (p) => (
  <Svg {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" {...S} />
    <path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v3" {...S} />
  </Svg>
);

export const Waveform = (p) => (
  <Svg {...p}>
    <path d="M3.5 12h2M8 7v10M12 4.5v15M16 8.5v7M20.5 11v2" {...S} />
  </Svg>
);

export const Speaker = (p) => (
  <Svg {...p}>
    <path d="M11.5 4.5L6.8 8.5H3.5v7h3.3l4.7 4v-15z" {...S} />
    <path d="M15.5 9.2a4 4 0 010 5.6M18.3 6.4a8 8 0 010 11.2" {...S} />
  </Svg>
);

export const Doc = (p) => (
  <Svg {...p}>
    <path d="M13.5 3.5H7a2 2 0 00-2 2v13a2 2 0 002 2h10a2 2 0 002-2V9l-5.5-5.5z" {...S} />
    <path d="M13.5 3.5V9H19M8.5 13.5h7M8.5 16.5h4.5" {...S} />
  </Svg>
);

/** Six-fold knot, drawn for the Astra lockup. Authored rather than the vendor
 *  wordmark, so the headline stays in one hand with the rest of the set. */
export const Knot = ({ size = 24, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...rest}>
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx="12" cy="12" rx="3.1" ry="8.2" transform={`rotate(${a} 12 12)`} />
      ))}
    </g>
  </svg>
);

export const Compass = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" {...S} />
    <path d="M15.2 8.8l-1.9 4.5-4.5 1.9 1.9-4.5 4.5-1.9z" {...S} />
  </Svg>
);

export const ArrowUpRight = (p) => (
  <Svg {...p}>
    <path d="M7.5 16.5L16.5 7.5M8.8 7.5h7.7v7.7" {...S} />
  </Svg>
);

export const Megaphone = (p) => (
  <Svg {...p}>
    <path d="M4 10.5v3a1.5 1.5 0 001.5 1.5H8l6 4V6.5l-6 4H5.5A1.5 1.5 0 004 10.5z" {...S} />
    <path d="M17.5 9.5a4 4 0 010 5" {...S} />
  </Svg>
);

export const Cursor = (p) => (
  <Svg {...p}>
    <path d="M6 3.5l12.5 7.6-5.6 1.4-2.3 5.4L6 3.5z" {...S} />
  </Svg>
);

export const Globe2 = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="7.5" {...S} />
    <path d="M4.5 12h15M12 4.5c1.9 2.1 2.9 4.7 2.9 7.5s-1 5.4-2.9 7.5c-1.9-2.1-2.9-4.7-2.9-7.5S10.1 6.6 12 4.5z" {...S} />
  </Svg>
);

export const Users = (p) => (
  <Svg {...p}>
    <circle cx="9.5" cy="9" r="3.2" {...S} />
    <path d="M3.8 19c0-3 2.6-4.8 5.7-4.8s5.7 1.8 5.7 4.8" {...S} />
    <path d="M16 6.4a3 3 0 010 5.6M17.4 14.6c1.8.6 2.8 1.9 2.8 4.4" {...S} />
  </Svg>
);

export const Pin = (p) => (
  <Svg {...p}>
    <path d="M12 21s6-5.3 6-9.6A6 6 0 006 11.4C6 15.7 12 21 12 21z" {...S} />
    <circle cx="12" cy="11" r="2.2" {...S} />
  </Svg>
);

export const Robot = (p) => (
  <Svg {...p}>
    <rect x="4" y="8" width="16" height="11" rx="3.5" {...S} />
    <path d="M12 8V4.5M9.5 13.2v.8M14.5 13.2v.8" {...S} />
  </Svg>
);

export const Close = (p) => (
  <Svg {...p}>
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" {...S} />
  </Svg>
);

export const Check = (p) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" {...S} />
  </Svg>
);

export const Lock = (p) => (
  <Svg {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" {...S} />
    <path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" {...S} />
  </Svg>
);

export const Info = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" {...S} />
    <path d="M12 11v5.5M12 7.8v.6" {...S} />
  </Svg>
);

export const Coin = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="7.5" {...S} />
    <path d="M9.5 12h5" {...S} />
  </Svg>
);

export const Minus = (p) => (
  <Svg {...p}>
    <path d="M6 12h12" {...S} />
  </Svg>
);

/** The Assets glyph reads as a solid block at nav size in the real product,
 *  not as an outline. Drawn filled rather than stroked so it stays that way
 *  instead of turning to mud when the header condenses. */
export const FolderSolid = ({ size = 20, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...rest}>
    <path
      fill="currentColor"
      d="M3 7.6a2 2 0 012-2h3.2l1.9 2.1H19a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-9.1z"
    />
  </svg>
);

export const Infinity = (p) => (
  <Svg {...p}>
    <path
      d="M8.2 9.3a3.4 3.4 0 100 5.4c1.5-1.1 2.3-2.7 3.8-2.7s2.3 1.6 3.8 2.7a3.4 3.4 0 100-5.4c-1.5 1.1-2.3 2.7-3.8 2.7S9.7 10.4 8.2 9.3z"
      {...S}
    />
  </Svg>
);

export const Plus = (p) => (
  <Svg {...p}>
    <path d="M12 6v12M6 12h12" {...S} />
  </Svg>
);

export const User = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.6" {...S} />
    <path d="M5 19.5c0-3.4 3.1-5.4 7-5.4s7 2 7 5.4" {...S} />
  </Svg>
);

export const Gear = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3.1" {...S} />
    <path d="M12 3.6l1.5 2.2 2.6-.5.5 2.6 2.2 1.5-1.3 2.3 1.3 2.3-2.2 1.5-.5 2.6-2.6-.5L12 20.4l-1.5-2.2-2.6.5-.5-2.6-2.2-1.5L6.5 12 5.2 9.7l2.2-1.5.5-2.6 2.6.5L12 3.6z" {...S} />
  </Svg>
);

export const Share = (p) => (
  <Svg {...p}>
    <circle cx="17.5" cy="6" r="2.5" {...S} />
    <circle cx="6.5" cy="12" r="2.5" {...S} />
    <circle cx="17.5" cy="18" r="2.5" {...S} />
    <path d="M8.8 10.8l6.4-3.5M8.8 13.2l6.4 3.5" {...S} />
  </Svg>
);

export const Discord = (p) => (
  <Svg {...p}>
    <path d="M8.4 7.4A12 12 0 0112 7c1.3 0 2.5.14 3.6.4 1.9.9 3.2 3.4 3.4 7.2a10 10 0 01-3.2 1.9l-.9-1.5a7.7 7.7 0 002-1" {...S} />
    <path d="M15.6 7.4A12 12 0 0012 7c-1.3 0-2.5.14-3.6.4-1.9.9-3.2 3.4-3.4 7.2a10 10 0 003.2 1.9l.9-1.5a7.7 7.7 0 01-2-1" {...S} />
    <path d="M9.8 12.6v.5M14.2 12.6v.5" {...S} />
  </Svg>
);

export const Translate = (p) => (
  <Svg {...p}>
    <path d="M3.5 6.5h7M7 4.8v1.7M8.8 6.5c0 3-2 5.6-5 6.8M5.2 9.6c1 1.8 2.8 3 5 3.7" {...S} />
    <path d="M12.5 20l3.6-8.6L19.7 20M13.9 17h4.4" {...S} />
  </Svg>
);

export const SignOut = (p) => (
  <Svg {...p}>
    <path d="M14.5 4.5h-7a2 2 0 00-2 2v11a2 2 0 002 2h7" {...S} />
    <path d="M13 12h7.5M17.8 8.8L21 12l-3.2 3.2" {...S} />
  </Svg>
);

export const Crown = (p) => (
  <Svg {...p}>
    <path
      fill="currentColor"
      d="M4 8.4l3.6 2.7L12 5.6l4.4 5.5L20 8.4l-1.5 9.2h-13L4 8.4z"
    />
  </Svg>
);

export const BellSnooze = (p) => (
  <Svg {...p}>
    <path d="M18 9.6a6 6 0 10-12 0c0 4-1.5 5.5-1.5 5.5h15S18 13.6 18 9.6z" {...S} />
    <path d="M10.3 19a2 2 0 003.4 0" {...S} />
    <path d="M10.4 8.4h3.2l-3.2 3.6h3.2" {...S} />
  </Svg>
);

export const Mail = (p) => (
  <Svg {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" {...S} />
    <path d="M3.6 7l7.3 5.4a2 2 0 002.2 0L20.4 7" {...S} />
  </Svg>
);

export const Gift = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="9.5" width="17" height="11" rx="2" {...S} />
    <path d="M2.8 9.5h18.4M12 9.5V20.5" {...S} />
    <path d="M12 9.5S10.6 3.5 8 3.5a2.4 2.4 0 000 4.8M12 9.5s1.4-6 4-6a2.4 2.4 0 010 4.8" {...S} />
  </Svg>
);
