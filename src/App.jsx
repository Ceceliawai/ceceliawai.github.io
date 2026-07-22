import { Children, cloneElement, isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import cpp from 'highlight.js/lib/languages/cpp';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/vs2015.css';
import { blogCategoryOptions, blogs } from './data/blogs/index.js';
import { projectFilterOptions, projects } from './data/projects';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('python', python);
hljs.registerLanguage('sql', sql);

const navigation = [
  { label: '首页', href: '#home' },
  { label: '教育经历', href: '#education' },
  { label: '项目', href: '#projects' },
  { label: '博客', href: '#blog' },
  { label: '联系', href: '#contact' },
];

const skills = ['C/C++', 'Python','LangGraph/Agent', 'SQL', 'Verilog HDL', 'FastAPI', 'OpenGL', 'Matlab', 'Bash'];

const educationList = [
  {
    period: '2024.9 - 2027.6',
    title: '浙江大学 · 硕士研究生在读',
    description: '研究生二年级，浙江大学脑机智能全国重点实验室，研究方向为非侵入式脑机接口。',
    bullets: ['浙江大学', '硕士研究生在读'],
  },
  {
    period: '2020.09 - 2024.06',
    title: '浙江大学 · 本科 · 计算机科学与技术',
    description: '系统学习计算机科学与技术核心课程，并完成多项课程项目实践。',
    bullets: ['数据结构与算法','数据库系统', '计算机图形学', '编译原理', '软件工程'],
  },
];

const honors = [
  '2022-2023 浙江大学三等奖学金',
  '2022-2023 优秀团员',
  '2022-2023 学业进步标兵',
  '2022-2023 学业优秀标兵',
  '第七期菁英计划优秀学员',
  '浙江大学 2024 届校级优秀毕业生',
];

const contactItems = [
  { label: '邮箱', value: 'chen_wu_@zju.edu.cn', href: 'mailto:chen_wu_@zju.edu.cn' },
  { label: 'GitHub', value: 'github.com/Ceceliawai', href: 'https://github.com/Ceceliawai' },
  { label: '学校', value: '浙江大学 · 杭州', href: '#education' },
];

function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} aria-label="切换明暗主题">
      <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
      <span>{theme === 'dark' ? '深色' : '浅色'}</span>
    </button>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

function resolveProjectAsset(project, assetPath) {
  if (!assetPath) return '';
  if (/^(https?:)?\/\//.test(assetPath) || assetPath.startsWith('/') || assetPath.startsWith('#')) {
    return assetPath;
  }

  const normalized = assetPath.replace(/^\.\//, '');
  return project?.detailAssets?.[normalized] || assetPath;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeCodeLanguage(language) {
  const normalized = String(language || '').trim().toLowerCase();
  const aliases = {
    c: 'cpp',
    'c++': 'cpp',
    cc: 'cpp',
    cpp: 'cpp',
    cxx: 'cpp',
    h: 'cpp',
    hpp: 'cpp',
    py: 'python',
    python: 'python',
    js: 'javascript',
    javascript: 'javascript',
    node: 'javascript',
    json: 'json',
    sh: 'bash',
    shell: 'bash',
    bash: 'bash',
    zsh: 'bash',
    sql: 'sql',
  };

  return aliases[normalized] || normalized;
}

function highlightCode(code, language) {
  const normalizedLanguage = normalizeCodeLanguage(language);

  if (normalizedLanguage && hljs.getLanguage(normalizedLanguage)) {
    return {
      language: normalizedLanguage,
      html: hljs.highlight(code, { language: normalizedLanguage }).value,
    };
  }

  try {
    const result = hljs.highlightAuto(code, ['cpp', 'python', 'javascript', 'json', 'bash', 'sql']);
    return {
      language: result.language || '',
      html: result.value,
    };
  } catch {
    return {
      language: '',
      html: escapeHtml(code),
    };
  }
}

async function copyTextToClipboard(text) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function getTopbarScrollOffset(extra = 20) {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return 112;

  const rect = topbar.getBoundingClientRect();
  const nextOffset = Math.ceil(rect.bottom + extra);
  return Number.isFinite(nextOffset) ? nextOffset : 112;
}

function slugifyHeading(text) {
  const plainText = String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[`*_~[\](){}<>]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return plainText || 'section';
}

function stripMarkdownSyntax(text) {
  return String(text || '')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTextContent(node) {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractTextContent).join('');
  }

  if (isValidElement(node)) {
    return extractTextContent(node.props.children);
  }

  return '';
}

function isWhitespaceNode(node) {
  return typeof node === 'string' && !node.trim();
}

function extractMarkdownHeadings(content) {
  const lines = String(content || '').split(/\r?\n/);
  const headings = [];
  const headingCounts = new Map();
  let inCodeBlock = false;

  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,4})\s+(.+?)\s*#*\s*$/);
    if (!match) continue;

    const level = match[1].length;
    const contentText = stripMarkdownSyntax(match[2]);
    const baseId = slugifyHeading(contentText);
    const count = headingCounts.get(baseId) || 0;
    headingCounts.set(baseId, count + 1);

    headings.push({
      level,
      content: contentText,
      id: count === 0 ? baseId : `${baseId}-${count + 1}`,
    });
  }

  return headings;
}

function MarkdownRenderer({ content, project }) {
  const [lightboxImage, setLightboxImage] = useState(null);
  const [copiedCodeKey, setCopiedCodeKey] = useState('');
  const headings = useMemo(() => extractMarkdownHeadings(content), [content]);
  const headingRefs = useRef(new Map());
  const [headingScrollOffset, setHeadingScrollOffset] = useState(112);

  const renderImageFigure = (image, key, gallery = false) => (
    <figure
      key={key}
      data-markdown-image="true"
      className={gallery ? 'markdown-image-block markdown-gallery-item' : 'markdown-image-block'}
    >
      <button
        type="button"
        className="markdown-image-button"
        onClick={() => setLightboxImage(image)}
        aria-label={`查看图片${image.alt ? `：${image.alt}` : ''}`}
      >
        <img src={image.src} alt={image.alt || '项目图片'} className="markdown-image" />
      </button>
      {image.alt ? <figcaption>{image.alt}</figcaption> : null}
    </figure>
  );

  const handleCopyCode = async (code, key) => {
    try {
      await copyTextToClipboard(code);
      setCopiedCodeKey(key);
      window.setTimeout(() => {
        setCopiedCodeKey((current) => (current === key ? '' : current));
      }, 1800);
    } catch (error) {
      console.error('复制代码失败', error);
    }
  };

  useEffect(() => {
    const updateHeadingScrollOffset = () => {
      setHeadingScrollOffset(getTopbarScrollOffset());
    };

    updateHeadingScrollOffset();
    window.addEventListener('resize', updateHeadingScrollOffset);

    return () => window.removeEventListener('resize', updateHeadingScrollOffset);
  }, []);

  const handleTocJump = (headingId) => {
    const element = headingRefs.current.get(headingId) || document.getElementById(headingId);
    if (!element) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const headingIdCounts = new Map();
  let renderedHeadingIndex = 0;
  const createHeadingRenderer = (Tag) =>
    function HeadingRenderer({ children }) {
      const headingText = stripMarkdownSyntax(extractTextContent(children));
      const matchedHeading = headings[renderedHeadingIndex];
      renderedHeadingIndex += 1;

      const baseId = slugifyHeading(headingText);
      const count = headingIdCounts.get(baseId) || 0;
      headingIdCounts.set(baseId, count + 1);
      const fallbackHeadingId = count === 0 ? baseId : `${baseId}-${count + 1}`;
      const headingId = matchedHeading?.id || fallbackHeadingId;

      return (
        <Tag
          id={headingId}
          ref={(node) => {
            if (node) {
              headingRefs.current.set(headingId, node);
            } else {
              headingRefs.current.delete(headingId);
            }
          }}
          className="markdown-heading"
          style={{ scrollMarginTop: `${headingScrollOffset}px` }}
        >
          <span>{children}</span>
          <button
            type="button"
            className="markdown-heading-anchor"
            onClick={() => handleTocJump(headingId)}
            aria-label={`跳转到 ${headingText}`}
            title="定位到该标题"
          >
            #
          </button>
        </Tag>
      );
    };

  const markdownComponents = {
    h1: createHeadingRenderer('h1'),
    h2: createHeadingRenderer('h2'),
    h3: createHeadingRenderer('h3'),
    h4: createHeadingRenderer('h4'),
    a: ({ href = '', children }) => {
      const isExternal = /^(https?:)?\/\//.test(href);
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noreferrer' : undefined}
        >
          {children}
        </a>
      );
    },
    p: ({ children }) => {
      const meaningfulChildren = Children.toArray(children).filter((child) => !isWhitespaceNode(child));
      const imageChildren = meaningfulChildren.filter(
        (child) => isValidElement(child) && child.props['data-markdown-image'] === 'true',
      );

      if (meaningfulChildren.length && imageChildren.length === meaningfulChildren.length) {
        if (imageChildren.length === 1) {
          return imageChildren[0];
        }

        return (
          <section className="markdown-gallery">
            {imageChildren.map((child, index) =>
              cloneElement(child, {
                key: child.key ?? `gallery-${index}`,
                className: `${child.props.className || ''} markdown-gallery-item`.trim(),
              }),
            )}
          </section>
        );
      }

      return <p>{children}</p>;
    },
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    hr: () => <hr className="markdown-divider" />,
    table: ({ children }) => (
      <div className="markdown-table-wrapper">
        <table>{children}</table>
      </div>
    ),
    pre: ({ children }) => <>{children}</>,
    code: ({ className, children, ...props }) => {
      const languageMatch = className?.match(/language-([^\s]+)/);

      if (!languageMatch) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      const rawCode = String(children || '').replace(/\n$/, '');
      const highlighted = highlightCode(rawCode, languageMatch[1]);
      const codeKey = `${highlighted.language || normalizeCodeLanguage(languageMatch[1] || 'code')}-${rawCode}`;

      return (
        <div className="code-block-shell">
          <div className="code-block-toolbar">
            <span className="code-block-dot red" />
            <span className="code-block-dot yellow" />
            <span className="code-block-dot green" />
            <span className="code-block-language">
              {highlighted.language || normalizeCodeLanguage(languageMatch[1]) || 'code'}
            </span>
            <button
              type="button"
              className="code-copy-button"
              onClick={() => handleCopyCode(rawCode, codeKey)}
              aria-label="复制代码"
            >
              {copiedCodeKey === codeKey ? '已复制' : '复制'}
            </button>
          </div>
          <pre>
            <code
              className={`hljs${highlighted.language ? ` language-${highlighted.language}` : ''}`}
              dangerouslySetInnerHTML={{ __html: highlighted.html }}
            />
          </pre>
        </div>
      );
    },
    img: ({ src = '', alt = '' }) =>
      renderImageFigure(
        {
          src: resolveProjectAsset(project, src),
          alt,
        },
        `${src}-${alt || 'image'}`,
      ),
    input: ({ type, checked, disabled }) => {
      if (type !== 'checkbox') {
        return <input type={type} checked={checked} disabled={disabled} readOnly />;
      }

      return (
        <input
          type="checkbox"
          className="markdown-task-checkbox"
          checked={Boolean(checked)}
          disabled
          readOnly
        />
      );
    },
  };

  return (
    <div className={`markdown-shell${headings.length >= 2 ? ' has-toc' : ''}`}>
      {headings.length >= 2 ? (
        <nav className="markdown-toc-card" aria-label="文章目录">
          <div className="markdown-toc-header">
            <p className="markdown-toc-title">目录</p>
            <span className="markdown-toc-meta">{headings.length} 个小节</span>
          </div>
          <ul className="markdown-toc-list">
            {headings.map((heading) => (
              <li key={heading.id} className={`level-${heading.level}`}>
                <button type="button" onClick={() => handleTocJump(heading.id)}>
                  {heading.content}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {content}
        </ReactMarkdown>
        {lightboxImage ? (
          <div
            className="image-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={lightboxImage.alt || '图片预览'}
            onClick={() => setLightboxImage(null)}
          >
            <button
              type="button"
              className="image-lightbox-close"
              onClick={() => setLightboxImage(null)}
              aria-label="关闭图片预览"
            >
              ×
            </button>
            <figure className="image-lightbox-content" onClick={(event) => event.stopPropagation()}>
              <img src={lightboxImage.src} alt={lightboxImage.alt || '项目图片'} className="image-lightbox-image" />
              {lightboxImage.alt ? <figcaption>{lightboxImage.alt}</figcaption> : null}
            </figure>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ProjectCard({ project, onTagClick }) {
  const detailHref = `#/project/${project.slug}`;

  return (
    <article className="card project-card project-card-shell">
      <div className="card-topline">
        <span className="dot" />
        <p>{project.course}</p>
      </div>
      <h3>
        <a className="project-card-title-link" href={detailHref}>
          {project.title}
        </a>
      </h3>
      <p>{project.description}</p>
      <ProjectTagList
        tags={getProjectDisplayTags(project)}
        onTagClick={onTagClick ? (tag) => onTagClick(project, tag) : undefined}
      />
      <a className="text-link project-link-text" href={detailHref}>
        查看详情 →
      </a>
    </article>
  );
}

function ProjectTableRow({ project, onTagClick }) {
  return (
    <article className="project-table-row">
      <div className="project-table-cell project-table-title-cell">
        <strong>
          <a className="project-table-title-link" href={`#/project/${project.slug}`}>
            {project.title}
          </a>
        </strong>
        <span>{project.course}</span>
      </div>
      <div className="project-table-cell project-table-desc-cell">{project.description}</div>
      <div className="project-table-cell project-table-tags-cell">
        <div className="project-table-tags">
          <ProjectTagList
            tags={getProjectDisplayTags(project)}
            compact
            onTagClick={onTagClick ? (tag) => onTagClick(project, tag) : undefined}
          />
        </div>
      </div>
    </article>
  );
}

function ProjectDetailPage({ project }) {
  return (
    <main className="detail-main">
      <section className="detail-hero-block card">
        <a href="#/projects" className="back-link">
          ← 返回全部项目
        </a>
        <p className="post-meta">{project.course}</p>
        <div className="detail-title-row">
          <h1>{project.title}</h1>
          {project.repoUrl ? (
            <a
              className="button secondary detail-repo-button"
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
          ) : null}
        </div>
        <p className="detail-summary">{project.description}</p>
        <div className="detail-chip-list">
          <ProjectTagList
            tags={getProjectDisplayTags(project)}
            onTagClick={(tag) => openProjectsWithSelection(getProjectTagSelection(project, tag))}
          />
        </div>
      </section>

      <section className="detail-sections">
        {project.sections.map((section) => (
          <article key={section.title} className="card detail-card">
            <p className="post-meta">SECTION</p>
            <h2>{section.title}</h2>
            <ul className="checklist">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      {project.detailMarkdown ? (
        <section className="markdown-section">
          <article className="card markdown-card">
            <p className="post-meta">MARKDOWN</p>
            <h2>详细介绍</h2>
            <MarkdownRenderer content={project.detailMarkdown} project={project} />
          </article>
        </section>
      ) : null}
    </main>
  );
}

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function isSubsequenceMatch(text, query) {
  if (!query) return true;
  let pointer = 0;
  for (const char of text) {
    if (char === query[pointer]) pointer += 1;
    if (pointer === query.length) return true;
  }
  return false;
}

function fuzzyMatchProject(project, query) {
  if (!query.trim()) return true;

  const normalizedQuery = normalizeSearchText(query);
  const searchableText = normalizeSearchText([
    project.title,
    project.course,
    project.description,
    ...(project.tags || []),
    ...(project.listTags || []).map((tag) => normalizeProjectTag(tag).label),
    ...(project.filters || []),
    project.detailMarkdown || '',
    ...(project.sections || []).flatMap((section) => [section.title, ...(section.items || [])]),
  ].join(' '));

  return searchableText.includes(normalizedQuery) || isSubsequenceMatch(searchableText, normalizedQuery);
}

function uniqueStrings(values) {
  return Array.from(
    new Set(
      (values || [])
        .map((value) => String(value || '').trim())
        .filter(Boolean),
    ),
  );
}

function normalizeProjectTag(tag) {
  if (typeof tag === 'string') {
    return {
      label: tag,
      show: true,
    };
  }

  return {
    label: String(tag?.label || tag?.name || tag?.value || '').trim(),
    show: tag?.show !== false,
  };
}

function getProjectDisplayTags(project, maxCount = 3) {
  const sourceTags = project.listTags?.length ? project.listTags : project.filters || [];
  const visibleTags = sourceTags
    .map(normalizeProjectTag)
    .filter((tag) => tag.label && tag.show)
    .map((tag) => tag.label);
  const normalizedTags = uniqueStrings(visibleTags);

  return normalizedTags.slice(0, maxCount);
}

function getProjectTagSelection(project, tag) {
  if (project.filters?.includes(tag) || projectFilterOptions.includes(tag)) {
    return { filterKeywords: [tag] };
  }

  return { tags: [tag] };
}

function ProjectTagList({ tags, onTagClick, compact = false }) {
  const uniqueTags = uniqueStrings(tags);

  return (
    <div className={`chip-list${compact ? ' compact' : ''}`}>
      {uniqueTags.map((tag) =>
        onTagClick ? (
          <button
            key={tag}
            type="button"
            className="chip subtle chip-button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onTagClick(tag);
            }}
          >
            {tag}
          </button>
        ) : (
          <span key={tag} className="chip subtle">
            {tag}
          </span>
        ),
      )}
    </div>
  );
}

function getBlogDisplayTags(blog, maxCount = 3) {
  return uniqueStrings(blog.tags || []).slice(0, maxCount);
}

function extractBlogSearchValues(block) {
  if (!block || typeof block !== 'object') return [];

  const values = [];

  for (const [key, value] of Object.entries(block)) {
    if (key === 'type') continue;
    if (typeof value === 'string') {
      values.push(value);
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === 'string') {
          values.push(item);
          return;
        }
        if (item && typeof item === 'object') {
          Object.values(item).forEach((nestedValue) => {
            if (typeof nestedValue === 'string') values.push(nestedValue);
            if (Array.isArray(nestedValue)) {
              nestedValue.forEach((arrayValue) => {
                if (typeof arrayValue === 'string') values.push(arrayValue);
              });
            }
          });
        }
      });
    }
  }

  return values;
}

function fuzzyMatchBlog(blog, query) {
  if (!query.trim()) return true;

  const normalizedQuery = normalizeSearchText(query);
  const searchableText = normalizeSearchText([
    blog.title,
    blog.summary,
    blog.category,
    ...(blog.tags || []),
    ...(blog.sections || []).flatMap((section) => [
      section.title,
      section.intro || '',
      ...(section.blocks || []).flatMap((block) => extractBlogSearchValues(block)),
    ]),
  ].join(' '));

  return searchableText.includes(normalizedQuery) || isSubsequenceMatch(searchableText, normalizedQuery);
}

function buildBlogHash({ categories = [], tags = [], query = '' } = {}) {
  const params = new URLSearchParams();
  uniqueStrings(categories).forEach((category) => params.append('category', category));
  uniqueStrings(tags).forEach((tag) => params.append('tag', tag));

  const normalizedQuery = String(query || '').trim();
  if (normalizedQuery) {
    params.set('q', normalizedQuery);
  }

  const queryString = params.toString();
  return queryString ? `#/blog?${queryString}` : '#/blog';
}

function openBlogsWithSelection(selection) {
  window.location.hash = buildBlogHash(selection);
}

function BlogCard({ blog, onTagClick, compact = false }) {
  const detailHref = `#/blog/${blog.slug}`;

  return (
    <article className="card note-card-shell project-card-shell">
      <p className="post-meta">{blog.category}</p>
      <h3>
        <a className="project-card-title-link" href={detailHref}>
          {blog.title}
        </a>
      </h3>
      <p>{blog.summary}</p>
      <div className="blog-card-meta">
        <span>{blog.updatedAt}</span>
      </div>
      <ProjectTagList
        tags={getBlogDisplayTags(blog, compact ? 4 : 3)}
        compact={compact}
        onTagClick={onTagClick ? (tag) => onTagClick(blog, tag) : undefined}
      />
      <a className="text-link project-link-text" href={detailHref}>
        查看博客 →
      </a>
    </article>
  );
}

function SeriesEntryCard({ entry, index }) {
  const detailHref = `#/blog/${entry.slug}`;
  const chapterLabel = entry.chapterLabel || `第 ${index + 1} 章`;

  return (
    <article className="card series-entry-card">
      <p className="post-meta">{chapterLabel}</p>
      <h3>
        <a className="project-card-title-link" href={detailHref}>
          {entry.title}
        </a>
      </h3>
      <p>{entry.summary}</p>
      <div className="blog-card-meta series-entry-meta">
        <span>{entry.updatedAt}</span>
      </div>
      <ProjectTagList tags={getBlogDisplayTags(entry, 4)} compact />
      <a className="text-link project-link-text" href={detailHref}>
        进入详情 →
      </a>
    </article>
  );
}

function ArticleTextBlock({ paragraphs = [] }) {
  return (
    <div className="article-block article-text-block">
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

function ArticleCalloutBlock({ tone = 'note', title, content }) {
  return (
    <article className={`article-block article-callout tone-${tone}`}>
      {title ? <p className="article-callout-title">{title}</p> : null}
      <p>{content}</p>
    </article>
  );
}

function ArticleListBlock({ title, items = [], style = 'bullet' }) {
  const ListTag = style === 'ordered' ? 'ol' : 'ul';

  return (
    <div className="article-block article-list-block">
      {title ? <p className="article-block-label">{title}</p> : null}
      <ListTag className={style === 'check' ? 'article-check-list' : 'article-plain-list'}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    </div>
  );
}

function ArticleCodeBlock({ language, code, caption }) {
  const [copied, setCopied] = useState(false);
  const normalizedLanguage = normalizeCodeLanguage(language || 'code');
  const highlighted = useMemo(() => highlightCode(code, normalizedLanguage), [code, normalizedLanguage]);

  const handleCopy = async () => {
    try {
      await copyTextToClipboard(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error('复制代码失败', error);
    }
  };

  return (
    <div className="article-block article-code-block">
      {caption ? <p className="article-block-label">{caption}</p> : null}
      <div className="code-block-shell">
        <div className="code-block-toolbar">
          <span className="code-block-dot red" />
          <span className="code-block-dot yellow" />
          <span className="code-block-dot green" />
          <span className="code-block-language">
            {highlighted.language || normalizedLanguage || 'code'}
          </span>
          <button type="button" className="code-copy-button" onClick={handleCopy} aria-label="复制代码">
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        <pre>
          <code
            className={`hljs${highlighted.language ? ` language-${highlighted.language}` : ''}`}
            dangerouslySetInnerHTML={{ __html: highlighted.html }}
          />
        </pre>
      </div>
    </div>
  );
}

function ArticleQuoteBlock({ text, author }) {
  return (
    <blockquote className="article-block article-quote-block">
      <p>{text}</p>
      {author ? <footer>{author}</footer> : null}
    </blockquote>
  );
}

function ArticleCompareBlock({ title, columns = [], rows = [] }) {
  return (
    <div className="article-block article-compare-block">
      {title ? <p className="article-block-label">{title}</p> : null}
      <div className="article-compare-table">
        <div className="article-compare-head article-compare-row">
          <div className="article-compare-cell label">维度</div>
          {columns.map((column) => (
            <div key={column} className="article-compare-cell">
              {column}
            </div>
          ))}
        </div>

        {rows.map((row) => (
          <div key={row.label} className="article-compare-row">
            <div className="article-compare-cell label">{row.label}</div>
            {row.values.map((value) => (
              <div key={`${row.label}-${value}`} className="article-compare-cell">
                {value}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ArticleImageBlock({ src, alt, caption, onOpen }) {
  return (
    <figure className="article-block article-image-block">
      <button
        type="button"
        className="article-image-button"
        onClick={() => onOpen({ src, alt, caption })}
        aria-label={alt ? `查看图片：${alt}` : '查看图片'}
      >
        <img src={src} alt={alt || caption || '文章图片'} className="article-image" />
      </button>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

function BlogDetailPage({ blog }) {
  const sections = blog.sections || [];
  const childBlogs = useMemo(
    () =>
      blogs
        .filter((candidate) => candidate.parentSlug === blog.slug)
        .sort(
          (left, right) =>
            (left.seriesOrder ?? left.order ?? Number.MAX_SAFE_INTEGER) -
            (right.seriesOrder ?? right.order ?? Number.MAX_SAFE_INTEGER),
        ),
    [blog.slug],
  );
  const isSeriesPage = blog.type === 'series';
  const hasSections = sections.length > 0;
  const [lightboxImage, setLightboxImage] = useState(null);
  const [sectionScrollOffset, setSectionScrollOffset] = useState(112);
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id || '');

  useEffect(() => {
    const updateOffset = () => {
      setSectionScrollOffset(getTopbarScrollOffset());
    };

    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, []);

  useEffect(() => {
    setActiveSectionId(sections[0]?.id || '');
  }, [blog.slug, sections]);

  useEffect(() => {
    if (!hasSections) return undefined;

    const sectionElements = sections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean);

    if (!sectionElements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visibleEntry?.target?.id) {
          setActiveSectionId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: `-${sectionScrollOffset}px 0px -50% 0px`,
        threshold: [0.2, 0.45, 0.72],
      },
    );

    sectionElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [hasSections, sections, sectionScrollOffset]);

  const handleSectionJump = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderBlock = (block, index) => {
    const key = `${block.type}-${index}`;

    switch (block.type) {
      case 'text':
        return <ArticleTextBlock key={key} paragraphs={block.paragraphs} />;
      case 'callout':
        return <ArticleCalloutBlock key={key} tone={block.tone} title={block.title} content={block.content} />;
      case 'list':
        return <ArticleListBlock key={key} title={block.title} items={block.items} style={block.style} />;
      case 'code':
        return <ArticleCodeBlock key={key} language={block.language} code={block.code} caption={block.caption} />;
      case 'image':
        return (
          <ArticleImageBlock
            key={key}
            src={block.src}
            alt={block.alt}
            caption={block.caption}
            onOpen={setLightboxImage}
          />
        );
      case 'quote':
        return <ArticleQuoteBlock key={key} text={block.text} author={block.author} />;
      case 'compare':
        return <ArticleCompareBlock key={key} title={block.title} columns={block.columns} rows={block.rows} />;
      default:
        return null;
    }
  };

  return (
    <main className="blog-detail-main">
      <section className="card blog-detail-hero">
        <a href="#/blog" className="back-link">
          ← 返回博客列表
        </a>
        <p className="post-meta">{blog.eyebrow}</p>
        <div className="detail-title-row blog-detail-title-row">
          <h1>{blog.title}</h1>
        </div>
        <p className="detail-summary">{blog.summary}</p>
        <div className="blog-detail-meta">
          <span>{blog.category}</span>
          <span>{blog.updatedAt}</span>
        </div>
        <ProjectTagList
          tags={getBlogDisplayTags(blog, 6)}
          onTagClick={(tag) => openBlogsWithSelection({ tags: [tag] })}
        />
      </section>

      <section className="blog-detail-layout">
        <aside className="card blog-detail-sidebar">
          <p className="post-meta">{isSeriesPage ? 'SERIES NAVIGATION' : 'ARTICLE STRUCTURE'}</p>
          <h3>{isSeriesPage ? '系列目录' : '章节导航'}</h3>
          <p>
            {isSeriesPage
              ? '系列首页负责承接整体方向，并把每一章拆成独立详情页。后面你只要继续新增子文章，就会自动出现在这里。'
              : '左侧先固定成章节目录。后面如果需要，也可以扩展成系列导航或相关文章入口。'}
          </p>

          {isSeriesPage ? (
            childBlogs.length ? (
              <div className="article-sidebar-nav">
                {childBlogs.map((entry, index) => (
                  <a key={entry.slug} className="article-sidebar-link" href={`#/blog/${entry.slug}`}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{entry.title}</strong>
                  </a>
                ))}
              </div>
            ) : (
              <div className="series-sidebar-empty">
                <p>当前还没有子页面。后面只要新建一篇带 `parentSlug` 的博客，它就会自动挂到这个系列下面。</p>
              </div>
            )
          ) : hasSections ? (
            <div className="article-sidebar-nav">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  className={`article-sidebar-link${activeSectionId === section.id ? ' active' : ''}`}
                  onClick={() => handleSectionJump(section.id)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{section.title}</strong>
                </button>
              ))}
            </div>
          ) : (
            <div className="series-sidebar-empty">
              <p>这篇文章的正文还没开始写。现在可以先保留摘要和入口，后面再一点点补章节内容。</p>
            </div>
          )}
        </aside>

        <div className="blog-detail-content">
          {isSeriesPage ? (
            <>
              <article className="card article-section-card">
                <p className="post-meta">SERIES OVERVIEW</p>
                <h2>系列首页</h2>
                <p className="article-section-intro">
                  这里适合放这个系列的学习路线、阅读建议，以及每一章的摘要入口。你后面只要继续补章节，
                  系列页就会逐步长成一个完整目录。
                </p>
                <div className="series-intro-block">
                  {(blog.seriesIntro || []).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>

              {childBlogs.length ? (
                <div className="series-entry-grid">
                  {childBlogs.map((entry, index) => (
                    <SeriesEntryCard key={entry.slug} entry={entry} index={index} />
                  ))}
                </div>
              ) : (
                <article className="card article-section-card article-empty-card">
                  <p className="post-meta">SERIES EMPTY</p>
                  <h2>还没有章节卡片</h2>
                  <p className="article-section-intro">
                    后面我们可以按“一个主题一篇详情页”的方式继续往下加。比如第一章是 Agent 架构基础，
                    第二章可以接记忆系统，第三章再写工具调用与规划执行。
                  </p>
                </article>
              )}
            </>
          ) : hasSections ? (
            sections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="card article-section-card"
                style={{ scrollMarginTop: `${sectionScrollOffset}px` }}
              >
                <p className="post-meta">SECTION</p>
                <h2>{section.title}</h2>
                {section.intro ? <p className="article-section-intro">{section.intro}</p> : null}
                <div className="article-section-blocks">
                  {(section.blocks || []).map((block, index) => renderBlock(block, index))}
                </div>
              </article>
            ))
          ) : (
            <article className="card article-section-card article-empty-card">
              <p className="post-meta">COMING SOON</p>
              <h2>这篇文章已经建好入口了</h2>
              <p className="article-section-intro">
                现在先保留标题和摘要，等你确认这章要讲什么，我们再把内容逐段补进来。
              </p>
            </article>
          )}
        </div>
      </section>

      {lightboxImage ? (
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightboxImage.alt || lightboxImage.caption || '图片预览'}
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            className="image-lightbox-close"
            onClick={() => setLightboxImage(null)}
            aria-label="关闭图片预览"
          >
            ×
          </button>
          <figure className="image-lightbox-content" onClick={(event) => event.stopPropagation()}>
            <img
              src={lightboxImage.src}
              alt={lightboxImage.alt || lightboxImage.caption || '文章图片'}
              className="image-lightbox-image"
            />
            {lightboxImage.caption ? <figcaption>{lightboxImage.caption}</figcaption> : null}
          </figure>
        </div>
      ) : null}
    </main>
  );
}

function AllBlogsPage({
  blogs,
  initialCategories = [],
  initialTags = [],
  initialQuery = '',
}) {
  const [activeCategories, setActiveCategories] = useState(() => uniqueStrings(initialCategories));
  const [activeTags, setActiveTags] = useState(() => uniqueStrings(initialTags));
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    setActiveCategories(uniqueStrings(initialCategories));
  }, [initialCategories]);

  useEffect(() => {
    setActiveTags(uniqueStrings(initialTags));
  }, [initialTags]);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  const toggleCategory = (category) => {
    if (category === '全部') {
      setActiveCategories([]);
      return;
    }

    setActiveCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  };

  const toggleTag = (tag) => {
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  const clearAllFilters = () => {
    setActiveCategories([]);
    setActiveTags([]);
    setSearchQuery('');
  };

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const blogTags = getBlogDisplayTags(blog, 20).map((tag) => normalizeSearchText(tag));
      const matchesCategory =
        activeCategories.length === 0 || activeCategories.includes(blog.category);
      const matchesTag =
        activeTags.length === 0 ||
        activeTags.every((tag) => blogTags.includes(normalizeSearchText(tag)));
      const matchesSearch = fuzzyMatchBlog(blog, searchQuery);
      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [activeCategories, activeTags, blogs, searchQuery]);

  const activeSelections = [
    ...activeCategories.map((value) => ({ type: 'category', value })),
    ...activeTags.map((value) => ({ type: 'tag', value })),
  ];

  return (
    <main className="detail-main">
      <section className="detail-hero-block card all-projects-hero">
        <a href="#blog" className="back-link">
          ← 返回首页博客
        </a>
        <p className="post-meta">ALL BLOGS</p>
        <div className="all-projects-title-row">
          <h1>全部博客</h1>
          <label className="search-box" aria-label="搜索博客">
            <span className="search-icon">⌕</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="搜索标题、标签、摘要或正文内容"
            />
            {searchQuery ? (
              <button
                type="button"
                className="search-clear-button"
                onClick={() => setSearchQuery('')}
                aria-label="清空搜索"
              >
                ×
              </button>
            ) : null}
          </label>
        </div>
        <p className="detail-summary">
          按主题筛选博客，也可以直接搜索标题、标签、摘要和正文中的关键词。
        </p>

        <div className="filter-bar">
          {blogCategoryOptions.map((category) => (
            <button
              key={category}
              type="button"
              className={`filter-chip ${
                category === '全部'
                  ? activeCategories.length === 0
                    ? 'active'
                    : ''
                  : activeCategories.includes(category)
                    ? 'active'
                    : ''
              }`}
              onClick={() => toggleCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="project-results-toolbar">
          <p className="project-results-meta">
            当前找到 <strong>{filteredBlogs.length}</strong> 篇博客
          </p>

          {activeSelections.length || searchQuery ? (
            <div className="active-filter-panel">
              <div className="active-filter-list">
                {activeSelections.map((selection) => (
                  <button
                    key={`${selection.type}-${selection.value}`}
                    type="button"
                    className="active-filter-chip"
                    onClick={() =>
                      selection.type === 'category'
                        ? setActiveCategories((current) =>
                            current.filter((item) => item !== selection.value),
                          )
                        : setActiveTags((current) =>
                            current.filter((item) => item !== selection.value),
                          )
                    }
                    aria-label={`移除筛选 ${selection.value}`}
                  >
                    <span>{selection.value}</span>
                    <span aria-hidden="true">×</span>
                  </button>
                ))}

                {searchQuery ? (
                  <button
                    type="button"
                    className="active-filter-chip search"
                    onClick={() => setSearchQuery('')}
                    aria-label="移除搜索关键词"
                  >
                    <span>搜索：{searchQuery}</span>
                    <span aria-hidden="true">×</span>
                  </button>
                ) : null}
              </div>

              <button type="button" className="filter-clear-all" onClick={clearAllFilters}>
                清空全部
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="blog-list-grid">
        {filteredBlogs.length ? (
          filteredBlogs.map((blog) => (
            <BlogCard
              key={blog.slug}
              blog={blog}
              onTagClick={(_, tag) => {
                toggleTag(tag);
              }}
            />
          ))
        ) : (
          <div className="project-table-empty blog-empty-card card">未找到匹配的博客。</div>
        )}
      </section>
    </main>
  );
}

function NotFoundPage({
  backHref = '#/projects',
  backLabel = '返回全部项目',
  title = '未找到该项目',
  summary = '链接可能已失效，或该项目详情页尚未创建。',
}) {
  return (
    <main className="detail-main">
      <section className="detail-hero-block card">
        <a href={backHref} className="back-link">
          ← {backLabel}
        </a>
        <h1>{title}</h1>
        <p className="detail-summary">{summary}</p>
      </section>
    </main>
  );
}

function AllProjectsPage({
  projects,
  initialFilters = [],
  initialTags = [],
  initialQuery = '',
}) {
  const [activeKeywords, setActiveKeywords] = useState(() => uniqueStrings(initialFilters));
  const [activeTags, setActiveTags] = useState(() => uniqueStrings(initialTags));
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    setActiveKeywords(uniqueStrings(initialFilters));
  }, [initialFilters]);

  useEffect(() => {
    setActiveTags(uniqueStrings(initialTags));
  }, [initialTags]);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  const toggleKeyword = (keyword) => {
    if (keyword === '全部') {
      setActiveKeywords([]);
      return;
    }

    setActiveKeywords((current) =>
      current.includes(keyword)
        ? current.filter((item) => item !== keyword)
        : [...current, keyword],
    );
  };

  const toggleTag = (tag) => {
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  const clearAllFilters = () => {
    setActiveKeywords([]);
    setActiveTags([]);
    setSearchQuery('');
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const projectTags = getProjectDisplayTags(project).map((tag) => normalizeSearchText(tag));
      const matchesFilter =
        activeKeywords.length === 0 ||
        activeKeywords.every((keyword) => project.filters?.includes(keyword));
      const matchesTag =
        activeTags.length === 0 ||
        activeTags.every((tag) => projectTags.includes(normalizeSearchText(tag)));
      const matchesSearch = fuzzyMatchProject(project, searchQuery);
      return matchesFilter && matchesTag && matchesSearch;
    });
  }, [activeKeywords, activeTags, projects, searchQuery]);

  const activeSelections = [
    ...activeKeywords.map((value) => ({ type: 'filter', value })),
    ...activeTags.map((value) => ({ type: 'tag', value })),
  ];

  return (
    <main className="detail-main">
      <section className="detail-hero-block card all-projects-hero">
        <a href="#projects" className="back-link">
          ← 返回首页项目
        </a>
        <p className="post-meta">ALL PROJECTS</p>
        <div className="all-projects-title-row">
          <h1>全部项目</h1>
          <label className="search-box" aria-label="搜索项目">
            <span className="search-icon">⌕</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="搜索标题、标签、描述或 Markdown 内容"
            />
            {searchQuery ? (
              <button
                type="button"
                className="search-clear-button"
                onClick={() => setSearchQuery('')}
                aria-label="清空搜索"
              >
                ×
              </button>
            ) : null}
          </label>
        </div>
        <p className="detail-summary">
          可按编程语言、方向与项目标签快速筛选，也支持搜索标题、描述和详情内容。
        </p>

        <div className="filter-bar">
          {projectFilterOptions.map((keyword) => (
            <button
              key={keyword}
              type="button"
              className={`filter-chip ${
                keyword === '全部'
                  ? activeKeywords.length === 0
                    ? 'active'
                    : ''
                  : activeKeywords.includes(keyword)
                    ? 'active'
                    : ''
              }`}
              onClick={() => toggleKeyword(keyword)}
            >
              {keyword}
            </button>
          ))}
        </div>

        <div className="project-results-toolbar">
          <p className="project-results-meta">
            当前找到 <strong>{filteredProjects.length}</strong> 个项目
          </p>

          {activeSelections.length || searchQuery ? (
            <div className="active-filter-panel">
              <div className="active-filter-list">
                {activeSelections.map((selection) => (
                  <button
                    key={`${selection.type}-${selection.value}`}
                    type="button"
                    className="active-filter-chip"
                    onClick={() =>
                      selection.type === 'filter'
                        ? setActiveKeywords((current) =>
                            current.filter((item) => item !== selection.value),
                          )
                        : setActiveTags((current) =>
                            current.filter((item) => item !== selection.value),
                          )
                    }
                    aria-label={`移除筛选 ${selection.value}`}
                  >
                    <span>{selection.value}</span>
                    <span aria-hidden="true">×</span>
                  </button>
                ))}

                {searchQuery ? (
                  <button
                    type="button"
                    className="active-filter-chip search"
                    onClick={() => setSearchQuery('')}
                    aria-label="移除搜索关键词"
                  >
                    <span>搜索：{searchQuery}</span>
                    <span aria-hidden="true">×</span>
                  </button>
                ) : null}
              </div>

              <button type="button" className="filter-clear-all" onClick={clearAllFilters}>
                清空全部
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="project-table-wrapper">
        <div className="project-table-header">
          <div className="project-table-head">项目名称</div>
          <div className="project-table-head">简要描述</div>
          <div className="project-table-head">关键词</div>
        </div>

        <div className="project-table-body">
          {filteredProjects.length ? (
            filteredProjects.map((project) => (
              <ProjectTableRow
                key={project.slug}
                project={project}
                onTagClick={(currentProject, tag) => {
                  const selection = getProjectTagSelection(currentProject, tag);
                  if (selection.filterKeywords?.[0]) {
                    toggleKeyword(selection.filterKeywords[0]);
                    return;
                  }

                  toggleTag(selection.tags?.[0] || tag);
                }}
              />
            ))
          ) : (
            <div className="project-table-empty">未找到匹配的项目。</div>
          )}
        </div>
      </section>
    </main>
  );
}

function HomePage({ featuredProjects, featuredBlogs }) {
  const [sectionTransition, setSectionTransition] = useState(null);
  const sectionSwitchLockRef = useRef(false);
  const sectionSwitchTimerRef = useRef(null);

  useEffect(() => {
    const sectionIds = ['home', 'education', 'projects', 'blog', 'contact'];
    const sectionAnchorOffset = 108;
    const sectionAnchorThreshold = 120;

    const switchSection = ({ currentId, targetSection, direction }) => {
      sectionSwitchLockRef.current = true;
      setSectionTransition({
        from: currentId,
        to: targetSection.id,
        direction,
      });
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (sectionSwitchTimerRef.current) {
        window.clearTimeout(sectionSwitchTimerRef.current);
      }

      sectionSwitchTimerRef.current = window.setTimeout(() => {
        sectionSwitchLockRef.current = false;
        setSectionTransition(null);
      }, 900);
    };

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) < 10) return;
      const sections = sectionIds
        .map((id, index) => {
          const element = document.getElementById(id);
          if (!element) return null;

          const rect = element.getBoundingClientRect();
          return {
            id,
            index,
            element,
            distanceToAnchor: Math.abs(rect.top - sectionAnchorOffset),
          };
        })
        .filter(Boolean)
        .sort((left, right) => left.distanceToAnchor - right.distanceToAnchor);

      const currentSection = sections.find(
        (section) => section.distanceToAnchor <= sectionAnchorThreshold,
      );
      if (!currentSection) return;

      if (sectionSwitchLockRef.current) {
        event.preventDefault();
        return;
      }

      const step = event.deltaY > 0 ? 1 : -1;
      const targetSection = sections.find((section) => section.index === currentSection.index + step);
      if (!targetSection) return;

      event.preventDefault();
      switchSection({
        currentId: currentSection.id,
        targetSection: targetSection.element,
        direction: step > 0 ? 'down' : 'up',
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (sectionSwitchTimerRef.current) {
        window.clearTimeout(sectionSwitchTimerRef.current);
      }
    };
  }, []);

  const getSectionTransitionClass = (sectionId) => {
    if (!sectionTransition) return '';
    if (sectionTransition.from === sectionId) {
      return `is-transition-from direction-${sectionTransition.direction}`;
    }
    if (sectionTransition.to === sectionId) {
      return `is-transition-to direction-${sectionTransition.direction}`;
    }
    return '';
  };

  const handleFeaturedTagClick = (project, tag) => {
    openProjectsWithSelection(getProjectTagSelection(project, tag));
  };
  const featuredBlogHref = featuredBlogs[0] ? `#/blog/${featuredBlogs[0].slug}` : '#/blog';

  return (
    <main className="home-main">
      <section
        className={`hero page-section page-section-hero ${getSectionTransitionClass('home')}`.trim()}
        id="home"
      >
        <div className="hero-copy">
          <span className="badge">浙江大学 · 计算机背景</span>
          <h1>
            <span>Cecelia</span>
            <span className="hero-subtitle">浙江大学硕士研究生在读</span>
          </h1>
          <p>
            目前为研究生二年级学生（三年制），本科毕业于浙江大学计算机科学与技术专业。
            学习与项目经历主要围绕数据库、图形学、编译原理、软件工程、计算机组成与多媒体技术等方向展开。
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#projects">
              项目经历
            </a>
            <a className="button secondary" href="#blog">
              博客
            </a>
            <a className="button secondary" href="#contact">
              联系方式
            </a>
          </div>
        </div>

        <aside className="hero-panel">
          <h3>技能</h3>
          <div className="chip-list">
            {skills.map((skill) => (
              <span key={skill} className="chip">
                {skill}
              </span>
            ))}
          </div>
        </aside>
      </section>

      <section
        className={`section page-section ${getSectionTransitionClass('education')}`.trim()}
        id="education"
      >
        <SectionTitle eyebrow="EDUCATION" title="教育经历与荣誉" />

        <div className="card-grid">
          {educationList.map((item) => (
            <article key={item.title} className="card">
              <p className="post-meta">{item.period}</p>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <ul className="checklist">
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}

          <article className="card">
            <p className="post-meta">HONORS</p>
            <h3>荣誉奖项</h3>
            <ul className="checklist">
              {honors.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section
        className={`section page-section ${getSectionTransitionClass('projects')}`.trim()}
        id="projects"
      >
        <SectionTitle eyebrow="PROJECTS" title="项目实践" />

        <div className="card-grid">
          {featuredProjects.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              onTagClick={handleFeaturedTagClick}
            />
          ))}
        </div>

        <div className="more-projects-row">
          <a className="button secondary" href="#/projects">
            更多项目
          </a>
        </div>
      </section>

      <section
        className={`section page-section ${getSectionTransitionClass('blog')}`.trim()}
        id="blog"
      >
        <SectionTitle
          eyebrow="NOTES"
          title="博客"
          description="从 Agent学习笔记开始，持续整理我对智能体、系统设计和工程实现的理解。"
        />

        <div className="card-grid">
          {featuredBlogs.map((blog) => (
            <BlogCard
              key={blog.slug}
              blog={blog}
              onTagClick={(_, tag) => openBlogsWithSelection({ tags: [tag] })}
            />
          ))}

          <article className="card note-plan-card">
            <p className="post-meta">IN PROGRESS</p>
            <h3>准备整理的方向</h3>
            <ul className="checklist">
              <li>数据库系统</li>
              <li>编译原理</li>
              <li>计算机网络 / 操作系统</li>
              <li>系统设计与工程实现</li>
              <li>Agent Runtime 与记忆系统</li>
            </ul>
          </article>

          <article className="card note-plan-card">
            <p className="post-meta">WRITING STYLE</p>
            <h3>系列入口</h3>
            <p>
              Agent学习笔记会先以系列入口承接整体方向，再按具体主题拆成多篇文章或多个章节，
              方便后续边讨论边补充。
            </p>
            <a className="button secondary note-preview-button" href={featuredBlogHref}>
              查看系列入口
            </a>
          </article>
        </div>

        <div className="more-projects-row">
          <a className="button secondary" href="#/blog">
            更多博客
          </a>
        </div>
      </section>

      <section
        className={`section page-section contact-section ${getSectionTransitionClass('contact')}`.trim()}
        id="contact"
      >
        <SectionTitle eyebrow="CONTACT" title="联系我" />

        <div className="contact-grid single-column">
          <article className="card contact-card">
            <h3>联系方式</h3>
            <div className="contact-list">
              {contactItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                >
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </a>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

function getCurrentHash() {
  return window.location.hash || '#home';
}

function parseHashLocation(hash) {
  const normalizedHash = hash || '#home';
  const [path, queryString = ''] = normalizedHash.split('?');

  return {
    path,
    params: new URLSearchParams(queryString),
  };
}

function parseHashListParam(params, key) {
  return uniqueStrings(params.getAll(key));
}

function buildProjectsHash({ filterKeywords = [], tags = [], query = '' } = {}) {
  const params = new URLSearchParams();
  uniqueStrings(filterKeywords).forEach((keyword) => params.append('filter', keyword));
  uniqueStrings(tags).forEach((tag) => params.append('tag', tag));

  const normalizedQuery = String(query || '').trim();
  if (normalizedQuery) {
    params.set('q', normalizedQuery);
  }

  const queryString = params.toString();
  return queryString ? `#/projects?${queryString}` : '#/projects';
}

function openProjectsWithSelection(selection) {
  window.location.hash = buildProjectsHash(selection);
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [hash, setHash] = useState(getCurrentHash);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const onHashChange = () => setHash(getCurrentHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const featuredProjects = useMemo(() => projects.filter((project) => project.featured).slice(0, 6), []);
  const featuredBlogs = useMemo(() => blogs.filter((blog) => blog.featured).slice(0, 2), []);
  const route = useMemo(() => parseHashLocation(hash), [hash]);
  const projectSlug = route.path.startsWith('#/project/')
    ? decodeURIComponent(route.path.replace('#/project/', ''))
    : null;
  const blogSlug = route.path.startsWith('#/blog/')
    ? decodeURIComponent(route.path.replace('#/blog/', ''))
    : null;
  const activeProject = projectSlug
    ? projects.find((project) => project.slug === projectSlug)
    : null;
  const activeBlog = blogSlug ? blogs.find((blog) => blog.slug === blogSlug) : null;
  const isProjectDetail = route.path.startsWith('#/project/');
  const isAllProjectsPage = route.path === '#/projects';
  const isAllBlogsPage = route.path === '#/blog';
  const isBlogDetailPage = route.path.startsWith('#/blog/');
  const initialProjectFilters = useMemo(
    () => parseHashListParam(route.params, 'filter'),
    [route],
  );
  const initialProjectTags = useMemo(
    () => parseHashListParam(route.params, 'tag'),
    [route],
  );
  const initialProjectQuery = useMemo(() => route.params.get('q') || '', [route]);
  const initialBlogCategories = useMemo(
    () => parseHashListParam(route.params, 'category'),
    [route],
  );
  const initialBlogTags = useMemo(
    () => parseHashListParam(route.params, 'tag'),
    [route],
  );
  const initialBlogQuery = useMemo(() => route.params.get('q') || '', [route]);

  useEffect(() => {
    if (isProjectDetail || isAllProjectsPage || isAllBlogsPage || isBlogDetailPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetId = hash.replace('#', '');
    if (!targetId) return;

    requestAnimationFrame(() => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, [hash, isProjectDetail, isAllProjectsPage, isAllBlogsPage, isBlogDetailPage]);

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="site-shell">
      <header className="topbar">
        <a href="#home" className="brand">
          <img src="/images/avatar.jpg" alt="Cecelia头像" className="brand-avatar" />
          <span>Cecelia · 个人网站</span>
        </a>

        <nav className="nav">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <ThemeToggle
          theme={theme}
          onToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        />
      </header>

      {isProjectDetail ? (
        activeProject ? (
          <ProjectDetailPage project={activeProject} />
        ) : (
          <NotFoundPage />
        )
      ) : isAllProjectsPage ? (
        <AllProjectsPage
          projects={projects}
          initialFilters={initialProjectFilters}
          initialTags={initialProjectTags}
          initialQuery={initialProjectQuery}
        />
      ) : isAllBlogsPage ? (
        <AllBlogsPage
          blogs={blogs}
          initialCategories={initialBlogCategories}
          initialTags={initialBlogTags}
          initialQuery={initialBlogQuery}
        />
      ) : isBlogDetailPage ? (
        activeBlog ? (
          <BlogDetailPage blog={activeBlog} />
        ) : (
          <NotFoundPage
            backHref="#/blog"
            backLabel="返回博客列表"
            title="未找到该博客"
            summary="链接可能已失效，或该博客详情页尚未创建。"
          />
        )
      ) : (
        <HomePage featuredProjects={featuredProjects} featuredBlogs={featuredBlogs} />
      )}

      <footer className="footer">
        <p>© {year} Cecelia · Personal Website</p>
        <a href="#home">回到顶部 ↑</a>
      </footer>
    </div>
  );
}

export default App;
