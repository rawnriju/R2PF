import { Github, Linkedin, Mail } from "lucide-react";
import type { CSSProperties } from "react";
import "./contact.css";

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
        <p className="section-eyebrow font-mono mb-3">05 // CONTACT</p>
        <h2 className="section-title">GET IN TOUCH</h2>
        <p className="contact-intro mt-4 max-w-[520px]">
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
            className="contact-card chamfer group relative flex items-center gap-4 p-6 transition-all duration-300"
            // Feeds every accent-coloured rule in contact.css.
            style={{ "--chan-accent": accent } as CSSProperties}
          >
            {/* corner highlights on hover, matching the project cards */}
            <span className="contact-card__corner contact-card__corner--tr pointer-events-none absolute top-0 right-0 h-8 w-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="contact-card__corner contact-card__corner--bl pointer-events-none absolute bottom-0 left-0 h-8 w-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <span className="contact-card__icon shrink-0 grid place-items-center transition-colors duration-300">
              <Icon size={20} />
            </span>

            <span className="min-w-0">
              <span className="contact-card__tag font-mono block">{tag}</span>
              <span className="contact-card__value block truncate transition-colors duration-300 group-hover:text-[var(--brand)]">
                {label}
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
