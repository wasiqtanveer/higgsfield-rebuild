/**
 * The signed-in account surfaces: what the bell drops down, and what sits
 * under the avatar.
 *
 * Notifications carry `read` and `kind` as data rather than being split into
 * three hand-written lists, because the three tabs are three filters over one
 * set -- and "Unread (1)" has to stay honest as soon as anything is read.
 */

export const NOTIF_CATEGORIES = ["All", "Collaboration", "Social", "System"];

export const NOTIFICATIONS = [
  {
    id: "n-upgrade",
    date: "July 21",
    age: "55d",
    kind: "System",
    read: false,
    glyph: "Infinity",
    title: "Upgrade and get ALL top models unlimited",
    blurb: "Seedance 2.0, Nano Banana 2, Kling 3.0 & more",
    cta: "Upgrade",
  },
  {
    id: "n-render",
    date: "July 18",
    age: "58d",
    kind: "System",
    read: true,
    glyph: "Film",
    title: "Your render finished",
    blurb: "Ridge Line · Seedance 2.5 · 11 shots",
  },
  {
    id: "n-follow",
    date: "July 18",
    age: "58d",
    kind: "Social",
    read: true,
    glyph: "Users",
    title: "avaline started following you",
    blurb: "They also liked 3 of your projects",
  },
  {
    id: "n-invite",
    date: "July 12",
    age: "64d",
    kind: "Collaboration",
    read: true,
    glyph: "Share",
    title: "You were added to Cully Hill Boys",
    blurb: "Higgsfield Studio invited you as an editor",
  },
];

/** Free plan, and the meter is full because nothing has been spent yet. The
 *  dots read off `left / total` rather than being decoration. */
export const ACCOUNT = {
  handle: "abstractcookie1532",
  plan: "Free Plan",
  credits: { left: 10, total: 10 },
  language: "English",
  links: [
    { id: "profile", label: "View profile", icon: "User" },
    { id: "account", label: "Manage Account", icon: "Gear" },
    { id: "affiliate", label: "Affiliate program", icon: "Share", badge: "New" },
    { id: "community", label: "Join Community", icon: "Discord" },
  ],
};
