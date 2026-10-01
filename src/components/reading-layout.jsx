import { useEffect, useRef, useState } from 'react';

export function ReadingLayout({ children, contentKey }) {
  const contentRef = useRef(null);
  const progressRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const content = contentRef.current;
    const headings = [...content.querySelectorAll('.taotao-markdown h2')];
    headings.forEach((heading, index) => {
      heading.id ||= `section-${index + 1}`;
      heading.tabIndex = -1;
    });
    let scheduledFrame;
    function updateReadingPosition() {
      cancelAnimationFrame(scheduledFrame);
      scheduledFrame = requestAnimationFrame(() => {
        const start = content.getBoundingClientRect().top + window.scrollY;
        const distance = content.offsetHeight - window.innerHeight;
        const progress = distance > 0 ? Math.max(0, Math.min(1, (window.scrollY - start) / distance)) : 0;
        progressRef.current.style.transform = `scaleX(${progress})`;
        const reached = headings.filter((heading) => heading.getBoundingClientRect().top <= 160);
        setActiveSection(reached.at(-1)?.id || '');
      });
    }
    const initialFrame = requestAnimationFrame(() => {
      setSections(headings.map((heading) => ({ id: heading.id, title: heading.textContent })));
      updateReadingPosition();
    });
    window.addEventListener('scroll', updateReadingPosition, { passive: true });
    window.addEventListener('resize', updateReadingPosition);
    const resizeObserver = new ResizeObserver(updateReadingPosition);
    resizeObserver.observe(content);
    return () => {
      cancelAnimationFrame(initialFrame);
      cancelAnimationFrame(scheduledFrame);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updateReadingPosition);
      window.removeEventListener('resize', updateReadingPosition);
    };
  }, [contentKey]);

  function jumpToSection(event, id) {
    event.preventDefault();
    mobileMenuRef.current?.removeAttribute('open');
    const heading = document.getElementById(id);
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }

  const links = sections.map((section, index) => (
    <li key={section.id}>
      <a href={`#${section.id}`} aria-current={activeSection === section.id ? 'location' : undefined} onClick={(event) => jumpToSection(event, section.id)}>
        <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{section.title}
      </a>
    </li>
  ));

  return (
    <>
      <div className="reading-progress" aria-hidden="true"><span ref={progressRef} /></div>
      <div className="reading-layout">
        {sections.length > 0 && <aside className="reading-sidebar">
          <nav className="reading-desktop-nav" aria-label="Article contents"><p>On this page</p><ol>{links}</ol></nav>
          <details className="reading-mobile-nav" ref={mobileMenuRef}><summary>On this page <span>{sections.length} sections</span></summary><nav aria-label="Article contents"><ol>{links}</ol></nav></details>
        </aside>}
        <div className="reading-content" ref={contentRef}>{children}</div>
      </div>
    </>
  );
}
