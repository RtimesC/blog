import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { articles, getArticleBySlug } from '@/content/articles';
import { ThemeSwitch } from '@/components/theme-switch';

const pageTitle = "Hi, I'm τaotao.";
const currentState = 'I major in Mechatronics and Robotics. Lately, I have been exploring SLAM, deep learning, and small experiments with STM32.';

function ArticleToolbar({ checked, onChange }) {
  return (
    <div className="taotao-article-toolbar">
      <Button asChild size="sm">
        <a className="taotao-article-back" href="/">Back to notes</a>
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

export default function App() {
  const [isDark, setIsDark] = useState(() => window.localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#212121' : '#e8e8e8');
    window.localStorage.setItem('theme', theme);
  }, [isDark]);

  let page;

  if (window.location.pathname.startsWith('/articles/')) {
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
            <h1 aria-label={pageTitle}>
              <svg aria-hidden="true" className="taotao-title" focusable="false" viewBox="0 0 600 100">
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
            <ThemeSwitch checked={isDark} onChange={setIsDark} />
          </div>

          <section className="taotao-current-state" aria-label="Current state">
            <div className="taotao-current-state__copy">
              <p>{currentState}</p>
            </div>
          </section>

          <section className="taotao-card-list" aria-label="Notes">
            {articles.map((entry) => <FlipCard entry={entry} key={entry.slug} />)}
          </section>
        </div>
      </main>
    );
  }

  return page;
}
