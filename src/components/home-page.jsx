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
      <a className="home-skip" href="#articles">跳到文章</a>
      <div className="knowledge-shell">
        <header className="knowledge-header">
          <a className="knowledge-brand" href="/" aria-label="知识空间首页"><span aria-hidden="true" className="brand-mark" />知识空间</a>
          <div className="knowledge-tools">
            <nav aria-label="主导航">
              <button aria-expanded={panel === 'topics'} aria-controls="home-discovery" onClick={() => setPanel(panel === 'topics' ? null : 'topics')}>主题索引</button>
              <button aria-expanded={panel === 'search'} aria-controls="home-discovery" onClick={() => setPanel(panel === 'search' ? null : 'search')}>搜索</button>
              <a href="/about">About</a>
            </nav>
            <ThemeSwitch value={theme} onChange={onThemeChange} />
          </div>
        </header>

        <section className="knowledge-intro">
          <p className="home-eyebrow">学习 · 实践 · 写作</p>
          <h1 ref={headingRef} tabIndex={-1}>把知识，逐渐建立起来。</h1>
          <p>一个为自己建立、也向他人开放的知识空间。<br />记录具体的问题、完整的项目，以及不断深入的理解。</p>
        </section>

        <div id="home-discovery" className="home-discovery" hidden={!panel}>
          {panel === 'search' && <div className="home-search">
            <label htmlFor="article-search">搜索文章</label>
            <input id="article-search" type="search" placeholder="搜索标题、关键词或正文…" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>}
          {panel === 'topics' && <section aria-label="主题索引">
            <p className="discovery-label">从关键词探索主题</p>
            <div className="topic-list">
              <button aria-pressed={!topic} onClick={() => setTopic('')}>全部 <span>{articles.length}</span></button>
              {topics.map((keyword) => <button key={keyword} aria-pressed={topic === keyword} onClick={() => setTopic(topic === keyword ? '' : keyword)}>{keyword}<span>{articles.filter((article) => article.keywords.includes(keyword)).length}</span></button>)}
            </div>
          </section>}
        </div>

        <section id="articles" className="knowledge-feed" aria-label="文章列表">
          <div className="feed-label"><span>{query || topic ? '筛选结果' : '最近的思考与构建'}</span><span>{results.length.toString().padStart(2, '0')} 篇</span></div>
          {(query || topic) && <div className="active-filters"><span role="status">{topic && `主题：${topic}`}{topic && query && ' · '}{query && `搜索：${query}`}</span><button onClick={() => { setQuery(''); setTopic(''); }}>清除筛选</button></div>}
          <div className="paper-index__list">
            {results.map((entry, index) => <article className="paper-index__entry" key={entry.slug} aria-labelledby={`title-${entry.slug}`}>
              <a className="paper-index__card" href={`/articles/${entry.slug}`}>
                <div className="entry-heading">
                  <h2 id={`title-${entry.slug}`}>{entry.title}</h2>
                  <time dateTime={entry.activityAt}>{entry.revisedAt ? '更新于 ' : ''}{entry.activityAt.replaceAll('-', '.')}</time>
                </div>
                <div className="paper-index__poster"><img src={entry.cover} alt="" loading={index === 0 ? 'eager' : 'lazy'} /></div>
              </a>
              <div className="entry-keywords" aria-label="关键词">{entry.keywords.map((keyword) => <button key={keyword} aria-pressed={topic === keyword} onClick={() => { setTopic(topic === keyword ? '' : keyword); setPanel('topics'); }}>{keyword}</button>)}</div>
            </article>)}
          </div>
          {!results.length && <div className="home-empty" role="status"><h2>{articles.length ? '没有找到匹配的文章' : '第一篇记录，尚待写下。'}</h2><p>{articles.length ? '试试其他关键词，或清除筛选查看全部文章。' : '从一个具体的问题开始。'}</p></div>}
        </section>
      </div>
    </main>
  );
}
