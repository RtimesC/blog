import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { AboutButton } from '@/components/about-button';
import { Button } from '@/components/ui/button';
import { articles, getArticleBySlug } from '@/content/articles';
import { ThemeSwitch } from '@/components/theme-switch';
import { useTheme } from '@/hooks/use-theme';

const pageTitle = "Welcome τaotao's blog";

function ArticleToolbar({ theme, onChange, plain = false }) {
  return (
    <div className="taotao-article-toolbar">
      {plain ? <a className="taotao-article-back" href="/">← 首页</a> : <Button asChild size="sm">
        <a className="taotao-article-back" href="/">Home</a>
      </Button>}
      <ThemeSwitch value={theme} onChange={onChange} />
    </div>
  );
}

function BlankArticlePage({ theme, onThemeChange }) {
  return (
    <main className="taotao-article-page">
      <ArticleToolbar theme={theme} onChange={onThemeChange} />
      <article className="taotao-article-sheet" aria-label="Blank page" />
    </main>
  );
}

function AboutPage({ theme, onThemeChange }) {
  return (
    <main className="taotao-article-page taotao-about-page">
      <div className="taotao-article-toolbar">
        <Button asChild size="sm">
          <a className="taotao-article-back" href="/">Home</a>
        </Button>
        <ThemeSwitch value={theme} onChange={onThemeChange} />
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
    </figure>
  );
}

function ArticlePage({ article, theme, onThemeChange }) {
  return (
    <main className="taotao-article-page paper-article">
      <ArticleToolbar theme={theme} onChange={onThemeChange} plain />
      <article className="taotao-article-sheet taotao-article-sheet--full">
        <header className="taotao-article-header">
          <h1>{article.title}</h1>
          <p className="paper-authors"><span className="paper-field-label">作者</span>{article.authors.join(' · ')}</p>
        </header>

        <section className="paper-abstract" aria-labelledby="abstract-heading">
          <h2 id="abstract-heading">摘要 <span lang="en">Abstract</span></h2>
          <p>{article.abstract}</p>
          <p className="paper-keywords"><strong>关键词</strong><span>{article.keywords.join('；')}</span></p>
        </section>

        <div className="taotao-article-body">
          <ArticleVideo video={article.video} />
          <div className="taotao-markdown">
            <ReactMarkdown>{article.body}</ReactMarkdown>
          </div>
        </div>
        <section className="paper-references" aria-labelledby="references-heading">
          <h2 id="references-heading">参考文献 <span lang="en">References</span></h2>
          {article.references.length ? <ol>
            {article.references.map((reference, index) => (
              <li id={`ref-${index + 1}`} key={index} tabIndex={-1}>
                <span className="paper-reference-number">[{index + 1}]</span>
                <span>{reference.url ? <a href={reference.url}>{reference.text}</a> : reference.text}</span>
              </li>
            ))}
          </ol> : <p className="paper-empty-references">本文尚未列出参考文献。</p>}
        </section>
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
  const { theme, setTheme } = useTheme();
  const [activeState, setActiveState] = useState('building');
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const visibleArticles = articles.filter((entry) => entry.state === activeState);

  useEffect(() => {
    function handleInternalNavigation(event) {
      const link = event.target.closest('a[href]');

      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) {
        return;
      }

      const destination = new URL(link.href, window.location.href);

      if (destination.origin !== window.location.origin || (destination.pathname === window.location.pathname && destination.hash)) {
        return;
      }

      event.preventDefault();
      window.history.pushState({}, '', `${destination.pathname}${destination.search}${destination.hash}`);
      setCurrentPath(destination.pathname);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    function handleHistoryChange() {
      setCurrentPath(window.location.pathname);
    }

    document.addEventListener('click', handleInternalNavigation);
    window.addEventListener('popstate', handleHistoryChange);

    return () => {
      document.removeEventListener('click', handleInternalNavigation);
      window.removeEventListener('popstate', handleHistoryChange);
    };
  }, []);

  let page;

  if (currentPath === '/about') {
    page = <AboutPage theme={theme} onThemeChange={setTheme} />;
  } else if (currentPath.startsWith('/articles/')) {
    const slug = currentPath.replace(/^\/articles\//, '').replace(/\/+$/, '');
    const article = getArticleBySlug(slug);

    page = article
      ? <ArticlePage article={article} theme={theme} onThemeChange={setTheme} />
      : <BlankArticlePage theme={theme} onThemeChange={setTheme} />;
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
            <div className="taotao-home-actions">
              <AboutButton />
              <ThemeSwitch value={theme} onChange={setTheme} />
            </div>
          </div>

          <HeroReel />

          <section className="taotao-working-state" aria-label="Working state">
            <nav className="taotao-state-nav" aria-label="Working states">
              <button className={activeState === 'observing' ? 'is-active' : ''} onClick={() => setActiveState('observing')} type="button">Observing</button>
              <button className={activeState === 'building' ? 'is-active' : ''} onClick={() => setActiveState('building')} type="button">Building</button>
              <button className={activeState === 'questioning' ? 'is-active' : ''} onClick={() => setActiveState('questioning')} type="button">Questioning</button>
            </nav>
          </section>

          <section className="paper-index" aria-label="文章列表">
            <div className="paper-index__list">
              {visibleArticles.length > 0 ? visibleArticles.map((entry) => (
                <article className="paper-index__entry" key={entry.slug} aria-labelledby={`title-${entry.slug}`}>
                  <a className="paper-index__card" href={`/articles/${entry.slug}`}>
                    <div className="paper-index__poster"><img src={entry.cover} alt="" loading="lazy" /></div>
                    <div className="paper-index__content">
                      <h2 id={`title-${entry.slug}`}>{entry.title}</h2>
                      <p className="paper-index__keywords">{entry.keywords.join(' · ')}</p>
                    </div>
                  </a>
                </article>
              )) : <p className="paper-index__empty" role="status">这个分类下暂时没有文章。</p>}
            </div>
          </section>
        </div>
      </main>
    );
  }

  return page;
}
