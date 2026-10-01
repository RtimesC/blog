import { ReadingLayout } from '@/components/reading-layout';
import ReactMarkdown from 'react-markdown';
import { getIeltsNoteBySlug } from '@/content/ielts/ielts-content';
import { IeltsToolbar } from './ielts-toolbar';

export function IeltsNotePage({ slug, theme, onThemeChange, headingRef }) {
  const note = getIeltsNoteBySlug(slug);

  if (!note) {
    return (
      <main className="taotao-article-page paper-article">
        <IeltsToolbar
          theme={theme}
          onChange={onThemeChange}
          crumbs={[{ label: 'IELTS', href: '/ielts' }, { label: 'Not Found' }]}
        />
        <article className="taotao-article-sheet">
          <header className="taotao-article-header">
            <h1 ref={headingRef} tabIndex={-1}>Note not found</h1>
            <p className="taotao-article-lede">
              The requested IELTS note does not exist or has been moved.
            </p>
            <a href="/ielts" className="ielts-back-btn">
              ← 返回 IELTS 主页
            </a>
          </header>
        </article>
      </main>
    );
  }

  const moduleName = note.module.charAt(0).toUpperCase() + note.module.slice(1);

  return (
    <main className="taotao-article-page paper-article reading-page">
      <IeltsToolbar
        theme={theme}
        onChange={onThemeChange}
        crumbs={[
          { label: 'IELTS', href: '/ielts' },
          { label: moduleName, href: `/ielts/${note.module}` },
          { label: note.title },
        ]}
      />
      <ReadingLayout key={note.slug || slug} contentKey={slug}>

      <article className="taotao-article-sheet taotao-article-sheet--full">
        <header className="taotao-article-header">
          <div className="ielts-single-meta">
            <span className="ielts-badge">{note.category}</span>
            {note.updatedAt && <span>更新于 {note.updatedAt}</span>}
          </div>
          <h1 ref={headingRef} tabIndex={-1}>{note.title}</h1>
        </header>

        {note.summary && (
          <div className="paper-metadata article-intro-card">
            <section className="paper-abstract" aria-label="Note summary">
              <p>{note.summary}</p>
            </section>
          </div>
        )}

        <div className="taotao-article-body">
          <div className="taotao-markdown">
            <ReactMarkdown>{note.body}</ReactMarkdown>
          </div>
        </div>

        <footer className="article-endcap"><span>End of note</span>
          <a href={`/ielts/${note.module}`} className="ielts-back-btn">
            ← 返回 {moduleName} 模块
          </a>
        </footer>
      </article>
      </ReadingLayout>
    </main>
  );
}
