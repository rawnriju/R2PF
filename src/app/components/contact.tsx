import { Github, Linkedin, Mail } from "lucide-react";
import { CHAMFER } from "./project-card";

const CHANNELS = [
  {
    id: "email",
    tag: "EMAIL",
    label: "rawnriju@gmail.com",
    href: "mailto:rawnriju@gmail.com",
    Icon: Mail,
    accent: "var(--brand)",
    external: false,
  },
  {
    id: "github",
    tag: "GITHUB",
    label: "github.com/rawnriju",
    href: "https://github.com/rawnriju",
    Icon: Github,
    accent: "var(--brand-2)",
    external: true,
  },
  {
    id: "linkedin",
    tag: "LINKEDIN",
    label: "in/rawn-riju",
    href: "https://www.linkedin.com/in/rawn-riju-b5b199183/",
    Icon: Linkedin,
    accent: "var(--brand)",
    external: true,
  },
];

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-[1200px] px-6 py-24">
      <div className="mb-12">
        <p className="font-mono mb-3" style={{ fontSize: 12, letterSpacing: "0.25em", color: "var(--brand)" }}>
          04 // CONTACT
        </p>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 44px)", color: "var(--fg)", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
          GET IN TOUCH
        </h2>
        <p className="mt-4 max-w-[520px]" style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.65, color: "var(--text-muted)" }}>
          Open to fullstack roles, interesting problems, and good conversation. The
          fastest way through is email but the rest are always open too.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {CHANNELS.map(({ id, tag, label, href, Icon, accent, external }) => (
          <a
            key={id}
            href={href}
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
            className="group relative flex items-center gap-4 p-6 transition-all duration-300"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--hairline)",
              clipPath: CHAMFER,
            }}
          >
            {/* corner highlights on hover, matching the project cards */}
            <span
              className="pointer-events-none absolute top-0 right-0 h-8 w-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                borderTop: `2px solid ${accent}`,
                borderRight: `2px solid ${accent}`,
                filter: `drop-shadow(0 0 6px ${accent})`,
              }}
            />
            <span
              className="pointer-events-none absolute bottom-0 left-0 h-8 w-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                borderBottom: `2px solid ${accent}`,
                borderLeft: `2px solid ${accent}`,
                filter: `drop-shadow(0 0 6px ${accent})`,
              }}
            />

            <span
              className="shrink-0 grid place-items-center transition-colors duration-300"
              style={{
                width: 44,
                height: 44,
                color: accent,
                border: `1px solid var(--hairline)`,
                background: "var(--chip-bg)",
              }}
            >
              <Icon size={20} />
            </span>

            <span className="min-w-0">
              <span
                className="font-mono block"
                style={{ fontSize: 10, letterSpacing: "0.15em", color: "var(--text-muted)" }}
              >
                {tag}
              </span>
              <span
                className="block truncate transition-colors duration-300 group-hover:text-[var(--brand)]"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "var(--fg)" }}
              >
                {label}
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
