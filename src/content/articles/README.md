# Article authoring

Create one `*.article.md` file per published card. The filename is only for people; the `slug` in the YAML front matter is the public URL at `/articles/<slug>`.

Required front matter:

```yaml
---
slug: lowercase-url-slug
state: observing
order: 2
title: Visible card title
keywords:
  - First keyword
  - Second keyword
abstract: Short English summary for the reverse card face.
cover: /assets/cover-image.png
kicker: Year / context / scope
lede: Opening sentence for the article page.
---
```

`state` must be one of `observing`, `building`, or `questioning`. The home-page navigation and article list are generated from this field.

Write the article below the second `---` using standard Markdown headings, paragraphs, ordered lists, unordered lists, emphasis, and links. The build stops with a clear error when required metadata is missing, a slug is invalid, or two articles use the same slug.

Write factual status, implementation scope, simulation limits, uncertainty, and evidence boundaries as complete paragraphs in the article body. Do not place them in small-print header metadata, status labels, badges, disclaimer notes, or similar detached UI. These boundaries are part of the article's argument and must remain readable in the normal body flow.

An article may also place one locally hosted MP4 between its header and body:

```yaml
video:
  src: /assets/project/video.mp4
  poster: /assets/project/video-poster.jpg
```

Video is optional. Do not place delivery status, simulation limits, evidence boundaries, or disclaimer copy in a small caption below the media. Explain that context in the article's normal body paragraphs. A concept film, simulation, or local demo must not be presented as field evidence.
