import { useEffect, useRef, useState } from 'react';
import { getWork, profile, works } from '../../content/portfolio';
import '../../styles/ReaderOverlay.scss';

const getReaderState = () => {
  if (typeof window === 'undefined') return { isOpen: false, view: 'index', slug: null };

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('work');
  if (slug && getWork(slug)) return { isOpen: true, view: 'work', slug };
  if (params.get('read') === 'selected') return { isOpen: true, view: 'index', slug: null };
  return { isOpen: false, view: 'index', slug: null };
};

const updateReaderUrl = ({ view, slug }) => {
  const url = new URL(window.location.href);
  url.searchParams.delete('read');
  url.searchParams.delete('work');

  if (view === 'work' && slug) url.searchParams.set('work', slug);
  if (view === 'index') url.searchParams.set('read', 'selected');

  window.history.pushState({}, '', url);
};

const ReaderOverlay = () => {
  const [reader, setReader] = useState(getReaderState);
  const [copyStatus, setCopyStatus] = useState('');
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const returnFocusRef = useRef(null);

  const openIndex = () => {
    returnFocusRef.current = document.activeElement;
    const next = { isOpen: true, view: 'index', slug: null };
    updateReaderUrl(next);
    setReader(next);
  };

  const openWork = (slug) => {
    if (!getWork(slug)) return;
    returnFocusRef.current = document.activeElement;
    const next = { isOpen: true, view: 'work', slug };
    updateReaderUrl(next);
    setReader(next);
  };

  const closeReader = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('read');
    url.searchParams.delete('work');
    window.history.replaceState({}, '', url);
    setReader({ isOpen: false, view: 'index', slug: null });
    window.setTimeout(() => returnFocusRef.current?.focus?.(), 0);
  };

  useEffect(() => {
    const handlePopState = () => setReader(getReaderState());
    const handleOpen = (event) => {
      const slug = event.detail;
      if (slug && slug !== 'selected') openWork(slug);
      else openIndex();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('reader:open', handleOpen);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('reader:open', handleOpen);
    };
  }, []);

  useEffect(() => {
    if (!reader.isOpen) return undefined;

    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeReader();
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [reader.isOpen, reader.view, reader.slug]);

  const copyDirectLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus('Link copied');
    } catch {
      setCopyStatus('Copy the address from your browser');
    }
  };

  const activeWork = reader.view === 'work' ? getWork(reader.slug) : null;

  return (
    <>
      <button type="button" className="reader-launch" onClick={openIndex}>
        Read selected work
      </button>

      {reader.isOpen && (
        <div className="reader-backdrop" role="presentation" onMouseDown={closeReader}>
          <section
            ref={dialogRef}
            className="reader-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reader-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="reader-header">
              <p>{profile.role}</p>
              <button ref={closeRef} type="button" onClick={closeReader} aria-label="Close reader">
                Close
              </button>
            </header>

            {activeWork ? (
              <article className="reader-article">
                <button type="button" className="reader-back" onClick={openIndex}>← All selected work</button>
                <p className="reader-eyebrow">Selected work</p>
                <h1 id="reader-title">{activeWork.title}</h1>
                <p className="reader-lede">{activeWork.summary}</p>

                <dl className="reader-facts">
                  <div><dt>Role</dt><dd>{activeWork.role}</dd></div>
                  <div><dt>System</dt><dd>{activeWork.system}</dd></div>
                  <div><dt>Stack</dt><dd>{activeWork.stack.join(' · ')}</dd></div>
                </dl>

                {activeWork.readerSections.map((section) => (
                  <section key={section.heading} className="reader-section">
                    <h2>{section.heading}</h2>
                    <p>{section.body}</p>
                  </section>
                ))}

                <section className="reader-section">
                  <h2>Repository evidence</h2>
                  <ul>
                    {activeWork.evidence.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </section>

                <footer className="reader-actions">
                  <a href={activeWork.repoUrl} target="_blank" rel="noreferrer">View on GitHub ↗</a>
                  <button type="button" onClick={copyDirectLink}>Copy direct link</button>
                </footer>
              </article>
            ) : (
              <div className="reader-index">
                <p className="reader-eyebrow">Selected work</p>
                <h1 id="reader-title">Robotics, simulation, embedded interfaces.</h1>
                <p className="reader-lede">A small set of robotics and embedded systems projects. Each entry keeps the system boundary and the evidence close to the claim.</p>

                <div className="reader-work-list">
                  {works.map((work) => (
                    <button key={work.slug} type="button" className="reader-work-card" onClick={() => openWork(work.slug)}>
                      <img src={work.artwork} alt="" />
                      <span>
                        <strong>{work.title}</strong>
                        <small>{work.summary}</small>
                        <em>Read notes →</em>
                      </span>
                    </button>
                  ))}
                </div>
                <footer className="reader-actions">
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub / RtimesC ↗</a>
                  <button type="button" onClick={copyDirectLink}>Copy direct link</button>
                </footer>
              </div>
            )}

            <span className="reader-status" aria-live="polite">{copyStatus}</span>
          </section>
        </div>
      )}
    </>
  );
};

export default ReaderOverlay;
