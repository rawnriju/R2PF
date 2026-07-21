import { useEffect, useState } from "react";
import { Header } from "./components/header";
import { Hero } from "./components/hero";
import { StatsBar } from "./components/stats-bar";
import { FeaturedWork } from "./components/featured-work";
import { About } from "./components/about";
import { Footer } from "./components/footer";
import { BoostGauge } from "./components/boost-gauge";

export default function App() {
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
    <div className="min-h-screen w-full" style={{ background: "#090B10", color: "#E2E8F0" }}>
      <Header />
      <main>
        <Hero />
        <StatsBar />
        <FeaturedWork />
        <About />
      </main>
      <Footer />
      <BoostGauge value={boost} />
    </div>
  );
}
