import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { articles, getArticleBySlug } from '@/content/articles';
import { ThemeSwitch } from '@/components/theme-switch';

const pageTitle = "Welcome τaotao's blog";

function ArticleToolbar({ checked, onChange }) {
  return (
    <div className="taotao-article-toolbar">
      <Button asChild size="sm">
        <a className="taotao-article-back" href="/">Home</a>
      </Button>
      <ThemeSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

function BlankArticlePage({ checked, onThemeChange }) {
  return (
    <main className="taotao-article-page">
      <ArticleToolbar checked={checked} onChange={onThemeChange} />
      <article className="taotao-article-sheet" aria-label="Blank page" />
    </main>
  );
}

function AboutPage({ checked, onThemeChange }) {
  return (
    <main className="taotao-article-page taotao-about-page">
      <div className="taotao-article-toolbar">
        <Button asChild size="sm">
          <a className="taotao-article-back" href="/">Home</a>
        </Button>
        <ThemeSwitch checked={checked} onChange={onThemeChange} />
      </div>
      <article className="taotao-about-sheet">
        <p className="taotao-article-kicker">About me</p>
        <h1>τaotao</h1>
        <p className="taotao-about-lede">I study Mechatronics and Robotics through building, testing, and questioning.</p>
        <div className="taotao-about-grid">
          <section>
            <p className="taotao-about-label">Background</p>
            <p>Mechatronics and Robotics</p>
          </section>
          <section>
            <p className="taotao-about-label">Currently exploring</p>
            <p>SLAM · Deep Learning · STM32</p>
          </section>
          <section>
            <p className="taotao-about-label">Elsewhere</p>
            <p><a href="https://github.com/" rel="noreferrer">GitHub ↗</a></p>
          </section>
        </div>
      </article>
    </main>
  );
}

function ArticleVideo({ video }) {
  if (!video) {
    return null;
  }

  return (
    <figure className="taotao-article-video">
      <video controls playsInline preload="metadata" poster={video.poster}>
        <source src={video.src} type="video/mp4" />
        Your browser does not support embedded video.
      </video>
      <figcaption>
        <span>{video.label}</span>
        {video.caption}
      </figcaption>
    </figure>
  );
}

function ArticlePage({ article, checked, onThemeChange }) {
  return (
    <main className="taotao-article-page">
      <ArticleToolbar checked={checked} onChange={onThemeChange} />
      <article className="taotao-article-sheet taotao-article-sheet--full">
        <header className="taotao-article-header">
          <p className="taotao-article-kicker">{article.kicker}</p>
          <h1>{article.title}</h1>
          <p className="taotao-article-lede">{article.lede}</p>
          <div className="taotao-article-status" aria-label="Project status">
            {article.status.map((item) => <span key={item}>{item}</span>)}
          </div>
          <p className="taotao-article-note">{article.note}</p>
        </header>

        <ArticleVideo video={article.video} />

        <div className="taotao-article-body">
          <div className="taotao-markdown">
            <ReactMarkdown>{article.body}</ReactMarkdown>
          </div>
        </div>
      </article>
    </main>
  );
}

function FlipCard({ entry }) {
  const [touchFlipped, setTouchFlipped] = useState(false);
  const lastPointerType = useRef(null);

  function handlePointerDown(event) {
    lastPointerType.current = event.pointerType;
  }

  function handlePointerCancel() {
    lastPointerType.current = null;
  }

  function handleClick(event) {
    // Touch has no hover state: reserve the first tap for revealing the abstract.
    // Keyboard and mouse activation retain normal link behaviour.
    if (lastPointerType.current === 'touch' && !touchFlipped) {
      event.preventDefault();
      setTouchFlipped(true);
    }

    lastPointerType.current = null;
  }

  return (
    <article className={`taotao-flip-card${touchFlipped ? ' is-touch-flipped' : ''}`}>
      <a
        className="content"
        href={`/articles/${entry.slug}`}
        aria-label={entry.title ? `Open ${entry.title}` : 'Open card'}
        onPointerDown={handlePointerDown}
        onPointerCancel={handlePointerCancel}
        onClick={handleClick}
      >
        <span className="front" aria-hidden="true">
          <span className="front-cover" aria-hidden="true">
            <img className="front-cover-image" src={entry.cover} alt="" />
          </span>
          <span className="front-overlay" aria-hidden="true" />
          <span className="front-content">
            <span className="front-keywords">{entry.keywords.join(' / ')}</span>
            <span className="front-title">{entry.title}</span>
          </span>
        </span>
        <span className="back" aria-hidden="true">
          <span className="back-content">
            <span className="abstract-label">Abstract</span>
            <span className="abstract-body">{entry.abstract}</span>
          </span>
        </span>
      </a>
    </article>
  );
}

function HeroReel() {
  const reelEntries = articles.length > 1 ? [...articles, ...articles] : articles;

  return (
    <section className={`taotao-hero${articles.length > 1 ? ' taotao-hero--multiple' : ''}`} aria-label="Featured articles">
      <div className="taotao-hero__track">
        {reelEntries.map((entry, index) => (
          <a className="taotao-hero__slide" href={`/articles/${entry.slug}`} key={`${entry.slug}-${index}`}>
            <img src={entry.cover} alt="" />
            <span className="taotao-hero__shade" aria-hidden="true" />
            <span className="taotao-hero__content">
              <strong>{entry.title}</strong>
              <small>{entry.keywords.join(' · ')}</small>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(() => window.localStorage.getItem('theme') === 'dark');
  const [activeState, setActiveState] = useState('building');
  const visibleArticles = articles.filter((entry) => entry.state === activeState);

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#212121' : '#e8e8e8');
    window.localStorage.setItem('theme', theme);
  }, [isDark]);

  let page;

  if (window.location.pathname === '/about') {
    page = <AboutPage checked={isDark} onThemeChange={setIsDark} />;
  } else if (window.location.pathname.startsWith('/articles/')) {
    const slug = window.location.pathname.replace(/^\/articles\//, '').replace(/\/+$/, '');
    const article = getArticleBySlug(slug);

    page = article
      ? <ArticlePage article={article} checked={isDark} onThemeChange={setIsDark} />
      : <BlankArticlePage checked={isDark} onThemeChange={setIsDark} />;
  } else {
    page = (
      <main className="taotao-page">
        <div className="taotao-shell">
          <div className="taotao-home-header">
            <div className="taotao-home-identity">
              <h1 aria-label={pageTitle}>
                <svg aria-hidden="true" className="taotao-title" focusable="false" viewBox="0 0 900 100">
                  <text className="taotao-title__text" x="5" xmlSpace="preserve" y="77">
                    {Array.from(pageTitle).map((character, index) => (
                      <tspan
                        className={`taotao-title__character${character === 'τ' ? ' taotao-title__tau' : ''}`}
                        key={`${character}-${index}`}
                        style={{ '--character-delay': `${index * 75}ms` }}
                      >
                        {character}
                      </tspan>
                    ))}
                  </text>
                </svg>
              </h1>
            </div>
            <ThemeSwitch checked={isDark} onChange={setIsDark} />
          </div>

          <HeroReel />

          <section className="taotao-working-state" aria-label="Working state">
            <nav className="taotao-state-nav" aria-label="Working states">
              <button className={activeState === 'observing' ? 'is-active' : ''} onClick={() => setActiveState('observing')} type="button">Observing</button>
              <button className={activeState === 'building' ? 'is-active' : ''} onClick={() => setActiveState('building')} type="button">Building</button>
              <button className={activeState === 'questioning' ? 'is-active' : ''} onClick={() => setActiveState('questioning')} type="button">Questioning</button>
            </nav>
          </section>

          <section className="taotao-field-record" aria-label="Notes">
            <div className="taotao-reading-list">
              {visibleArticles.length > 0 ? visibleArticles.map((entry) => (
                <a className="taotao-reading-entry" href={`/articles/${entry.slug}`} key={entry.slug}>
                  <span className="taotao-reading-entry__poster">
                    <img src={entry.cover} alt="" />
                  </span>
                  <span className="taotao-reading-entry__body">
                    <span className="taotao-reading-entry__title">{entry.title}</span>
                    <span className="taotao-reading-entry__abstract">{entry.abstract}</span>
                    <span className="taotao-reading-entry__keywords">{entry.keywords.join(' · ')}</span>
                  </span>
                  <span className="taotao-reading-entry__arrow" aria-hidden="true">↗</span>
                </a>
              )) : <div className="taotao-reading-entry taotao-reading-entry--empty" aria-hidden="true">
                <span className="taotao-reading-entry__poster" />
                <span className="taotao-reading-entry__body" />
              </div>}
            </div>
          </section>
        </div>
      </main>
    );
  }

  return page;
}
