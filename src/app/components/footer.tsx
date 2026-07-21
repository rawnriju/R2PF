import { Github, Linkedin } from "lucide-react";

export function Footer() {
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer id="contact" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "#12161F" }}>
      <div className="mx-auto max-w-[1200px] px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="font-mono" style={{ fontSize: 12, color: "#8A8F9E", letterSpacing: "0.08em" }}>
          © 2026 RAWN ABRAHAM RIJU — ALL SYSTEMS OPERATIONAL
        </span>

        <div className="flex items-center gap-6">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="transition-colors duration-200 hover:text-[#FFE100]" style={{ color: "#8A8F9E" }} aria-label="GitHub">
            <Github size={20} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="transition-colors duration-200 hover:text-[#FFE100]" style={{ color: "#8A8F9E" }} aria-label="LinkedIn">
            <Linkedin size={20} />
          </a>

          <button
            onClick={toTop}
            className="group relative font-mono transition-all duration-200"
            style={{ fontSize: 12, letterSpacing: "0.1em" }}
          >
            <span
              className="block px-4 py-2.5 transition-all duration-200 group-hover:text-[#FF5500]"
              style={{
                color: "#FFE100",
                border: "1px solid rgba(0,240,255,0.5)",
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
