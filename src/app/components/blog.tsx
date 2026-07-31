import { Link } from "react-router";
import { ThemeToggle } from "./theme-toggle";
import "./blog.css";

export function BlogPage() {
  return (
    <div className="page-shell min-h-screen w-full">
      <header className="blog-header sticky top-0 z-40 backdrop-blur-md">
        <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="blog-header__back font-mono transition-colors duration-200 hover:text-[var(--brand)]"
          >
            ← BACK TO HOME
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="blog-header__wordmark font-mono tracking-wide">
              RAWN.DEV
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-24">
        <p className="section-eyebrow font-mono mb-3">04 // BLOG</p>
        <h1 className="section-title">WRITING — UNDER CONSTRUCTION</h1>
        <p className="blog-intro mt-6 max-w-[520px]">
          Posts on frontend engineering, data visualization, and whatever else I'm
          learning will show up here. Nothing published yet — check back soon.
        </p>

        <div className="hairline-list mt-16 flex flex-col gap-px">
          {[1, 2, 3].map((i) => (
            <div key={i} className="hairline-row flex items-baseline gap-5 p-5">
              <span className="soon-row__tag font-mono shrink-0">SOON</span>
              <span className="soon-row__bar animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
