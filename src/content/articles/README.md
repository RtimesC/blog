# Article authoring

Create one `*.article.md` file per published card. The filename is only for people; the `slug` in the YAML front matter is the public URL at `/articles/<slug>`.

Required front matter:

```yaml
---
slug: lowercase-url-slug
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

Write the article below the second `---` using standard Markdown headings, paragraphs, ordered lists, unordered lists, emphasis, and links. The build stops with a clear error when required metadata is missing, a slug is invalid, or two articles use the same slug.
