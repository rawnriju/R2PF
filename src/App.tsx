import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, OrbitControls, Stars } from '@react-three/drei';
import { blogPosts, experience, profile, projects, skills, stats } from './content';

function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.75]}>
      <color attach="background" args={['#07111f']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 6, 4]} intensity={2.1} color="#7be7ff" />
      <pointLight position={[-3, -2, -2]} intensity={1.3} color="#ff8a5b" />
      <Suspense fallback={null}>
        <Float speed={1.2} rotationIntensity={1.1} floatIntensity={1.2}>
          <mesh rotation={[0.5, 0.7, 0.2]}>
            <torusKnotGeometry args={[1, 0.28, 180, 24]} />
            <meshStandardMaterial color="#8ceeff" metalness={0.9} roughness={0.18} />
          </mesh>
        </Float>
        <Stars radius={40} depth={24} count={1200} factor={3} saturation={0} fade speed={1} />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
    </Canvas>
  );
}

function App() {
  return (
    <div className="page-shell">
      <div className="page-grid" />
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{profile.location}</p>
          <h1>
            A portfolio space for{' '}
            <span className="accent">products, storytelling, and experiments</span>.
          </h1>
          <p className="lede">{profile.summary}</p>
          <div className="cta-row">
            <a href="#projects" className="button button-primary">
              See work
            </a>
            <a href="#blog" className="button button-secondary">
              Read notes
            </a>
          </div>
          <div className="meta-row">
            <span>{profile.title}</span>
            <span>{profile.availability}</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="scene-frame">
            <HeroScene />
          </div>
          <div className="floating-card floating-card-top">React + Vite base</div>
          <div className="floating-card floating-card-bottom">3D-ready landing page</div>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel stats-panel">
          {stats.map((stat) => (
            <article key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </section>

        <section className="panel" id="about">
          <div className="section-heading">
            <p>About</p>
            <h2>Built to grow with future projects and writing.</h2>
          </div>
          <p>
            This base keeps content modular so you can update work experience, add new case studies,
            and publish blog posts without redesigning the whole site.
          </p>
          <div className="skill-cloud">
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </section>

        <section className="panel" id="experience">
          <div className="section-heading">
            <p>Experience</p>
            <h2>Professional work shaped around frontend craft.</h2>
          </div>
          <div className="timeline">
            {experience.map((item) => (
              <article key={`${item.company}-${item.role}`} className="timeline-item">
                <div className="timeline-marker" />
                <div>
                  <p className="timeline-meta">
                    {item.period} · {item.company}
                  </p>
                  <h3>{item.role}</h3>
                  <ul>
                    {item.highlights.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="projects">
          <div className="section-heading">
            <p>Projects</p>
            <h2>Selected work that can expand into full case studies later.</h2>
          </div>
          <div className="card-grid">
            {projects.map((project) => (
              <article key={project.name} className="project-card">
                <span>{project.tag}</span>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="blog">
          <div className="section-heading">
            <p>Blog</p>
            <h2>Ready for Markdown or MDX posts.</h2>
          </div>
          <div className="card-grid blog-grid">
            {blogPosts.map((post) => (
              <article key={post.title} className="blog-card">
                <span>{post.date}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;