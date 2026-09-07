# 本项目的 Git 速查

`main` 是已经验证、可以部署的网站基线。`origin` 是本项目唯一的日常远程仓库。这份文档只是帮助你回忆选择与命令的速查表，不替你决定改动范围、是否合并或何时发布。

## 先做选择

| 如果你要做的是 | 选择 |
| --- | --- |
| 发布一篇完成的文章，或修正已确认的文案、链接、图片 | 直接提交到 `main` |
| 改首页结构、文章规则、共享组件或全站样式 | 从 `main` 开一个短分支，再用 PR 合并 |
| 还没有想清楚产品或设计方向 | 先讨论或记录，不要急着建代码分支 |
| 拿不准 | 开短分支；它不会影响 `main` |

## 直接提交到 main

```bash
git switch main
git pull --ff-only origin main

# 修改后
npm run build
git add <具体文件>
git commit -m "content(文章名): 简短说明"
git push origin main
```

例如：发布一篇已经写完的 Markdown 文章，或修正文章中的错误链接。

## 用短分支和 PR

```bash
git switch main
git pull --ff-only origin main
git switch -c codex/<主题>

# 修改、检查后
git push -u origin HEAD
```

PR 默认选择 **Squash and merge**，让 `main` 上留下一个清楚的阶段性提交。合并后回到 `main`，删除已完成的短分支。

## 提交前与忘记时

```bash
git status                         # 我在哪个分支、改了什么
git diff                           # 具体改动
git log --graph --oneline --all    # 提交关系图
git diff origin/main...HEAD        # 当前分支相对 main 的全部改动
```

代码、内容系统或页面改动至少运行：

```bash
npm run lint
npm run build
git diff --check
```

页面改动还要在浏览器确认。已推送到 `main` 的错误用 `git revert <提交号>` 回退；不要对 `main` 使用 `git push --force`。
