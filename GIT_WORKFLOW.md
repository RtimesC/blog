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

## PR 合并后的收尾

在 GitHub 确认 PR 已合并后，按下面顺序操作。示例分支是 `style/change-ui-ux`，实际使用时换成这次完成的分支名。

```bash
git status                              # 有未提交改动时，先处理好再切换
git switch main
git pull --ff-only origin main          # 把 GitHub 合并后的内容同步到本地
git diff main style/change-ui-ux        # 核对两条分支的文件差异
```

`git switch` 只切换本地分支，不联网。它显示的 “up to date with origin/main” 只是与本地保存的远程记录一致；刚在 GitHub 合并后，仍需执行 `pull`。

`git diff` 没有输出，表示两条分支的文件内容完全一致。有输出也不一定是漏合并，可能是 `main` 又有新改动；看一下差异，确认这次工作已包含在 `main` 中即可。

确认后清理分支：

```bash
git push origin --delete style/change-ui-ux  # 删除 GitHub 上的分支
git fetch --prune origin                    # 清理本地保存的远程分支记录
git branch -d style/change-ui-ux             # 删除本地分支
git branch -avv                             # 看一眼最终状态
```

如果 GitHub 已自动删除远程分支，跳过第一条；提示远程分支不存在时，继续 `fetch --prune` 即可。`origin/style/change-ui-ux` 是本地保存的远程分支记录，不要用 `git branch -d origin/style/change-ui-ux` 删除 GitHub 分支。

Squash 合并会生成一个新提交，因此本地 `-d` 可能提示“未合并”。如果已确认 PR 合并、本地 `main` 已同步，且功能分支没有额外未合并的工作，可以改用：

```bash
git branch -D style/change-ui-ux
```

下一次工作从更新后的 `main` 新建短分支，不复用已完成的分支。

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
