# 博客系统说明文档

这份文档用于说明当前仓库里的博客模块实现、内容数据结构、可用组件、路由约定，以及后续和 AI 协作写博客时的上下文注入方式。

目标是让后续写 Agent 相关技术博客时，不需要每次重新解释项目结构；只要基于这份文档补充内容，我就可以快速接上。

## 1. 当前博客系统概览

博客系统已经具备以下能力：

- 首页有 `博客` 区块
- 顶部导航可跳转到博客区
- 有独立博客列表页：`#/blog`
- 有独立博客详情页：`#/blog/:slug`
- 列表页支持：
  - 分类筛选
  - 标签筛选
  - 搜索标题 / 摘要 / 正文内容
- 详情页支持：
  - 左侧章节导航
  - 图片放大预览
  - 代码高亮与复制
  - 标签点击回到博客列表筛选

当前博客不是 Markdown 自由渲染模式，而是：

**结构化内容数据 + 固定 block 组件模板**

也就是说，后续写博客时，我们更推荐把内容拆成正文、代码、图片、引用、提示框、对比表等 block，再交给页面渲染。

## 2. 相关文件位置

### 2.1 数据文件

当前博客数据集中在：

`src/data/blogs/`

它目前包含：

- `index.js`
  - 自动聚合所有博客并导出分类筛选项
- `<slug>/index.js`
  - 单篇博客的数据定义
- `blogs`
  - 博客列表数组
- `blogCategoryOptions`
  - 博客列表页顶部分类筛选项

推荐目录结构如下：

```text
src/
└─ data/
   └─ blogs/
      ├─ index.js
      └─ <slug>/
         ├─ index.js
         └─ assets/         # 可选，本篇博客自己的图片资源
```

### 2.2 页面与组件逻辑

博客相关页面与组件目前集中在：

`src/App.jsx`

主要模块如下：

- `BlogCard`
  - 首页博客卡片 / 列表页博客卡片
- `AllBlogsPage`
  - 博客列表页
- `BlogDetailPage`
  - 博客详情页
- `ArticleTextBlock`
  - 正文 block
- `ArticleCalloutBlock`
  - 提示框 block
- `ArticleListBlock`
  - 列表 block
- `ArticleCodeBlock`
  - 代码 block
- `ArticleImageBlock`
  - 图片 block
- `ArticleQuoteBlock`
  - 引用 block
- `ArticleCompareBlock`
  - 对比表 block

### 2.3 样式文件

博客样式主要集中在：

`src/styles.css`

包括：

- 博客卡片样式
- 博客列表页样式
- 博客详情页 hero 样式
- 左侧章节导航样式
- 各类 block 样式

## 3. 当前路由约定

### 3.1 首页博客区

- `#blog`

这是首页中的博客 section，用于概览展示。

### 3.2 博客列表页

- `#/blog`

支持 query 参数：

- `category`
- `tag`
- `q`

示例：

```text
#/blog?category=Agent&tag=Agent学习笔记&q=记忆系统
```

### 3.3 博客详情页

- `#/blog/:slug`

示例：

```text
#/blog/agent-learning-notes
```

### 3.4 系列首页与子页面

现在博客支持两种详情页形态：

- 普通文章页：直接渲染 `sections`
- 系列首页：只展示系列说明和子页面卡片

推荐结构：

- 系列首页：`#/blog/agent-learning-notes`
- 子页面：`#/blog/agent-architecture-basics`

子页面只要声明：

- `parentSlug: 'agent-learning-notes'`

它就会自动出现在系列首页中。

## 4. 博客数据结构

当前单篇博客的数据结构如下：

```js
{
  order: 1,
  slug: 'agent-learning-notes',
  eyebrow: 'AGENT LEARNING NOTES',
  title: 'Agent学习笔记',
  summary: '摘要',
  category: 'Agent',
  tags: ['Agent学习笔记', 'Agent'],
  updatedAt: '系列开篇',
  featured: true,
  sections: [
    {
      id: 'why-this-guide',
      title: '为什么先写这份说明',
      intro: '章节导语',
      blocks: [
        { type: 'text', paragraphs: ['...', '...'] },
      ],
    },
  ],
}
```

如果是系列首页，可以这样写：

```js
{
  slug: 'agent-learning-notes',
  type: 'series',
  title: 'Agent学习笔记',
  summary: '系列摘要',
  seriesIntro: [
    '这一页主要负责承接整个系列。',
    '每一章在这里先展示摘要卡片。',
  ],
  sections: [],
}
```

如果是系列下的子页面，可以这样写：

```js
{
  slug: 'agent-architecture-basics',
  parentSlug: 'agent-learning-notes',
  seriesOrder: 1,
  chapterLabel: '第一章',
  title: 'Agent架构基础',
  summary: '子页面摘要',
  sections: [],
}
```

### 4.1 顶层字段说明

- `order`
  - 博客排序字段，越小越靠前
- `slug`
  - 博客唯一标识，用于详情页路由
- `eyebrow`
  - 详情页顶部的小标题
- `title`
  - 博客标题
- `summary`
  - 摘要 / 导语
- `category`
  - 列表页分类筛选项
- `tags`
  - 标签，用于展示与筛选
- `updatedAt`
  - 更新时间展示
- `featured`
  - 是否显示在首页博客区
- `sections`
  - 章节数组
- `type`
  - 可选；当值为 `series` 时，这一页作为系列首页渲染
- `seriesIntro`
  - 可选；系列首页顶部的说明文案
- `parentSlug`
  - 可选；如果存在，表示这是一篇挂在某个系列首页下面的子文章
- `seriesOrder`
  - 可选；控制子文章在系列首页中的顺序
- `chapterLabel`
  - 可选；系列卡片上的章节名，比如“第一章”

### 4.2 section 字段说明

```js
{
  id: 'why-this-guide',
  title: '为什么先写这份说明',
  intro: '章节导语',
  blocks: [...]
}
```

- `id`
  - 章节唯一 id，用于左侧目录跳转
- `title`
  - 章节标题
- `intro`
  - 章节导语
- `blocks`
  - 章节中的内容块列表

## 5. 当前支持的 block 类型

### 5.1 `text`

用于正文段落。

```js
{
  type: 'text',
  paragraphs: [
    '第一段正文',
    '第二段正文',
  ],
}
```

### 5.2 `callout`

用于提示框、结论框、注意事项。

```js
{
  type: 'callout',
  tone: 'tip', // tip | note | warn
  title: '推荐方式',
  content: '这里是一段重点信息。',
}
```

### 5.3 `list`

用于结论拆点、步骤列表、知识点清单。

```js
{
  type: 'list',
  style: 'bullet', // bullet | ordered | check
  title: '第一版先支持这些',
  items: ['正文', '代码', '图片'],
}
```

### 5.4 `code`

用于代码、命令、配置片段。

```js
{
  type: 'code',
  language: 'python',
  caption: '代码块组件示例',
  code: 'print("hello")',
}
```

### 5.5 `image`

用于流程图、架构图、截图。

```js
{
  type: 'image',
  src: '/path/to/image.png',
  alt: '图片说明',
  caption: '图注',
}
```

### 5.6 `quote`

用于观点引用或一句话结论。

```js
{
  type: 'quote',
  text: '这是关键判断。',
  author: '来源或署名',
}
```

### 5.7 `compare`

用于两个方案、两个概念、两个版本的对比。

```js
{
  type: 'compare',
  title: '方案对比',
  columns: ['方案 A', '方案 B'],
  rows: [
    {
      label: '复杂度',
      values: ['低', '高'],
    },
  ],
}
```

## 6. 搜索与筛选规则

博客列表页目前支持：

- 分类筛选：基于 `category`
- 标签筛选：基于 `tags`
- 搜索：搜索以下内容
  - `title`
  - `summary`
  - `category`
  - `tags`
  - `sections[].title`
  - `sections[].intro`
  - `blocks` 中的文本内容

也就是说，只要正文、列表、代码说明、引用、对比项里出现了关键词，列表页都可以搜到。

## 7. 后续写 Agent 博客的推荐组织方式

Agent 相关内容很适合拆成一个系列，而不是全部塞进一篇。

推荐方式：

### 7.1 一篇文章解决一个问题

比如：

- `Agent 的长期记忆应该怎么设计`
- `Tool Calling 到底该怎么抽象`
- `为什么需要多 Agent，而不是一个超大 Prompt`
- `Agent Runtime 里的状态管理怎么拆`

### 7.2 一组文章形成一个专题

比如可以做一个 Agent 系列：

- `Agent 基础概念`
- `记忆系统`
- `工具调用`
- `规划与执行`
- `多 Agent 协作`
- `评测与回归`

### 7.3 一篇内多章节

如果某个主题本身足够大，可以继续在单篇博客里拆 section：

```text
1. 问题背景
2. 错误直觉
3. 我的设计
4. 关键实现
5. 边界与风险
6. 后续演进
```

### 7.4 多页面 + 多章节都可以

所以答案是：**可以同时支持“多页面”与“单页多章节”**。

建议原则：

- 主题够大：拆成多篇
- 单个主题内部结构复杂：拆成多章节

推荐落地方式：

1. 先建一个系列首页
2. 每个主题建成一篇独立子页面
3. 子页面里如果内容很多，再继续拆 `sections`

## 8. 之后如何给我注入上下文

后续你可以直接用下面这种格式给我内容，我会帮你整理成博客数据。

### 8.1 最小输入模板

```text
博客标题：
slug：
分类：
标签：
摘要：

我想表达的核心：

准备拆成的章节：
1.
2.
3.

我目前已有的内容碎片：
- 观点 1
- 代码片段
- 一个例子
- 一张图的意思
```

### 8.2 更自由的协作方式

你也可以直接这样说：

- “我们来写一篇 Agent 记忆系统的博客”
- “这一节先解释为什么不能只靠上下文窗口”
- “这里我想放一段 Python 伪代码”
- “这一块能不能做成对比表”
- “这部分拆成单独一篇更好”

我会根据这份文档，把内容补成：

- 新博客页面
- 某篇博客的新章节
- 某个章节下的新 block

## 9. 推荐的下一步

如果现在开始正式写 Agent 博客，建议先做这三步：

1. 确定系列名称  
   例如：`Agent学习笔记`

2. 确定第一篇标题  
   例如：`Agent 的长期记忆应该怎么设计`

3. 确定第一篇的章节骨架  
   比如：
   - 为什么这是一个问题
   - 常见误区
   - 分层记忆设计
   - 检索与压缩
   - 工程上的边界

这样我们后面就能直接开始往 `blogs` 里加第一篇正式文章。
