import { useCallback, useEffect, useRef } from 'react';
import { articles } from '@/content/articles';
import { ThemeSwitch } from '@/components/theme-switch';

export function HomePage({ theme, onThemeChange, headingRef, discovery, setDiscovery }) {
  const { panel, query, topic } = discovery;
  const searchInputRef = useRef(null);
  const setPanel = useCallback((nextPanel) => setDiscovery((state) => ({ ...state, panel: nextPanel })), [setDiscovery]);
  const setQuery = (query) => setDiscovery((state) => ({ ...state, query }));
  const setTopic = (topic) => setDiscovery((state) => ({ ...state, topic }));
  const topics = [...new Set(articles.flatMap((article) => article.keywords))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const normalize = (value) => value.normalize('NFKC').toLocaleLowerCase('zh-CN').replace(/\s+/g, ' ').trim();
  const terms = normalize(query).split(/[\s,，、;；]+/).filter(Boolean);
  const results = articles
    .map((article) => {
      const title = normalize(article.title);
      const abstract = normalize(article.abstract);
      const keywords = normalize(article.keywords.join(' '));
      const body = normalize(article.body);
      const searchable = `${title} ${abstract} ${keywords} ${body}`;
      const matches = terms.every((term) => searchable.includes(term));
      const score = terms.reduce((total, term) => total
        + (title.includes(term) ? 8 : 0)
        + (keywords.includes(term) ? 5 : 0)
        + (abstract.includes(term) ? 3 : 0)
        + (body.includes(term) ? 1 : 0), 0);
      return { article, matches, score };
    })
    .filter(({ article, matches }) => (!topic || article.keywords.includes(topic)) && matches)
    .sort((first, second) => second.score - first.score || second.article.activityAt.localeCompare(first.article.activityAt))
    .map(({ article }) => article);

  useEffect(() => {
    function handleSearchShortcut(event) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      event.preventDefault();
      setPanel('search');
    }

    document.addEventListener('keydown', handleSearchShortcut);
    return () => document.removeEventListener('keydown', handleSearchShortcut);
  }, [setPanel]);

  useEffect(() => {
    if (panel === 'search') searchInputRef.current?.focus();
  }, [panel]);

  return (
    <main className="knowledge-home">
      <a className="home-skip" href="#articles">Skip to articles</a>
      <div className="knowledge-shell">
        <header className="knowledge-header">
          <a className="knowledge-brand" href="/" aria-label="taotao home">
            <span aria-hidden="true" className="brand-mark"><i /><i /><i /></span>
            <span>taotao</span>
          </a>
          <p className="header-note">A public notebook for robotics, AI, and the questions in between.</p>
          <div className="knowledge-tools">
            <nav aria-label="Main navigation">
              <button aria-expanded={panel === 'topics'} aria-controls="home-discovery" onClick={() => setPanel(panel === 'topics' ? null : 'topics')}>Topics</button>
              <button aria-expanded={panel === 'search'} aria-controls="home-discovery" aria-keyshortcuts="/" onClick={() => setPanel(panel === 'search' ? null : 'search')}>Search <span className="nav-shortcut">/</span></button>
              <a href="/ielts">IELTS</a>
              <a href="/about">About</a>
            </nav>
            <ThemeSwitch value={theme} onChange={onThemeChange} />
          </div>
        </header>

        <section className="knowledge-intro">
          <div className="intro-copy">
            <p className="home-eyebrow">Learning · Making · Writing</p>
            <h1 ref={headingRef} tabIndex={-1}>A workbench for ideas that are still becoming.</h1>
            <p>A quiet place to turn questions, experiments, and unfinished ideas into something worth returning to.</p>
            <div className="intro-signal" aria-hidden="true"><span className="signal-pulse" /><span className="signal-label">Open thread</span><span className="signal-track" /></div>
          </div>
          <dl className="intro-index" aria-label="Space overview">
            <div><dt>{String(articles.length).padStart(2, '0')}</dt><dd>published {articles.length === 1 ? 'note' : 'notes'}</dd></div>
            <div><dt>∞</dt><dd>questions in progress</dd></div>
          </dl>
        </section>

        <div id="home-discovery" className="home-discovery" hidden={!panel}>
          {panel === 'search' && <div className="home-search">
            <label htmlFor="article-search">Search articles</label>
            <div className="search-field">
              <span aria-hidden="true" className="search-icon">⌕</span>
              <input ref={searchInputRef} id="article-search" type="search" placeholder="Search titles, keywords, or text…" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') setPanel(null); }} />
              {query && <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setQuery('')}>×</button>}
            </div>
            <div className="search-meta"><span>Search is ranked by title, keyword, abstract, then body.</span><span>{results.length} {results.length === 1 ? 'match' : 'matches'}</span></div>
          </div>}
          {panel === 'topics' && <section aria-label="Topic index">
            <p className="discovery-label">Explore by keyword</p>
            <div className="topic-list">
              <button aria-pressed={!topic} onClick={() => setTopic('')}>All <span>{articles.length}</span></button>
              {topics.map((keyword) => <button key={keyword} aria-pressed={topic === keyword} onClick={() => setTopic(topic === keyword ? '' : keyword)}>{keyword}<span>{articles.filter((article) => article.keywords.includes(keyword)).length}</span></button>)}
            </div>
          </section>}
        </div>

        <section id="articles" className="knowledge-feed" aria-label="Article list">
          <div className="portal-heading">
            <div><span className="portal-kicker">Reading room</span><h2>{query ? 'Search results' : topic ? 'Topic results' : 'Recent notes'}</h2></div>
            <span className="portal-count" aria-live="polite">{results.length.toString().padStart(2, '0')} {results.length === 1 ? 'article' : 'articles'}</span>
          </div>
          {(query || topic) && <div className="active-filters" role="status">
            {topic && <button type="button" onClick={() => setTopic('')}>Topic: {topic} <span aria-hidden="true">×</span></button>}
            {query && <button type="button" onClick={() => setQuery('')}>Search: {query} <span aria-hidden="true">×</span></button>}
            <button type="button" className="clear-all" onClick={() => { setQuery(''); setTopic(''); }}>Clear all</button>
          </div>}
          <div className="paper-index__list">
            {results.map((entry, index) => <article className={`paper-index__entry${index === 0 ? ' is-featured' : ''}`} style={{ '--entry-delay': `${index * 120}ms` }} key={entry.slug} aria-labelledby={`title-${entry.slug}`}>
              <a className="paper-index__card" href={`/articles/${entry.slug}`}>
                <div className="entry-heading">
                  <div className="entry-title-line"><span className="entry-number">{String(index + 1).padStart(2, '0')}</span><div><span className="entry-kicker">{index === 0 ? 'Featured note' : 'Note'}</span><h2 id={`title-${entry.slug}`}>{entry.title}</h2></div></div>
                  <time dateTime={entry.activityAt}>{entry.revisedAt ? 'Updated ' : ''}{entry.activityAt.replaceAll('-', '.')}</time>
                </div>
                <div className="paper-index__poster"><img src={entry.cover} alt="" loading={index === 0 ? 'eager' : 'lazy'} /></div>
                <span className="entry-read">Read article <span aria-hidden="true">↗</span></span>
              </a>
              <div className="entry-keywords" aria-label="Keywords">{entry.keywords.map((keyword) => <button key={keyword} aria-pressed={topic === keyword} onClick={() => { setTopic(topic === keyword ? '' : keyword); setPanel('topics'); }}>{keyword}</button>)}</div>
            </article>)}
          </div>
          {!results.length && <div className="home-empty" role="status"><h2>{articles.length ? 'No matching articles' : 'The first note is waiting to be written.'}</h2><p>{articles.length ? 'Try a shorter phrase, browse the topics, or clear the filters.' : 'Start with one specific question.'}</p>{articles.length > 0 && (query || topic) && <button type="button" onClick={() => { setQuery(''); setTopic(''); }}>View all articles</button>}</div>}
        </section>
      </div>
    </main>
  );
}
