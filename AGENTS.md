# 会话持久信息（供未来会话读取）

## GitHub 账号绑定状态（2026-08-14 配置）

- 账号：**Entropicmaker**（GitHub ID: 163517493，显示名 Linzii）
- 认证方式：`gh`（GitHub CLI）已通过 macOS 钥匙串登录本机，跨会话长期有效。
  权限范围：`repo`、`workflow`、`gist`、`read:org`（足以建仓库、推送代码、跑 Actions）。
- Git 凭据助手：已修正为 `!/Users/linzii/.local/bin/gh auth git-credential`，
  因此普通 `git push https://github.com/...` 也能自动取用钥匙串凭据，无需重新登录。
- 密钥位置：全部保存在 macOS 钥匙串（`~/.config/gh/hosts.yml` 仅存账户引用），
  **任何文件里都不存 token，也不要让用户把 token 粘贴进对话**。

## 已有远程仓库（建新仓库前先检查，避免重复）

- `Entropicmaker/Entropicmaker.github.io` — 个人知识博客（地理/遥感/GIS）
- `Entropicmaker/FJNU-GeoRepo` — 福建师大地理专业资料存档（fork）
- `Entropicmaker/git-demo` — 私有练习仓库

## 本工作区项目

- 名称：编程学习工具（CodeVision Lab）— 算法可视化 + 课程骨架
- 本地 git 仓库已有提交，**尚未关联任何远程仓库**（用户明确：暂不推送）。

## 上传代码的标准流程（未来会话直接照做）

```bash
# 确认登录状态（应为 Entropicmaker）
gh auth status

# 首次推送某项目：建私有仓库并推送（按用户当时意愿选 --private/--public）
gh repo create <repo-name> --private --source . --push

# 或对已有仓库：
git remote add origin https://github.com/Entropicmaker/<repo>.git
git push -u origin main

# 提交身份（未全局设置；推送前先问用户，默认推荐匿名邮箱）：
# git config user.name "Linzii"
# git config user.email "163517493+Entropicmaker@users.noreply.github.com"
```

## 注意事项

- 提交身份（user.name / user.email）尚未设置，第一次推送前与用户确认后设置。
- 用户偏好：默认建**私有**仓库；公开仓库需用户明确同意。
- 如果凭据失效（`gh auth status` 报未登录），引导用户自行运行 `gh auth login`
  （浏览器/设备码授权），不要把 token 发进对话。
