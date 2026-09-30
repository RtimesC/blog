import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import aboutMarkdown from '@/content/about-me.md?raw';
import { HomePage } from '@/components/home-page';
import { getArticleBySlug } from '@/content/articles';
import { ThemeSwitch } from '@/components/theme-switch';
import { useTheme } from '@/hooks/use-theme';

const homeDocumentTitle = 'taotao — learning in public';

function ArticleToolbar({ theme, onChange }) {
  return (
    <div className="taotao-article-toolbar">
      <a className="taotao-article-back" href="/"><span aria-hidden="true" className="toolbar-mark"><i /><i /><i /></span><span>taotao</span><span className="toolbar-back-label">/ Home</span></a>
      <ThemeSwitch value={theme} onChange={onChange} />
    </div>
  );
}

function MissingArticlePage({ theme, onThemeChange, headingRef }) {
  return (
    <main className="taotao-article-page paper-article">
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
    <main className="taotao-article-page paper-article taotao-about-page">
      <ArticleToolbar theme={theme} onChange={onThemeChange} />
      <article className="taotao-about-content taotao-markdown" ref={headingRef} tabIndex={-1}>
        <ReactMarkdown>{aboutMarkdown}</ReactMarkdown>
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
      <ArticleToolbar theme={theme} onChange={onThemeChange} />
      <article className="taotao-article-sheet taotao-article-sheet--full">
        <header className="taotao-article-header">
          <h1 ref={headingRef} tabIndex={-1}>{article.title}</h1>
          {article.authors.length > 0 && <p className="paper-authors"><span className="paper-field-label">Authors</span>{article.authors.join(' · ')}</p>}
        </header>

        <div className="paper-metadata">
          {article.abstract && <section className="paper-abstract" aria-labelledby="abstract-heading">
          <h2 id="abstract-heading">Abstract</h2>
          <p>{article.abstract}</p>
          </section>}
          <p className="paper-keywords"><strong>Keywords</strong><span>{article.keywords.join(' · ')}</span></p>
        </div>

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
  const [discovery, setDiscovery] = useState({ panel: null, query: '', topic: '' });
  const scrollPositions = useRef(new Map());
  const pageHeadingRef = useRef(null);
  const shouldFocusAfterNavigationRef = useRef(false);
  const currentArticle = currentPath.startsWith('/articles/')
    ? getArticleBySlug(currentPath.replace(/^\/articles\//, '').replace(/\/+$/, ''))
    : null;
  const isMissingArticle = currentPath.startsWith('/articles/') && !currentArticle;
  const documentTitle = currentPath === '/about'
    ? `About — ${homeDocumentTitle}`
    : currentArticle
      ? `${currentArticle.title} — taotao`
      : isMissingArticle
        ? 'Article not found — taotao'
        : homeDocumentTitle;

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

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
      scrollPositions.current.set(currentPath, window.scrollY);
      shouldFocusAfterNavigationRef.current = true;
      window.history.pushState({}, '', `${destination.pathname}${destination.search}${destination.hash}`);
      setCurrentPath(destination.pathname);
    }

    function handleHistoryChange() {
      scrollPositions.current.set(currentPath, window.scrollY);
      shouldFocusAfterNavigationRef.current = true;
      setCurrentPath(window.location.pathname);
    }

    document.addEventListener('click', handleInternalNavigation);
    window.addEventListener('popstate', handleHistoryChange);

    return () => {
      window.history.scrollRestoration = previousRestoration;
      document.removeEventListener('click', handleInternalNavigation);
      window.removeEventListener('popstate', handleHistoryChange);
    };
  }, [currentPath]);

  useLayoutEffect(() => {
    document.title = documentTitle;

    if (!shouldFocusAfterNavigationRef.current) {
      return;
    }

    shouldFocusAfterNavigationRef.current = false;
    window.scrollTo({ top: scrollPositions.current.get(currentPath) || 0, behavior: 'instant' });
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
    page = <HomePage discovery={discovery} setDiscovery={setDiscovery} theme={theme} onThemeChange={setTheme} headingRef={pageHeadingRef} />;
  }

  return page;
}
