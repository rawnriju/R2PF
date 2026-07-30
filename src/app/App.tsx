import { useEffect, useState } from "react";
import { Routes, Route } from "react-router";
import { Header } from "./components/header";
import { Hero } from "./components/hero";
import { StatsBar } from "./components/stats-bar";
import { About } from "./components/about";
import { Work } from "./components/work";
import { Extras } from "./components/extras";
import { Contact } from "./components/contact";
import { Footer } from "./components/footer";
import { BoostGauge } from "./components/boost-gauge";
import { ResumePage } from "./components/resume";
import { BlogPage } from "./components/blog";

function HomePage() {
  const [boost, setBoost] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      setBoost(pct);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="min-h-screen w-full" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <Header />
      <main>
        <Hero />
        <StatsBar />
        <About />
        <Work />
        <Extras />
        <Contact />
      </main>
      <Footer />
      <BoostGauge value={boost} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/resume" element={<ResumePage />} />
      <Route path="/blog" element={<BlogPage />} />
    </Routes>
  );
}
