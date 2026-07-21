const NAV = [
  { id: "01", label: "WORK", href: "#work" },
  { id: "02", label: "ABOUT", href: "#about" },
  { id: "03", label: "CONTACT", href: "#contact" },
];

export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md" style={{ background: "rgba(9,11,16,0.72)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="font-mono tracking-wide" style={{ color: "#E2E8F0", fontWeight: 700, fontSize: 15 }}>
            RAWN.DEV
          </span>
          <span className="flex items-center gap-1.5 font-mono" style={{ fontSize: 10, color: "#8A8F9E", letterSpacing: "0.1em" }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: "#22c55e" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
            </span>
            [ ONLINE ]
          </span>
        </div>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="font-mono transition-colors duration-200 hover:text-[#FFE100]"
              style={{ fontSize: 12, letterSpacing: "0.12em", color: "#8A8F9E" }}
            >
              <span style={{ color: "#FFE100" }}>{item.id}</span> // {item.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="#contact"
          className="group relative font-mono transition-all duration-200"
          style={{ fontSize: 12, letterSpacing: "0.1em" }}
        >
          <span
            className="block px-5 py-2.5 transition-all duration-200"
            style={{
              color: "#FFE100",
              border: "1px solid #FFE100",
              clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
              boxShadow: "0 0 12px rgba(255,225,0,0.25)",
            }}
          >
            GET IN TOUCH
          </span>
        </a>
      </div>
    </header>
  );
}
