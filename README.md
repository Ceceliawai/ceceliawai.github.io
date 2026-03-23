# 综合型个人网站（React + Vite）

这是一个适合部署到 GitHub Pages 的个人网站模板，包含：

- 首页 Hero
- 关于我
- 项目展示
- 博客预览
- 联系方式
- 深浅色主题
- GitHub Actions 自动部署

## 本地运行

```bash
npm install
npm run dev
```

## 打包预览

```bash
npm run build
npm run preview
```

## 部署到 GitHub Pages

1. 将本项目推送到 GitHub 仓库。
2. 仓库建议：
   - 用户主页仓库：`你的用户名.github.io`
   - 或普通仓库：例如 `my-site`
3. 打开 GitHub 仓库的 **Settings → Pages**。
4. 在 **Build and deployment** 中选择 **GitHub Actions**。
5. 推送到 `main` 分支后，`.github/workflows/deploy.yml` 会自动部署。

## 你最需要优先替换的内容

- `src/App.jsx` 中的个人简介
- 项目卡片内容
- 博客卡片内容
- 联系方式链接
- 网站标题与描述（`index.html`）
