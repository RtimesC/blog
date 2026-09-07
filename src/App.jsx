import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { HomePage } from '@/components/home-page';
import { Button } from '@/components/ui/button';
import { getArticleBySlug } from '@/content/articles';
import { ThemeSwitch } from '@/components/theme-switch';
import { useTheme } from '@/hooks/use-theme';

const homeDocumentTitle = 'Knowledge Space';

function ArticleToolbar({ theme, onChange, plain = false }) {
  return (
    <div className="taotao-article-toolbar">
      {plain ? <a className="taotao-article-back" href="/">← Home</a> : <Button asChild size="sm">
        <a className="taotao-article-back" href="/">Home</a>
      </Button>}
      <ThemeSwitch value={theme} onChange={onChange} />
    </div>
  );
}

function MissingArticlePage({ theme, onThemeChange, headingRef }) {
  return (
    <main className="taotao-article-page">
      <ArticleToolbar theme={theme} onChange={onThemeChange} />
      <article className="taotao-article-sheet">
        <header className="taotao-article-header">
          <h1 ref={headingRef} tabIndex={-1}>Article not found</h1>
          <p className="taotao-article-lede">This article may be unpublished, moved, or linked incorrectly. Return home to keep browsing.</p>
        </header>
      </article>
    </main>
  );
}

function AboutPage({ theme, onThemeChange, headingRef }) {
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
        <h1 ref={headingRef} tabIndex={-1}>τaotao</h1>
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

function ArticlePage({ article, theme, onThemeChange, headingRef }) {
  return (
    <main className="taotao-article-page paper-article">
      <ArticleToolbar theme={theme} onChange={onThemeChange} plain />
      <article className="taotao-article-sheet taotao-article-sheet--full">
        <header className="taotao-article-header">
          <h1 ref={headingRef} tabIndex={-1}>{article.title}</h1>
          {article.authors.length > 0 && <p className="paper-authors"><span className="paper-field-label">Authors</span>{article.authors.join(' · ')}</p>}
        </header>

        <section className="paper-abstract" aria-labelledby="abstract-heading">
          <h2 id="abstract-heading">Abstract</h2>
          <p>{article.abstract}</p>
          <p className="paper-keywords"><strong>Keywords</strong><span>{article.keywords.join(' · ')}</span></p>
        </section>

        <div className="taotao-article-body">
          <ArticleVideo video={article.video} />
          <div className="taotao-markdown">
            <ReactMarkdown>{article.body}</ReactMarkdown>
          </div>
        </div>
        {article.references.length > 0 && <section className="paper-references" aria-labelledby="references-heading">
          <h2 id="references-heading">References</h2>
          <ol>
            {article.references.map((reference, index) => (
              <li id={`ref-${index + 1}`} key={index} tabIndex={-1}>
                <span className="paper-reference-number">[{index + 1}]</span>
                <span>{reference.url ? <a href={reference.url}>{reference.text}</a> : reference.text}</span>
              </li>
            ))}
          </ol>
        </section>}
      </article>
    </main>
  );
}

export default function App() {
  const { theme, setTheme } = useTheme();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const pageHeadingRef = useRef(null);
  const shouldFocusAfterNavigationRef = useRef(false);
  const currentArticle = currentPath.startsWith('/articles/')
    ? getArticleBySlug(currentPath.replace(/^\/articles\//, '').replace(/\/+$/, ''))
    : null;
  const isMissingArticle = currentPath.startsWith('/articles/') && !currentArticle;
  const documentTitle = currentPath === '/about'
    ? 'About — τaotao'
    : currentArticle
      ? `${currentArticle.title} — τaotao`
      : isMissingArticle
        ? 'Article not found — τaotao'
        : homeDocumentTitle;

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
      shouldFocusAfterNavigationRef.current = true;
      window.history.pushState({}, '', `${destination.pathname}${destination.search}${destination.hash}`);
      setCurrentPath(destination.pathname);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    function handleHistoryChange() {
      shouldFocusAfterNavigationRef.current = true;
      setCurrentPath(window.location.pathname);
    }

    document.addEventListener('click', handleInternalNavigation);
    window.addEventListener('popstate', handleHistoryChange);

    return () => {
      document.removeEventListener('click', handleInternalNavigation);
      window.removeEventListener('popstate', handleHistoryChange);
    };
  }, []);

  useEffect(() => {
    document.title = documentTitle;

    if (!shouldFocusAfterNavigationRef.current) {
      return;
    }

    shouldFocusAfterNavigationRef.current = false;
    pageHeadingRef.current?.focus({ preventScroll: true });
  }, [currentPath, documentTitle]);

  let page;

  if (currentPath === '/about') {
    page = <AboutPage theme={theme} onThemeChange={setTheme} headingRef={pageHeadingRef} />;
  } else if (currentPath.startsWith('/articles/')) {
    page = currentArticle
      ? <ArticlePage article={currentArticle} theme={theme} onThemeChange={setTheme} headingRef={pageHeadingRef} />
      : <MissingArticlePage theme={theme} onThemeChange={setTheme} headingRef={pageHeadingRef} />;
  } else {
    page = <HomePage theme={theme} onThemeChange={setTheme} headingRef={pageHeadingRef} />;
  }

  return page;
}
