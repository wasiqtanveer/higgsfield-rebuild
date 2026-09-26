/**
 * The forks shown in the `#how` section.
 *
 * Every pair here has to survive the one test the section exists to pass: the
 * child must differ from the parent by roughly ONE clause, because "change one
 * line" is the product's entire claim and a diff that rewrites half the prompt
 * proves the opposite. So each `child` is its `parent` with a single middle
 * clause swapped — the framing, the light, or the lens — and nothing else
 * touched. If you edit these, diff them by eye first: two changed clauses and
 * the section is lying.
 *
 * `note` is what the fork was *for*, in the author's words. It is the reason a
 * one-word change is worth a whole new generation, and without it the diff is
 * a spelling correction rather than a decision.
 *
 * Counts are the honest kind: they describe a text artifact (a prompt and its
 * descendants), never a pair of photographs, because the media library holds no
 * two stills that are variations of one prompt.
 */
export const FORKS = [
  {
    id: "scale",
    author: "mira",
    childAuthor: "ade",
    /* The hero's own prompt, so the page reads as one continuous product
       rather than two demos that happen to share a typeface. */
    parent: "a woman walking down a manhattan avenue, at her true scale, midday, taxis for reference",
    child: "a woman walking down a manhattan avenue, at her true scale, blue hour, taxis for reference",
    changed: "midday → blue hour",
    note: "Midday flattened her against the buildings. Blue hour puts the city's own lights under her.",
    descendants: 214,
    depth: 3,
  },
  {
    id: "lens",
    author: "koji",
    childAuthor: "rue",
    parent: "street style, printed silk, chinatown awnings, shot on a 35mm at eye level",
    child: "street style, printed silk, chinatown awnings, shot on an 85mm from across the road",
    changed: "35mm at eye level → 85mm from across the road",
    note: "The 35 put the awnings in the story. The 85 makes them a wall of colour behind her.",
    descendants: 86,
    depth: 2,
  },
  {
    id: "light",
    author: "nils",
    childAuthor: "mira",
    parent: "an editorial portrait, seamless grey backdrop, hard on-camera flash, no retouching",
    child: "an editorial portrait, seamless grey backdrop, one soft window left, no retouching",
    changed: "hard on-camera flash → one soft window left",
    note: "Same set, same crop. The flash was a document; the window is a portrait.",
    descendants: 37,
    depth: 1,
  },
];
