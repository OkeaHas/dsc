import type { SVGProps } from "react";

/**
 * Ikon SVG sebaris (inline).
 *
 * Sengaja tidak memakai paket ikon: satu dependensi tambahan berarti satu
 * paket yang ikut ke bundle browser, padahal cuma butuh segelintir path.
 */

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    ...props,
  };
}

export function IconHome(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function IconNews(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5h11a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2V5Z" />
      <path d="M17 8h2a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2" />
      <path d="M7 9h6M7 12.5h6M7 16h4" />
    </svg>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3 20c0-3.2 2.7-5.5 6-5.5s6 2.3 6 5.5" />
      <path d="M16 5.3a3.25 3.25 0 0 1 0 6.2M17.5 14.9c2 .8 3.5 2.6 3.5 5.1" />
    </svg>
  );
}

export function IconTrophy(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5.5H4.5A1.5 1.5 0 0 0 3 7c0 1.9 1.6 3.4 4 3.4M17 5.5h2.5A1.5 1.5 0 0 1 21 7c0 1.9-1.6 3.4-4 3.4" />
      <path d="M12 13v4M8.5 21h7M10 17h4l.5 4h-5l.5-4Z" />
    </svg>
  );
}

export function IconChat(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.4-4.2A8 8 0 1 1 21 12Z" />
      <path d="M8.5 11h7M8.5 14.5h4" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconPin(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 13l4.5 4.5L19 7" />
    </svg>
  );
}

export function IconAlert(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V13M12 16.3v.2" />
    </svg>
  );
}

export function IconInstagram(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17 7v.01" />
    </svg>
  );
}

export function IconLinkedin(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M8 10.5V16M8 7.6v.01M12 16v-3.2a1.8 1.8 0 0 1 3.6 0V16" />
    </svg>
  );
}

export function IconGithub(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 20c-4 1.2-4-2.1-5.5-2.6M15 21v-3.4a3 3 0 0 0-.8-2.3c2.6-.3 5.3-1.3 5.3-5.8a4.5 4.5 0 0 0-1.2-3.1 4.2 4.2 0 0 0-.1-3.2s-1.3-.4-4.2 1.6a10.3 10.3 0 0 0-5.4 0C5.7 3.4 4.4 3.8 4.4 3.8a4.2 4.2 0 0 0-.1 3.2A4.5 4.5 0 0 0 3.1 10c0 4.5 2.7 5.5 5.3 5.8A3 3 0 0 0 7.6 18V21" />
    </svg>
  );
}

export function IconGlobe(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 9.5h17M3.5 14.5h17" />
      <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
    </svg>
  );
}

/* ── Ikon tambahan untuk section beranda versi desain baru ───────────────── */

export function IconImage(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4.5" width="18" height="15" rx="3" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="M4 17l4.8-4.3a1.6 1.6 0 0 1 2.2.1L15 17" />
      <path d="M13.6 15.3l1.6-1.5a1.6 1.6 0 0 1 2.2.1L21 17.4" />
    </svg>
  );
}

export function IconTarget(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}

export function IconMail(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M4 8l7.1 4.9a1.6 1.6 0 0 0 1.8 0L20 8" />
    </svg>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6.5 3.5h2.2l1.4 3.4-1.7 1.3a11 11 0 0 0 5.4 5.4l1.3-1.7 3.4 1.4v2.2a2.5 2.5 0 0 1-2.7 2.5C10.6 17.4 6.6 13.4 4 8.2A2.5 2.5 0 0 1 6.5 3.5Z" />
    </svg>
  );
}

export function IconWhatsapp(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.5-4.6a8.4 8.4 0 1 1 15.5-4.3Z" />
      <path d="M9 9.2c0 3 2.3 5.3 5.3 5.3.6 0 1.2-.5 1.2-1.1 0-.3-.8-.9-1.1-1-.4-.1-.7.6-1 .5-.7-.3-1.7-1.3-2-2-.1-.3.6-.6.5-1-.1-.3-.7-1.1-1-1.1-.6 0-1.1.6-1.1 1.2Z" />
    </svg>
  );
}

export function IconFacebook(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14.8 8.5h2.2V5.6h-2.3c-2.2 0-3.6 1.4-3.6 3.7v1.6H9v2.9h2.1V21h3v-7.2h2.2l.4-2.9h-2.6V9.6c0-.7.3-1.1.7-1.1Z" />
    </svg>
  );
}

export function IconYoutube(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.5l5 2.5-5 2.5v-5Z" />
    </svg>
  );
}

export function IconSend(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20.5 3.5 3.8 10.2c-.8.3-.8 1.5.1 1.7l5.6 1.5 1.5 5.6c.2.9 1.4.9 1.7.1L20.5 3.5Z" />
      <path d="M20.5 3.5 9.5 13.4" />
    </svg>
  );
}

export function IconArrowUpRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}
