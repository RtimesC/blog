# Sousuke's Blog

Astro 7 个人技术博客。内容聚焦**机器人与 SLAM、嵌入式 / FPV、深度学习笔记**，技术写作优先。

- **样式**：极简手写脚手架，非主题套用；明暗双主题（`data-theme` + localStorage，无闪烁）
- **部署**：Cloudflare Pages 静态输出（`dist/`，无需 adapter）

---

## 技术栈

| 功能 | 方案 |
|---|---|
| 框架 | Astro 7，静态输出 |
| 代码块（复制 / 行高亮 / 文件名） | Expressive Code |
| LaTeX 公式 | remark-math + rehype-katex |
| Mermaid 图 | 客户端渲染，按需加载，跟随主题重绘 |
| 页面过渡 | Astro `<ClientRouter />` (View Transitions) |
| 磁力微交互 | `Magnetic.astro` island，`prefers-reduced-motion` gated |
| 点击波纹 | `Ripple.astro`，Material 风格 |

---

## 目录结构

```
src/
├── categories.ts              # 4 个顶级分类的单一来源
├── content.config.ts          # 文章 frontmatter schema（zod）
├── content/posts/             # Markdown 文章
├── layouts/BaseLayout.astro   # 整站框架：head、导航、页脚、主题脚本
├── components/
│   ├── Magnetic.astro         # 磁力 island
│   ├── MermaidClient.astro    # Mermaid 客户端渲染
│   ├── Ripple.astro           # 点击波纹
│   └── ThemeToggle.astro      # 明暗切换
├── pages/
│   ├── index.astro            # 首页（文章列表）
│   ├── about.astro
│   ├── posts/[...slug].astro  # 文章详情页
│   ├── categories/
│   │   ├── index.astro        # /categories/ 分类总览
│   │   └── [category].astro   # /categories/<id>/ 按分类过滤
│   └── tags/
│       ├── index.astro        # /tags/ 标签云
│       └── [tag].astro        # /tags/<tag>/ 按标签过滤
└── styles/global.css          # CSS 变量、排版、间距
```

**改设计时对应的文件：**

| 要改什么 | 去哪里 |
|---|---|
| 配色 / 字体 / 正文宽度 / 间距 | `src/styles/global.css` 顶部变量 |
| 页头 / 导航 / 页脚 / 框架 | `src/layouts/BaseLayout.astro` |
| 首页文章列表排版 | `src/pages/index.astro` |
| 文章页标题 / 日期 / 标签结构 | `src/pages/posts/[...slug].astro` |
| 代码块配色 / 圆角 | `astro.config.mjs` → Expressive Code 配置 |
| 分类定义 | `src/categories.ts` |

---

## 内容分类

4 个互斥顶级分类（`src/categories.ts` 单一来源）：

| ID | 显示名 |
|---|---|
| `robotics-slam` | Robotics & SLAM |
| `deep-learning` | Deep Learning |
| `embedded-fpv` | Embedded & FPV |
| `notes` | Notes |

文章 frontmatter 必填 `category`（枚举值），可加自由格式 `tags[]`。URL 规则：`/posts/<slug>/`、`/categories/<id>/`、`/tags/<tag>/`。

---

## 写新文章

复制 `src/content/posts/ekf-slam-prediction-step.md`，改 frontmatter 和正文。

```yaml
---
title: "文章标题"
description: "一句话摘要"
pubDate: 2026-01-01
category: robotics-slam   # 必填，四选一
tags: [ekf, slam]         # 可选，自由格式
draft: false              # true 则不出现在列表和构建里
---
```

`draft: true` 的文章不进列表，不进构建。改 `content.config.ts`（schema）或 frontmatter 后需重启 dev server（不会热更新）。

---

## 常用命令

```bash
npm run dev      # 启动开发服务器，http://localhost:4321
npm run build    # 构建到 dist/
npm run preview  # 本地预览构建产物
```

> Astro 7 的 `astro dev` 是守护进程。用 `npx astro dev stop / status / logs` 控制，不是 Ctrl-C。

---

## 渲染管线（备忘）

```
.md 文章
 ├─ Frontmatter 校验（content.config.ts / zod）
 ├─ remarkMermaid 插件（astro.config.mjs）
 │   把 ```mermaid 改写成 <pre class="mermaid">，绕过 Expressive Code
 ├─ remark-math + rehype-katex（$...$ / $$...$$）
 ├─ Expressive Code（其余代码块：复制、高亮、文件名）
 └─ 浏览器端 MermaidClient.astro（渲染图，监听 theme-change 重绘）
```

View Transitions（`<ClientRouter />`）下三个脚本需特殊处理：主题在 `astro:after-swap` 重新应用、主题 toggle 监听代理到 `document`、Mermaid 在 `astro:page-load` 重绘。

---

## 已知小坑

- **npm allow-scripts 门禁**：原生依赖（esbuild、sharp、fsevents）安装脚本需 `npm approve-scripts <包名>`（已处理，见 `package.json` allowScripts）。
- **Astro 7 Markdown 弃用提示**：remark/rehype 插件方式有一条弃用警告，目前仍正常工作。
- **Mermaid 体积**：~500KB，已做按需加载，构建时的 ">500KB" 警告正常。

---

## 待办

- [ ] **确定正式域名** → 填进 `astro.config.mjs` 的 `site`（RSS / sitemap / OG 图片的前提）
- [ ] 部署到 Cloudflare Pages
- [ ] RSS + sitemap
- [ ] Pagefind 静态搜索
- [ ] Giscus 评论（GitHub Discussions）
- [ ] OG 图片自动生成
- [ ] About 页正文（目前是占位草稿）
