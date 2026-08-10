import { Link, useParams } from "react-router";
import Markdown from "markdown-to-jsx";
import { ThemeToggle } from "./theme-toggle";
import { getAllPosts } from "../lib/blog";
import "./blog.css";

function BlogHeader() {
  return (
    <header className="blog-header sticky top-0 z-40 backdrop-blur-md">
      <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
        <span className="blog-header__wordmark font-mono tracking-wide">
          RAWN.DEV
        </span>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            to="/"
            className="blog-header__back font-mono transition-colors duration-200 hover:text-[var(--brand)]"
          >
            ← BACK TO HOME
          </Link>
        </div>
      </div>
    </header>
  );
}

export function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="page-shell min-h-screen w-full">
      <BlogHeader />

      <main className="mx-auto max-w-[1200px] px-6 py-24">
        <p className="section-eyebrow font-mono mb-3">04 // BLOG</p>
        <h1 className="section-title">WRITING</h1>
        <p className="blog-intro mt-6 max-w-[520px]">
          Posts on frontend engineering, data visualization, and whatever else I'm
          learning.
        </p>

        {posts.length > 0 ? (
          <div className="hairline-list mt-16 flex flex-col gap-px">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="hairline-row blog-row flex items-center gap-4 p-5"
                style={{ "--card-accent": "var(--brand)" } as React.CSSProperties}
              >
                <span className="blog-row__index font-mono shrink-0">
                  POST_{String(i + 1).padStart(2, "0")}
                </span>
                <div className="blog-row__main min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h4 className="blog-row__title">{post.title}</h4>
                    {post.date && (
                      <span className="blog-row__date font-mono">{post.date}</span>
                    )}
                  </div>
                  {post.excerpt && (
                    <p className="blog-row__excerpt mt-1">{post.excerpt}</p>
                  )}
                  {post.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {post.tags.map((t) => (
                        <span key={t} className="blog-row__tag font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="blog-row__view font-mono shrink-0">VIEW ↗</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="hairline-list mt-16 flex flex-col gap-px">
            {[1, 2, 3].map((i) => (
              <div key={i} className="hairline-row flex items-baseline gap-5 p-5">
                <span className="soon-row__tag font-mono shrink-0">SOON</span>
                <span className="soon-row__bar animate-pulse" />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const posts = getAllPosts();
  const postIndex = slug ? posts.findIndex((p) => p.slug === slug) : -1;
  const post = postIndex !== -1 ? posts[postIndex] : undefined;

  return (
    <div className="page-shell min-h-screen w-full">
      <BlogHeader />

      <main className="mx-auto max-w-[720px] px-6 py-24">
        {post ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="section-eyebrow font-mono">
                POST_{String(postIndex + 1).padStart(2, "0")} // ARTICLE
              </p>
              <Link
                to="/blog"
                className="blog-post__close font-mono"
                aria-label="Back to blog list"
              >
                ✕
              </Link>
            </div>
            <h1 className="blog-post__title">{post.title}</h1>
            <div className="blog-post__meta mt-3 flex items-center gap-3 flex-wrap">
              {post.date && (
                <span className="font-mono blog-row__date">{post.date}</span>
              )}
              {post.tags.map((t) => (
                <span key={t} className="blog-row__tag font-mono">
                  {t}
                </span>
              ))}
            </div>
            <div className="blog-post__body mt-10">
              <Markdown>{post.content}</Markdown>
            </div>
            <Link
              to="/blog"
              className="blog-header__back font-mono mt-12 inline-block transition-colors duration-200 hover:text-[var(--brand)]"
            >
              ← BACK
            </Link>
          </>
        ) : (
          <>
            <p className="section-eyebrow font-mono mb-3">04 // BLOG</p>
            <h1 className="section-title">POST NOT FOUND</h1>
            <p className="blog-intro mt-6 max-w-[520px]">
              Couldn't find a post at that address.
            </p>
            <Link
              to="/blog"
              className="blog-header__back font-mono mt-8 inline-block transition-colors duration-200 hover:text-[var(--brand)]"
            >
              ← BACK
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
