const workStages = [
  {
    number: '01',
    title: 'Frame',
    outcome: 'One question and one boundary.',
    detail: 'State what is being explored, what is intentionally out of scope, and what would count as a useful result.'
  },
  {
    number: '02',
    title: 'Build',
    outcome: 'One small, visible change.',
    detail: 'Choose the smallest implementation that can be shown, interacted with, or measured without a large rewrite.'
  },
  {
    number: '03',
    title: 'Verify',
    outcome: 'Evidence before confidence.',
    detail: 'Run the relevant check, capture the result, and distinguish working behavior from an untested direction.'
  },
  {
    number: '04',
    title: 'Publish',
    outcome: 'A legible record of the decision.',
    detail: 'Commit the outcome, record the limits, and leave a clear next action for the following working session.'
  }
];

export default function App() {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <header className="border-b border-base-300 bg-base-100">
        <nav className="navbar mx-auto min-h-18 max-w-7xl px-5 sm:px-8" aria-label="Workbench navigation">
          <div className="navbar-start">
            <a className="text-sm font-semibold tracking-[-0.04em]" href="#top">TAO / WORKBENCH</a>
          </div>
          <div className="navbar-center hidden md:flex">
            <ul className="flex gap-6 text-xs text-base-content/60">
              <li><a className="hover:text-base-content" href="#workflow">Workflow</a></li>
              <li><a className="hover:text-base-content" href="#agreement">Agreement</a></li>
            </ul>
          </div>
          <div className="navbar-end">
            <span className="badge badge-success badge-outline badge-sm">Fresh workspace</span>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="hero border-b border-base-300 bg-base-100">
          <div className="hero-content grid w-full max-w-7xl grid-cols-1 gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)] lg:py-28">
            <div>
              <p className="mb-5 text-xs font-medium tracking-[0.16em] text-primary uppercase">A new working mode</p>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.065em] text-balance sm:text-7xl">
                Work in small, visible loops.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-base-content/65 sm:text-lg">
                This space begins with a question, builds one observable change, and only then records a conclusion.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <a className="btn btn-primary" href="#workflow">Start with the workflow <span aria-hidden="true">↓</span></a>
                <a className="btn btn-ghost" href="#agreement">Read the agreement</a>
              </div>
            </div>

            <aside className="card card-border bg-base-200 shadow-none">
              <div className="card-body gap-6">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-xs font-medium tracking-[0.14em] text-base-content/55 uppercase">Session zero</p>
                  <span className="badge badge-outline badge-sm">Open</span>
                </div>
                <div>
                  <h2 className="card-title text-2xl tracking-[-0.04em]">Define the next useful thing.</h2>
                  <p className="mt-3 leading-7 text-base-content/65">No inherited backlog, no decorative roadmap. Start from the work that can be made clear today.</p>
                </div>
                <div className="card-actions mt-auto justify-between border-t border-base-300 pt-5 text-xs text-base-content/55">
                  <span>STATE / UNDEFINED</span>
                  <span>MODE / FOCUSED</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24" id="workflow" aria-labelledby="workflow-heading">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] lg:gap-16">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">Working loop</p>
              <h2 className="mt-4 max-w-md text-4xl font-semibold tracking-[-0.055em] text-balance sm:text-5xl" id="workflow-heading">
                Clarity is a delivery condition.
              </h2>
              <p className="mt-5 max-w-sm leading-7 text-base-content/65">
                The sequence is deliberately small enough to use for a UI change, a technical experiment, or a written note.
              </p>
            </div>

            <div className="space-y-10">
              <ul className="steps steps-vertical w-full sm:steps-horizontal" aria-label="Working loop stages">
                {workStages.map((stage, index) => (
                  <li className={index === 0 ? 'step step-primary' : 'step'} data-content={stage.number} key={stage.number}>{stage.title}</li>
                ))}
              </ul>
              <div className="grid gap-3 sm:grid-cols-2">
                {workStages.map((stage) => (
                  <article className="card card-border bg-base-100 shadow-none" key={stage.number}>
                    <div className="card-body gap-4 p-6">
                      <span className="badge badge-outline w-fit font-mono">{stage.number}</span>
                      <div>
                        <h3 className="card-title text-xl tracking-[-0.04em]">{stage.title}</h3>
                        <p className="mt-2 font-medium leading-6">{stage.outcome}</p>
                        <p className="mt-2 text-sm leading-6 text-base-content/60">{stage.detail}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-base-300 bg-base-100" id="agreement" aria-labelledby="agreement-heading">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)]">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">Working agreement</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl" id="agreement-heading">What stays true.</h2>
            </div>
            <div className="grid gap-px overflow-hidden border border-base-300 bg-base-300 sm:grid-cols-3">
              <div className="bg-base-100 p-6">
                <span className="badge badge-outline badge-sm">01</span>
                <h3 className="mt-6 text-lg font-semibold tracking-[-0.035em]">Scope before polish</h3>
                <p className="mt-3 text-sm leading-6 text-base-content/65">Name the decision before opening a component library or a blank canvas.</p>
              </div>
              <div className="bg-base-100 p-6">
                <span className="badge badge-outline badge-sm">02</span>
                <h3 className="mt-6 text-lg font-semibold tracking-[-0.035em]">Evidence before claims</h3>
                <p className="mt-3 text-sm leading-6 text-base-content/65">Mark demonstrations, assumptions, and verified results as different states.</p>
              </div>
              <div className="bg-base-100 p-6">
                <span className="badge badge-outline badge-sm">03</span>
                <h3 className="mt-6 text-lg font-semibold tracking-[-0.035em]">Commit the outcome</h3>
                <p className="mt-3 text-sm leading-6 text-base-content/65">Leave the next session a small, concrete starting point rather than a vague ambition.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-xs text-base-content/50 sm:flex-row sm:justify-between sm:px-8">
        <span>TAO / WORKBENCH</span>
        <span>Fresh start · Tailwind CSS + daisyUI</span>
      </footer>
    </div>
  );
}
