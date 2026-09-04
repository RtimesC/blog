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
status:
  - 已实现
  - 演示模拟
note: Scope or evidence note.
---
```

`state` must be one of `observing`, `building`, or `questioning`. The home-page navigation and article list are generated from this field.

Write the article below the second `---` using standard Markdown headings, paragraphs, ordered lists, unordered lists, emphasis, and links. The build stops with a clear error when required metadata is missing, a slug is invalid, or two articles use the same slug.

An article may also place one locally hosted MP4 between its header and body:

```yaml
video:
  src: /assets/project/video.mp4
  poster: /assets/project/video-poster.jpg
  label: Local delivery / 58 seconds
  caption: What the video shows and what it does not prove.
```

Video is optional. Keep factual boundaries in the visible label or caption; a concept film, simulation, or local demo must not be presented as field evidence.
