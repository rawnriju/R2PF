import { Link } from "react-router";

export function BlogPage() {
  return (
    <div className="min-h-screen w-full" style={{ background: "#090B10", color: "#E2E8F0" }}>
      <header
        className="sticky top-0 z-40 backdrop-blur-md"
        style={{ background: "rgba(9,11,16,0.72)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="font-mono transition-colors duration-200 hover:text-[#FFE100]"
            style={{ fontSize: 12, letterSpacing: "0.12em", color: "#8A8F9E" }}
          >
            ← BACK TO HOME
          </Link>
          <span className="font-mono tracking-wide" style={{ color: "#E2E8F0", fontWeight: 700, fontSize: 15 }}>
            RAWN.DEV
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-24">
        <p className="font-mono mb-3" style={{ fontSize: 12, letterSpacing: "0.25em", color: "#FFE100" }}>
          04 // BLOG
        </p>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(28px, 4vw, 44px)",
            color: "#E2E8F0",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          WRITING — UNDER CONSTRUCTION
        </h1>
        <p
          className="mt-6 max-w-[520px]"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.65, color: "#8A8F9E" }}
        >
          Posts on frontend engineering, data visualization, and whatever else I'm
          learning will show up here. Nothing published yet — check back soon.
        </p>

        <div
          className="mt-16 flex flex-col gap-px"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-baseline gap-5 p-5" style={{ background: "#12161F" }}>
              <span
                className="font-mono shrink-0"
                style={{ fontSize: 11, letterSpacing: "0.12em", color: "#FFE100", width: 72 }}
              >
                SOON
              </span>
              <span
                className="animate-pulse"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  color: "#8A8F9E",
                  width: "100%",
                  maxWidth: 360,
                  height: 14,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 2,
                }}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
