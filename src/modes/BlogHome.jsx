import * as Separator from '@radix-ui/react-separator';
import BlogNavigation from '../components/ui/BlogNavigation';
import { fieldNotes, profile, works } from '../content/portfolio';
import '../styles/BlogHome.scss';

const noteDate = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

export default function BlogHome() {
  return (
    <div className="blog-home" id="top">
      <header className="blog-home__header">
        <a className="blog-home__wordmark" href="#top" aria-label="Tao blog home">Tao.</a>
        <BlogNavigation />
        <span className="blog-home__label">Notes / 2026</span>
      </header>

      <main className="blog-home__main">
        <section className="blog-home__hero" aria-labelledby="blog-title">
          <p className="blog-home__eyebrow">Independent 2D journal</p>
          <h1 id="blog-title">{profile.role}.</h1>
          <p className="blog-home__intro">
            Notes and project records about the systems I am learning to build —
            from simulation checks to physical interfaces.
          </p>
          <a className="blog-home__jump-link" href="#notes">Read the latest notes <span aria-hidden="true">↓</span></a>
        </section>

        <Separator.Root className="blog-home__rule" decorative />

        <section className="blog-home__section" id="notes" aria-labelledby="notes-heading">
          <div className="blog-home__section-heading">
            <p className="blog-home__section-kicker">01 / Field notes</p>
            <h2 id="notes-heading">Small observations from active work.</h2>
          </div>

          <ol className="blog-home__notes">
            {fieldNotes.map((note, index) => (
              <li className="blog-home__note" key={note.id}>
                <span className="blog-home__note-index">{String(index + 1).padStart(2, '0')}</span>
                <article>
                  <p className="blog-home__note-date">
                    <time dateTime={note.date}>{noteDate.format(new Date(`${note.date}T00:00:00`))}</time>
                    <span aria-hidden="true"> · </span>
                    {works.find((work) => work.slug === note.workSlug)?.title}
                  </p>
                  <h3>{note.title}</h3>
                  <p>{note.description}</p>
                </article>
              </li>
            ))}
          </ol>
        </section>

        <Separator.Root className="blog-home__rule" decorative />

        <section className="blog-home__section" id="projects" aria-labelledby="projects-heading">
          <div className="blog-home__section-heading">
            <p className="blog-home__section-kicker">02 / Selected work</p>
            <h2 id="projects-heading">Projects with visible boundaries.</h2>
          </div>

          <div className="blog-home__projects">
            {works.map((work, index) => (
              <article className="blog-home__project" key={work.slug}>
                <div className="blog-home__project-topline">
                  <span>0{index + 1}</span>
                  <p>{work.role}</p>
                </div>
                <h3>{work.title}</h3>
                <p className="blog-home__project-summary">{work.summary}</p>
                <p className="blog-home__project-system">{work.system}</p>
                <ul className="blog-home__tags" aria-label={`${work.title} technologies`}>
                  {work.stack.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <a href={work.repoUrl} target="_blank" rel="noreferrer">View source <span aria-hidden="true">↗</span></a>
              </article>
            ))}
          </div>
        </section>

        <Separator.Root className="blog-home__rule" decorative />

        <section className="blog-home__about" id="about" aria-labelledby="about-heading">
          <p className="blog-home__section-kicker">03 / About</p>
          <div>
            <h2 id="about-heading">A working notebook for building in public.</h2>
            <p>
              This blog keeps project notes readable, linkable, and grounded in the systems behind them.
            </p>
            <ul className="blog-home__interests" aria-label="Interests">
              {profile.interests.map((interest) => <li key={interest}>{interest}</li>)}
            </ul>
          </div>
        </section>
      </main>

      <footer className="blog-home__footer">
        <span>© Tao / Field notes</span>
      </footer>
    </div>
  );
}
