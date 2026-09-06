import { useEffect, useState } from 'react';

const normalizeTheme = (value) => ['light', 'dark'].includes(value) ? value : 'system';

function readTheme() {
  try {
    return normalizeTheme(window.localStorage.getItem('theme'));
  } catch {
    return 'system';
  }
}

export function useTheme() {
  const [theme, updateTheme] = useState(readTheme);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    function applyTheme() {
      const resolved = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
      document.documentElement.dataset.theme = resolved;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#212121' : '#e8e8e8');
    }
    applyTheme();
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [theme]);

  useEffect(() => {
    function syncTheme(event) {
      if (event.key === 'theme' || event.key === null) updateTheme(readTheme());
    }
    window.addEventListener('storage', syncTheme);
    return () => window.removeEventListener('storage', syncTheme);
  }, []);

  function setTheme(value) {
    const next = normalizeTheme(value);
    updateTheme(next);
    try {
      window.localStorage.setItem('theme', next);
    } catch {
      // Keep the selection usable for this session when storage is unavailable.
    }
  }

  return { theme, setTheme };
}
