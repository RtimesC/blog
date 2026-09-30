import { useState, useMemo } from 'react';
import { IELTS_MODULES, EXTERNAL_RESOURCES } from '@/content/ielts/data';
import { getIeltsNotesByModule } from '@/content/ielts/ielts-content';
import { IeltsToolbar } from './ielts-toolbar';

function IeltsModuleContent({ currentModule, theme, onThemeChange, headingRef }) {
  // 从 URL 读取初始 category，例如 ?cat=Matching+Headings
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    return cat && currentModule.categories.includes(cat) ? cat : '全部';
  });

  const allNotes = useMemo(() => {
    return getIeltsNotesByModule(currentModule.id);
  }, [currentModule]);

  const filteredNotes = useMemo(() => {
    if (selectedCategory === '全部') return allNotes;
    return allNotes.filter((note) => note.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [allNotes, selectedCategory]);

  const allExtResources = useMemo(() => {
    return EXTERNAL_RESOURCES.filter((res) => res.module.toLowerCase() === currentModule.id.toLowerCase());
  }, [currentModule]);

  const filteredResources = useMemo(() => {
    if (selectedCategory === '全部') return allExtResources;
    return allExtResources.filter((res) => res.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [allExtResources, selectedCategory]);

  return (
    <main className="ielts-container">
      <div className="ielts-shell">
        <IeltsToolbar
          theme={theme}
          onChange={onThemeChange}
          crumbs={[
            { label: 'IELTS', href: '/ielts' },
            { label: currentModule.name },
          ]}
        />

        {/* 顶部三模块横向切换 */}
        <nav className="ielts-module-nav" aria-label="Switch modules">
          {IELTS_MODULES.map((mod) => (
            <a
              key={mod.id}
              href={`/ielts/${mod.id}`}
              className={`ielts-module-nav-item ${mod.id === currentModule.id ? 'is-active' : ''}`}
              aria-current={mod.id === currentModule.id ? 'page' : undefined}
            >
              {mod.name}
            </a>
          ))}
        </nav>

        <header className="ielts-header">
          <p className="ielts-eyebrow">{currentModule.eyebrow}</p>
          <h1 className="ielts-title" ref={headingRef} tabIndex={-1}>
            {currentModule.name} Strategy & Notes
          </h1>
          <p className="ielts-desc">{currentModule.description}</p>
        </header>

        {/* 题型与弱点分类 Filter Bar */}
        <section aria-label="Topic and weakness filter">
          <div className="ielts-filter-bar">
            {currentModule.categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`ielts-filter-btn ${selectedCategory === category ? 'is-active' : ''}`}
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* 内容双轨呈现：站内笔记 + 外部资料 */}
        <div className="ielts-content-columns">
          {/* 区域 A：站内笔记 */}
          <section className="ielts-sub-section" aria-labelledby="notes-heading">
            <div className="ielts-sub-heading">
              <h3 id="notes-heading">方法与复盘笔记</h3>
              <span>{filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}</span>
            </div>

            {filteredNotes.length > 0 ? (
              <div className="ielts-notes-list">
                {filteredNotes.map((note) => (
                  <a
                    key={note.slug}
                    href={`/ielts/notes/${note.slug}`}
                    className="ielts-note-card"
                  >
                    <div className="ielts-note-header">
                      <h4 className="ielts-note-title">{note.title}</h4>
                      {note.updatedAt && (
                        <time className="ielts-note-date">{note.updatedAt}</time>
                      )}
                    </div>
                    {note.summary && (
                      <p className="ielts-note-summary">{note.summary}</p>
                    )}
                    <div className="ielts-note-footer">
                      <span className="ielts-badge">{note.category}</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="ielts-empty-tip">
                当前分类暂无站内笔记。平时向 GPT 整理提炼的干货可沉淀于此。
              </div>
            )}
          </section>

          {/* 区域 B：精选外部优质资料 */}
          <section className="ielts-sub-section" aria-labelledby="resources-heading">
            <div className="ielts-sub-heading">
              <h3 id="resources-heading">精选外部资源</h3>
              <span>{filteredResources.length} {filteredResources.length === 1 ? 'link' : 'links'}</span>
            </div>

            {filteredResources.length > 0 ? (
              <div className="ielts-external-list">
                {filteredResources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="ielts-ext-card"
                  >
                    <div>
                      <div className="ielts-ext-title">
                        <span>{resource.title}</span>
                        <span className="ielts-ext-arrow" aria-hidden="true">↗</span>
                      </div>
                      <p className="ielts-ext-note">{resource.note}</p>
                    </div>
                    <div className="ielts-ext-meta">
                      <span className="ielts-badge">{resource.category}</span>
                      <span>{resource.source}</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="ielts-empty-tip">
                当前分类暂未收录外部链接。
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export function IeltsModulePage({ moduleId, theme, onThemeChange, headingRef }) {
  const currentModule = useMemo(() => {
    return IELTS_MODULES.find((m) => m.id.toLowerCase() === moduleId?.toLowerCase()) || IELTS_MODULES[1];
  }, [moduleId]);

  return (
    <IeltsModuleContent
      key={currentModule.id}
      currentModule={currentModule}
      theme={theme}
      onThemeChange={onThemeChange}
      headingRef={headingRef}
    />
  );
}
