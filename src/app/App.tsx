import { Routes, Route } from "react-router";
import { Header } from "./components/header";
import { Hero } from "./components/hero";
import { StatsBar } from "./components/stats-bar";
import { About } from "./components/about";
import { Work } from "./components/work";
import { Journey } from "./components/journey";
import { Extras } from "./components/extras";
import { Contact } from "./components/contact";
import { Footer } from "./components/footer";
import { ScrollDial } from "./components/scroll-dial";
import { ResumePage } from "./components/resume";
import { BlogPage } from "./components/blog";

function HomePage() {
  // No scroll listener here: ScrollDial drives itself off anime.js
  // ScrollObservers, which write to the DOM without re-rendering React.
  return (
    <div className="page-shell min-h-screen w-full">
      <Header />
      <main>
        <Hero />
        <StatsBar />
        <About />
        <Work />
        <Journey />
        <Extras />
        <Contact />
      </main>
      <Footer />
      <ScrollDial />
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
