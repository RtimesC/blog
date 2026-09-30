import { ThemeSwitch } from '@/components/theme-switch';

export function IeltsToolbar({ theme, onChange, crumbs = [] }) {
  return (
    <div className="taotao-article-toolbar ielts-toolbar">
      <nav className="ielts-breadcrumbs" aria-label="Breadcrumbs">
        <a className="taotao-article-back" href="/">
          <span aria-hidden="true" className="toolbar-mark"><i /><i /><i /></span>
          <span>taotao</span>
        </a>
        {crumbs.map((crumb, idx) => (
          <span key={idx} className="ielts-crumb-item">
            <span className="ielts-crumb-sep">/</span>
            {crumb.href ? (
              <a href={crumb.href} className="ielts-crumb-link">{crumb.label}</a>
            ) : (
              <span className="ielts-crumb-current" aria-current="page">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      <ThemeSwitch value={theme} onChange={onChange} />
    </div>
  );
}
