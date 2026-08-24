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
  const featuredWork = works[0];
  const featuredNote = fieldNotes[0];

  return (
    <div className="blog-home" id="top">
      <header className="blog-home__header">
        <a className="blog-home__wordmark" href="#top" aria-label="Tao Systems Log home">
          Tao<span>.</span>
        </a>
        <BlogNavigation />
        <p className="blog-home__edition">Research archive<br />2026 / 01</p>
      </header>

      <main className="blog-home__main">
        <section className="blog-home__hero" aria-labelledby="blog-title">
          <div className="blog-home__hero-copy">
            <p className="blog-home__kicker">Personal research archive</p>
            <h1 id="blog-title">Systems<br /><em>under test.</em></h1>
            <p>
              {profile.name} documents how simulation, embedded interfaces, and
              physical machines meet at a deliberate boundary.
            </p>
            <a className="blog-home__text-link" href="#selected-record">
              Open selected record <span aria-hidden="true">↓</span>
            </a>
          </div>

          <dl className="blog-home__hero-index" aria-label="Current focus">
            <div>
              <dt>Focus</dt>
              <dd>Embodied systems</dd>
            </div>
            <div>
              <dt>Method</dt>
              <dd>Bounded experiments</dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>Notes / records / evidence</dd>
            </div>
          </dl>
        </section>

        <Separator.Root className="blog-home__rule" decorative />

        <section className="blog-home__section" id="selected-record" aria-labelledby="record-heading">
          <div className="blog-home__section-heading">
            <p className="blog-home__section-index">01 / Selected record</p>
            <h2 id="record-heading">One system,<br />made legible.</h2>
          </div>

          <article className="record">
            <div className="record__marker" aria-hidden="true">
              <span>REC</span>
              <strong>001</strong>
            </div>
            <div className="record__main">
              <div className="record__heading">
                <p className="record__status"><span />Active system</p>
                <h3>{featuredWork.title}</h3>
              </div>
              <p className="record__summary">{featuredWork.summary}</p>
              <p className="record__system">{featuredWork.system}</p>
            </div>
            <div className="record__evidence">
              <p className="record__label">Evidence boundary</p>
              <ul>
                {featuredWork.evidence.slice(0, 2).map((item) => <li key={item}>{item}</li>)}
              </ul>
              <div className="record__footer">
                <ul className="record__stack" aria-label="Technologies">
                  {featuredWork.stack.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <a className="blog-home__text-link" href={featuredWork.repoUrl} target="_blank" rel="noreferrer">
                  Source <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </article>
        </section>

        <Separator.Root className="blog-home__rule" decorative />

        <section className="blog-home__section blog-home__reading" id="notes" aria-labelledby="reading-heading">
          <div className="blog-home__section-heading">
            <p className="blog-home__section-index">02 / Latest note</p>
            <h2 id="reading-heading">The constraint<br />is the point.</h2>
          </div>

          <article className="reading-sample">
            <div className="reading-sample__meta">
              <time dateTime={featuredNote.date}>{noteDate.format(new Date(featuredNote.date + 'T00:00:00'))}</time>
              <span>5 min read</span>
              <span>System note</span>
            </div>
            <div>
              <h3>{featuredNote.title}</h3>
              <p>{featuredNote.description}</p>
              <p>
                The interesting work is not simply connecting the parts. It is making
                every transition observable, bounded, and safe to inspect before the
                machine acts.
              </p>
              <a className="blog-home__text-link" href="#archive">
                Read the note <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        </section>

        <Separator.Root className="blog-home__rule" decorative />

        <section className="blog-home__section" id="archive" aria-labelledby="archive-heading">
          <div className="blog-home__section-heading">
            <p className="blog-home__section-index">03 / Archive index</p>
            <h2 id="archive-heading">Current lines<br />of inquiry.</h2>
          </div>

          <ol className="archive-index">
            {works.map((work, index) => (
              <li key={work.slug}>
                <span className="archive-index__number">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{work.title}</h3>
                  <p>{work.summary}</p>
                </div>
                <span className="archive-index__type">{work.stack[0]}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="blog-home__footer">
        <span>TAO / SYSTEMS LOG</span>
        <span>Built in public</span>
      </footer>
    </div>
  );
}
