import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/**
 * Turn ```mermaid fenced code blocks into <pre class="mermaid"> raw-HTML nodes
 * BEFORE Expressive Code sees them (EC only processes <code> elements, so this
 * lets mermaid.js render them on the client instead of styling them as code).
 */
function remarkMermaid() {
  const esc = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const walk = (node) => {
    if (!Array.isArray(node.children)) return;
    node.children = node.children.map((child) => {
      if (child.type === 'code' && child.lang === 'mermaid') {
        return { type: 'html', value: `<pre class="mermaid">${esc(child.value)}</pre>` };
      }
      walk(child);
      return child;
    });
  };
  return (tree) => walk(tree);
}

// https://astro.build/config
export default defineConfig({
  // TODO: replace with your production domain (used for RSS/sitemap/OG later).
  site: 'https://blog.example.com',
  integrations: [
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      // Match our manual <html data-theme="..."> toggle instead of the OS query.
      themeCssSelector: (theme) => `[data-theme="${theme.type}"]`,
      useDarkModeMediaQuery: false,
      styleOverrides: {
        borderRadius: '0.5rem',
        codeFontFamily: 'var(--font-mono)',
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkMath, remarkMermaid],
    rehypePlugins: [rehypeKatex],
  },
});
