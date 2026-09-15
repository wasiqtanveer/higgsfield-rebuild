/**
 * The wireframe room behind the MCP banner.
 *
 * Generated rather than drawn by hand: spokes run from a single vanishing
 * point out through the frame, and the depth rings are one rectangle scaled
 * geometrically toward that point. Two rules produce the whole tunnel, which
 * is why it stays coherent at any width instead of drifting the way a
 * hand-placed line set does.
 */

const W = 1600;
const H = 560;
const VPX = W / 2;
const VPY = H * 0.5;

const RINGS = 9;
const RING_STEP = 0.74;

/* Spoke density differs per edge: the floor and ceiling read as surfaces and
   need the lines, the side walls only need enough to close the box. */
const EDGE_POINTS = { top: 18, bottom: 18, left: 7, right: 7 };

function perimeterPoints() {
  const pts = [];
  for (let i = 0; i <= EDGE_POINTS.top; i++) pts.push([(W / EDGE_POINTS.top) * i, 0]);
  for (let i = 0; i <= EDGE_POINTS.bottom; i++) pts.push([(W / EDGE_POINTS.bottom) * i, H]);
  for (let i = 1; i < EDGE_POINTS.left; i++) pts.push([0, (H / EDGE_POINTS.left) * i]);
  for (let i = 1; i < EDGE_POINTS.right; i++) pts.push([W, (H / EDGE_POINTS.right) * i]);
  return pts;
}

export default function PerspectiveRoom() {
  const spokes = perimeterPoints();
  const rings = Array.from({ length: RINGS }, (_, i) => {
    const k = Math.pow(RING_STEP, i + 1);
    return {
      x: VPX - VPX * k,
      y: VPY - VPY * k,
      w: W * k,
      h: H * k,
      /* Distant rings fade: an evenly lit grid all the way in reads as
         wallpaper, not as depth. */
      o: 0.15 * Math.pow(0.86, i),
    };
  });

  return (
    <svg
      className="proom"
      viewBox={`0 0 ${W} ${H}`}
      /* Stretched, not cropped: the spokes have to reach the card's own
         corners for the box to close. Slicing pushed the floor and ceiling
         outside the frame and flattened the whole room. */
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="#ffffff" fill="none" strokeWidth="1" vectorEffect="non-scaling-stroke">
        {spokes.map(([x, y], i) => (
          <line key={`s${i}`} x1={VPX} y1={VPY} x2={x} y2={y} strokeOpacity="0.10" />
        ))}
        {rings.map((r, i) => (
          <rect
            key={`r${i}`}
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            strokeOpacity={r.o}
          />
        ))}
      </g>
    </svg>
  );
}
