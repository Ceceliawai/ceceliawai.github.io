# Cecelia 个人主页

这是一个基于 React + Vite 搭建的个人主页项目，用于展示个人简介、教育经历和项目作品集。

## 个人主页访问地址

- 线上地址：https://ceceliawai.github.io/
- 仓库地址：https://github.com/Ceceliawai/Ceceliawai.github.io

## 技术栈

- React
- Vite
- GitHub Pages
- GitHub Actions
- highlight.js

## 本地开发

```bash
npm install
npm run dev
```

## 项目结构

```text
src/
├─ App.jsx                    # 页面主体
├─ styles.css                 # 全局样式
└─ data/
   ├─ projects.js             # 项目聚合与筛选项配置
   └─ projects/
      └─ <slug>/
         ├─ index.js          # 项目基础信息
         ├─ detail.md         # 项目详情内容
         └─ image.png         # 项目配图（可选）
```

## 如何新增项目

### 1. 新建项目目录

在 `src/data/projects/` 下新增一个文件夹，目录名就是项目的唯一标识，例如：

```text
src/data/projects/my-new-project/
```

### 2. 新增 `index.js`

在该目录下创建 `index.js`，导出项目基础信息。可参考：

```js
export default {
  order: 6,
  slug: 'my-new-project',
  title: '项目名称',
  course: '项目分类 / 课程名',
  featured: true,
  description: '项目简介',
  repoUrl: 'https://github.com/xxx/xxx',
  tags: ['关键词1', '关键词2'],
  listTags: ['列表标签1', '列表标签2'],
  filters: ['Python', '人工智能'],
  sections: [
    {
      title: '项目概述',
      items: ['要点 1', '要点 2'],
    },
  ],
};
```

说明：
- `slug` 要与文件夹名称保持一致。
- `order` 越小越靠前。
- `featured: true` 会进入首页精选项目。
- `filters` 需要使用 `src/data/projects.js` 里已有的筛选项；如果要新增筛选分类，也要同步修改该文件里的 `projectFilterOptions`。

### 3. 新增 `detail.md`

在同目录下创建 `detail.md`，填写项目详情。支持：
- 标题：`#` / `##` / `###`
- 列表：`-`
- 代码块：```` ```language ````
- 图片：`![说明](./image.png)`
- 链接：`[标题](https://example.com)`

### 4. 添加项目图片（可选）

把图片直接放在当前项目目录下，例如：

```text
src/data/projects/my-new-project/cover.png
```

然后在 `detail.md` 中直接引用：

```md
![项目封面](./cover.png)
```

### 5. 启动并检查

本地运行：

```bash
npm run dev
```

确认以下内容正常：
- 首页精选项目是否展示正确
- 项目列表搜索 / 筛选是否正常
- 详情页 Markdown、代码高亮、图片展示是否正常

## 发布说明

项目推送到 `main` 分支后，会通过 GitHub Actions 自动部署到 GitHub Pages。
