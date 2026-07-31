import { Github, Linkedin } from "lucide-react";
import "./footer.css";

// The #contact anchor belongs to the Contact section (contact.tsx), not here.
export function Footer() {
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="site-footer">
      <div className="mx-auto max-w-[1200px] px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="site-footer__copy font-mono">
          © 2026 RAWN ABRAHAM RIJU — ALL SYSTEMS OPERATIONAL
        </span>

        <div className="flex items-center gap-6 md:pr-32">
          <a href="https://github.com/rawnriju" target="_blank" rel="noreferrer" className="site-footer__social transition-colors duration-200 hover:text-[var(--brand)]" aria-label="GitHub">
            <Github size={20} />
          </a>
          <a href="https://www.linkedin.com/in/rawn-riju-b5b199183/" target="_blank" rel="noreferrer" className="site-footer__social transition-colors duration-200 hover:text-[var(--brand)]" aria-label="LinkedIn">
            <Linkedin size={20} />
          </a>

          <button
            onClick={toTop}
            className="site-footer__top group relative font-mono cursor-pointer transition-all duration-200"
          >
            <span className="site-footer__top-face block px-4 py-2.5 transition-all duration-200 group-hover:text-[var(--brand-2)]">
              ↑ BACK TO TOP
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
