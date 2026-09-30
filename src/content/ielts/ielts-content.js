import { parse as parseYaml } from 'yaml';

const noteSources = import.meta.glob('./notes/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
});

const frontMatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

function parseIeltsNote(path, source) {
  const match = source.match(frontMatterPattern);
  if (!match) {
    throw new Error(`Invalid IELTS note ${path}: expected YAML front matter.`);
  }

  const data = parseYaml(match[1]) || {};
  const body = match[2].trim();

  return Object.freeze({
    slug: data.slug || path.replace(/^.*[\\/]/, '').replace(/\.md$/, ''),
    title: data.title || 'Untitled Note',
    module: data.module || 'reading',
    category: data.category || 'General',
    updatedAt: data.updatedAt ? String(data.updatedAt) : '',
    summary: data.summary || '',
    body,
  });
}

export const ieltsNotes = Object.freeze(
  Object.entries(noteSources)
    .map(([path, source]) => parseIeltsNote(path, source))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
);

export function getIeltsNoteBySlug(slug) {
  return ieltsNotes.find((note) => note.slug === slug);
}

export function getIeltsNotesByModule(module) {
  return ieltsNotes.filter((note) => note.module.toLowerCase() === module.toLowerCase());
}
