/**
 * Everything written on the site lives in this folder.
 * Edit the text here and the pages update — no need to touch the components.
 */

export const site = {
  name: "Elroe Fikremariam",
  firstName: "Elroe",
  lastName: "Fikremariam",
  roles: ["Photographer", "Full-Stack Developer"],
  tagline: "I make images and build the websites they live on.",
  description:
    "Elroe Fikremariam is a photographer and full-stack web developer. See selected photography, websites, and what is coming next.",

  /** Shows the green "available" badge in the hero. Set to false when fully booked. */
  available: true,

  contact: {
    telegram: {
      label: "Telegram",
      value: "@ELR0E",
      href: "https://t.me/ELR0E",
    },
    instagram: {
      label: "Instagram",
      value: "@elroe_e",
      href: "https://www.instagram.com/elroe_e/",
    },
    phone: {
      label: "Phone",
      value: "+251 99 426 1461",
      href: "tel:+251994261461",
    },
  },
} as const;

export const navLinks = [
  { id: "about", label: "About" },
  { id: "photography", label: "Photography" },
  { id: "development", label: "Development" },
  { id: "next", label: "Next" },
  { id: "contact", label: "Contact" },
] as const;

/** The moving band of words under the hero. */
export const marqueeWords = [
  "Photography",
  "Web development",
  "Visual storytelling",
  "Full-stack builds",
] as const;

export const about = {
  heading: { plain: "Two crafts,", accent: "one eye." },
  paragraphs: [
    "I'm Elroe — a photographer and full-stack web developer. I care about the same things in both: light, composition, and the small details most people only feel.",
    "With a camera, that means patient, honest images. With code, it means websites that load fast, read clearly and work on every screen — built end to end.",
  ],
  services: [
    {
      title: "Photography",
      text: "Images made with patience and edited with restraint, delivered ready to print or post.",
    },
    {
      title: "Web development",
      text: "Full-stack websites, from the first sketch to a live site that is fast, responsive and easy to manage.",
    },
  ],
} as const;

/** "What's next" — things in progress that are too early to show. */
export const upcoming = [
  {
    id: "apps",
    title: "Mobile apps",
    status: "In progress",
    text: "I've started building apps. The first releases will land here once they're ready.",
  },
  {
    id: "cinematography",
    title: "Cinematography",
    status: "Early days",
    text: "Moving from stills to motion. Reels and short films will follow when they're worth your time.",
  },
] as const;
