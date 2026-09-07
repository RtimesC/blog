import { parse as parseYaml } from 'yaml';

const articleSources = import.meta.glob('./articles/*.article.md', {
  eager: true,
  import: 'default',
  query: '?raw',
});

const frontMatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const publishedAtPattern = /^\d{4}-\d{2}-\d{2}$/;

function fail(path, message) {
  throw new Error(`Invalid article ${path}: ${message}`);
}

function requiredString(data, key, path) {
  if (typeof data[key] !== 'string' || !data[key].trim()) {
    fail(path, `front matter field "${key}" must be a non-empty string.`);
  }

  return data[key].trim();
}

function requiredStringList(data, key, path) {
  if (!Array.isArray(data[key]) || data[key].length === 0 || data[key].some((item) => typeof item !== 'string' || !item.trim())) {
    fail(path, `front matter field "${key}" must be a non-empty list of strings.`);
  }

  return data[key].map((item) => item.trim());
}

function requiredPublishedAt(data, path, key = 'publishedAt') {
  const value = requiredString(data, key, path);

  if (!publishedAtPattern.test(value)) {
    fail(path, `front matter field "${key}" must use YYYY-MM-DD.`);
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    fail(path, `front matter field "${key}" must be a real calendar date.`);
  }

  return value;
}

function optionalVideo(data, path) {
  if (data.video === undefined) {
    return null;
  }

  if (!data.video || Array.isArray(data.video) || typeof data.video !== 'object') {
    fail(path, 'front matter field "video" must be an object when provided.');
  }

  return Object.freeze({
    src: requiredString(data.video, 'src', path),
    poster: requiredString(data.video, 'poster', path),
  });
}

function parseReferences(data, path) {
  if (data.references === undefined) return Object.freeze([]);
  if (!Array.isArray(data.references)) {
    fail(path, '"references" must be a list (use [] when none are supplied).');
  }
  return Object.freeze(data.references.map((reference, index) => {
    if (!reference || typeof reference !== 'object' || Array.isArray(reference)) {
      fail(path, `reference ${index + 1} must be an object.`);
    }
    const text = requiredString(reference, 'text', path);
    const url = reference.url === undefined ? null : requiredString(reference, 'url', path);
    if (url && !/^https?:\/\//i.test(url)) fail(path, 'reference URLs must use http or https.');
    return Object.freeze({ text, url });
  }));
}

function parseArticle(path, source) {
  const match = source.match(frontMatterPattern);

  if (!match) {
    fail(path, 'expected YAML front matter enclosed by --- lines.');
  }

  const data = parseYaml(match[1]);

  if (!data || Array.isArray(data) || typeof data !== 'object') {
    fail(path, 'front matter must be a YAML object.');
  }

  const slug = requiredString(data, 'slug', path);
  const publishedAt = requiredPublishedAt(data, path);

  if (!slugPattern.test(slug)) {
    fail(path, '"slug" must use lowercase letters, numbers, and single hyphens.');
  }

  const revisedAt = data.revisedAt === undefined ? null : requiredPublishedAt(data, path, 'revisedAt');
  if (revisedAt && revisedAt < publishedAt) fail(path, 'revisedAt cannot precede publishedAt.');

  const body = match[2].trim();

  if (!body) {
    fail(path, 'article body cannot be empty.');
  }

  const references = parseReferences(data, path);
  for (const citation of body.matchAll(/\[\[(\d+)\]\]\(#ref-(\d+)\)/g)) {
    const number = Number(citation[2]);
    if (Number(citation[1]) !== number) fail(path, 'citation label must match its reference number.');
    if (number < 1 || number > references.length) fail(path, `citation #ref-${number} has no reference.`);
  }

  return Object.freeze({
    slug,
    publishedAt,
    revisedAt,
    activityAt: revisedAt || publishedAt,
    title: requiredString(data, 'title', path),
    authors: data.authors === undefined ? [] : requiredStringList(data, 'authors', path),
    keywords: requiredStringList(data, 'keywords', path),
    abstract: data.abstract === undefined ? '' : requiredString(data, 'abstract', path),
    cover: requiredString(data, 'cover', path),
    references,
    video: optionalVideo(data, path),
    body,
  });
}

export const articles = Object.freeze(
  Object.entries(articleSources)
    .map(([path, source]) => parseArticle(path, source))
    .sort((first, second) => second.activityAt.localeCompare(first.activityAt) || first.slug.localeCompare(second.slug)),
);

if (new Set(articles.map((article) => article.slug)).size !== articles.length) {
  throw new Error('Article slugs must be unique.');
}

export function getArticleBySlug(slug) {
  return articles.find((article) => article.slug === slug);
}
