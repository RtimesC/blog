import { useState } from 'react';
import { articles } from '@/content/articles';
import { ThemeSwitch } from '@/components/theme-switch';

export function HomePage({ theme, onThemeChange, headingRef }) {
  const [panel, setPanel] = useState(null);
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('');
  const topics = [...new Set(articles.flatMap((article) => article.keywords))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const results = articles.filter((article) => {
    const text = [article.title, article.abstract, ...article.keywords, article.body].join(' ').toLocaleLowerCase();
    return (!topic || article.keywords.includes(topic)) && terms.every((term) => text.includes(term));
  });

  return (
    <main className="knowledge-home">
      <a className="home-skip" href="#articles">Skip to articles</a>
      <div className="knowledge-shell">
        <header className="knowledge-header">
          <a className="knowledge-brand" href="/" aria-label="Knowledge Space home"><span aria-hidden="true" className="brand-mark" />Knowledge Space</a>
          <div className="knowledge-tools">
            <nav aria-label="Main navigation">
              <button aria-expanded={panel === 'topics'} aria-controls="home-discovery" onClick={() => setPanel(panel === 'topics' ? null : 'topics')}>Topics</button>
              <button aria-expanded={panel === 'search'} aria-controls="home-discovery" onClick={() => setPanel(panel === 'search' ? null : 'search')}>Search</button>
              <a href="/about">About</a>
            </nav>
            <ThemeSwitch value={theme} onChange={onThemeChange} />
          </div>
        </header>

        <section className="knowledge-intro">
          <p className="home-eyebrow">Learning · Making · Writing</p>
          <h1 ref={headingRef} tabIndex={-1}>Building knowledge, one piece at a time.</h1>
          <p>A knowledge space built for myself and open to others.<br />Notes on specific questions, complete projects, and ideas explored in depth.</p>
        </section>

        <div id="home-discovery" className="home-discovery" hidden={!panel}>
          {panel === 'search' && <div className="home-search">
            <label htmlFor="article-search">Search articles</label>
            <input id="article-search" type="search" placeholder="Search titles, keywords, or text…" value={query} onChange={(event) => setQuery(event.target.value)} />
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
          <div className="feed-label"><span>{query || topic ? 'Filtered results' : 'Recent thoughts and projects'}</span><span>{results.length.toString().padStart(2, '0')} {results.length === 1 ? 'article' : 'articles'}</span></div>
          {(query || topic) && <div className="active-filters"><span role="status">{topic && `Topic: ${topic}`}{topic && query && ' · '}{query && `Search: ${query}`}</span><button onClick={() => { setQuery(''); setTopic(''); }}>Clear filters</button></div>}
          <div className="paper-index__list">
            {results.map((entry, index) => <article className="paper-index__entry" key={entry.slug} aria-labelledby={`title-${entry.slug}`}>
              <a className="paper-index__card" href={`/articles/${entry.slug}`}>
                <div className="entry-heading">
                  <h2 id={`title-${entry.slug}`}>{entry.title}</h2>
                  <time dateTime={entry.activityAt}>{entry.revisedAt ? 'Updated ' : ''}{entry.activityAt.replaceAll('-', '.')}</time>
                </div>
                <div className="paper-index__poster"><img src={entry.cover} alt="" loading={index === 0 ? 'eager' : 'lazy'} /></div>
              </a>
              <div className="entry-keywords" aria-label="Keywords">{entry.keywords.map((keyword) => <button key={keyword} aria-pressed={topic === keyword} onClick={() => { setTopic(topic === keyword ? '' : keyword); setPanel('topics'); }}>{keyword}</button>)}</div>
            </article>)}
          </div>
          {!results.length && <div className="home-empty" role="status"><h2>{articles.length ? 'No matching articles' : 'The first note is waiting to be written.'}</h2><p>{articles.length ? 'Try another keyword, or clear the filters to view all articles.' : 'Start with one specific question.'}</p></div>}
        </section>
      </div>
    </main>
  );
}
