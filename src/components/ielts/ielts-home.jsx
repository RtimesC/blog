import { IELTS_MODULES, EXTERNAL_RESOURCES, QUICK_TOOLS } from '@/content/ielts/data';
import { ieltsNotes } from '@/content/ielts/ielts-content';
import { IeltsToolbar } from './ielts-toolbar';

export function IeltsHomePage({ theme, onThemeChange, headingRef }) {
  return (
    <main className="ielts-container">
      <div className="ielts-shell">
        <IeltsToolbar
          theme={theme}
          onChange={onThemeChange}
          crumbs={[{ label: 'IELTS' }]}
        />

        <header className="ielts-header">
          <p className="ielts-eyebrow">Personal Workbench</p>
          <h1 className="ielts-title" ref={headingRef} tabIndex={-1}>
            IELTS Study Space
          </h1>
          <p className="ielts-desc">
            按模块、高频题型与弱点整理的备考资料入口。聚焦真正有价值的解题方法、复盘笔记与精选外部工具。
          </p>
        </header>

        <section className="ielts-modules-grid" aria-label="Core IELTS modules">
          {IELTS_MODULES.map((module) => {
            const moduleNotes = ieltsNotes.filter((n) => n.module.toLowerCase() === module.id.toLowerCase());
            const moduleExts = EXTERNAL_RESOURCES.filter((r) => r.module.toLowerCase() === module.id.toLowerCase());

            return (
              <div key={module.id} className="ielts-module-card">
                <div className="ielts-card-top">
                  <div className="ielts-card-meta">
                    <span className="ielts-card-kicker">{module.eyebrow}</span>
                    <span className="ielts-card-count">
                      {moduleNotes.length} notes · {moduleExts.length} links
                    </span>
                  </div>

                  <h2 className="ielts-card-title">
                    <a href={`/ielts/${module.id}`} className="hover:underline">
                      {module.name}
                    </a>
                  </h2>
                  <p className="ielts-card-desc">{module.description}</p>

                  <div className="ielts-card-tags" aria-label="Quick focus tags">
                    {module.quickTags.map((tag) => (
                      <a
                        key={tag}
                        href={`/ielts/${module.id}?cat=${encodeURIComponent(tag)}`}
                        className="ielts-tag-pill"
                        title={`进入 ${module.name} 并筛选 ${tag}`}
                      >
                        {tag}
                      </a>
                    ))}
                  </div>
                </div>

                <a href={`/ielts/${module.id}`} className="ielts-card-action">
                  <span>进入 {module.name} 模块</span>
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            );
          })}
        </section>

        <section className="ielts-quick-tools" aria-label="External reference tools">
          <div className="ielts-section-header">
            <h2 className="ielts-section-title">常用备考工具</h2>
            <span className="ielts-section-subtitle">权威评分与高质量学习入口</span>
          </div>

          <div className="ielts-tools-list">
            {QUICK_TOOLS.map((tool) => (
              <a
                key={tool.title}
                href={tool.url}
                target="_blank"
                rel="noreferrer noopener"
                className="ielts-tool-link"
              >
                <div className="ielts-tool-header">
                  <span className="ielts-tool-name">{tool.title}</span>
                  <span className="ielts-tool-source">{tool.source} ↗</span>
                </div>
                <p className="ielts-tool-desc">{tool.desc}</p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
