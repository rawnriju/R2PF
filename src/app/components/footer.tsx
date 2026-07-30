import { Github, Linkedin } from "lucide-react";

// The #contact anchor belongs to the Contact section (contact.tsx), not here.
export function Footer() {
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer style={{ borderTop: "1px solid var(--hairline)", background: "var(--surface)" }}>
      <div className="mx-auto max-w-[1200px] px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="font-mono" style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.08em" }}>
          © 2026 RAWN ABRAHAM RIJU — ALL SYSTEMS OPERATIONAL
        </span>

        <div className="flex items-center gap-6 md:pr-32">
          <a href="https://github.com/rawnriju" target="_blank" rel="noreferrer" className="transition-colors duration-200 hover:text-[var(--brand)]" style={{ color: "var(--text-muted)" }} aria-label="GitHub">
            <Github size={20} />
          </a>
          <a href="https://www.linkedin.com/in/rawn-riju-b5b199183/" target="_blank" rel="noreferrer" className="transition-colors duration-200 hover:text-[var(--brand)]" style={{ color: "var(--text-muted)" }} aria-label="LinkedIn">
            <Linkedin size={20} />
          </a>

          <button
            onClick={toTop}
            className="group relative font-mono cursor-pointer transition-all duration-200"
            style={{ fontSize: 12, letterSpacing: "0.1em" }}
          >
            <span
              className="block px-4 py-2.5 transition-all duration-200 group-hover:text-[var(--brand-2)]"
              style={{
                color: "var(--brand)",
                border: "1px solid rgba(var(--brand-rgb), 0.5)",
                clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
              }}
            >
              ↑ BACK TO TOP
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
