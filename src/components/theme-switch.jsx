const modes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Auto' },
];

function ThemeIcon({ mode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {mode === 'light' ? <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>
        : mode === 'dark' ? <path d="M20.3 14.5A8.5 8.5 0 0 1 9.5 3.7 8.5 8.5 0 1 0 20.3 14.5Z" />
          : <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /></>}
    </svg>
  );
}

function ThemeSwitch({ value, onChange }) {
  return (
    <div className="theme-control" role="group" aria-label="Appearance" data-mode={value}>
      <span className="theme-control__highlight" aria-hidden="true" />
      {modes.map((mode) => (
        <button key={mode.value} type="button" aria-pressed={value === mode.value} onClick={() => onChange(mode.value)} title={mode.value === 'system' ? 'Follow system appearance' : `${mode.label} appearance`}>
          <ThemeIcon mode={mode.value} />
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
}

export { ThemeSwitch };
