import { useEffect, useMemo, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import cpp from 'highlight.js/lib/languages/cpp';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import 'highlight.js/styles/vs2015.css';
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

function renderInlineMarkdown(text, keyPrefix = 'inline') {
  const parts = text
    .split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^\)]+\))/g)
    .filter(Boolean);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (/^`[^`]+`$/.test(part)) {
      return <code key={key}>{part.slice(1, -1)}</code>;
    }

    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      return (
        <a
          key={key}
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noreferrer' : undefined}
        >
          {label}
        </a>
      );
    }

    return <span key={key}>{part}</span>;
  });
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

function groupMarkdownBlocks(blocks) {
  const grouped = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];

    if (block.type !== 'image') {
      grouped.push(block);
      continue;
    }

    const images = [block];
    let pointer = index + 1;
    while (pointer < blocks.length && blocks[pointer].type === 'image') {
      images.push(blocks[pointer]);
      pointer += 1;
    }

    if (images.length >= 2) {
      grouped.push({ type: 'gallery', images });
      index = pointer - 1;
      continue;
    }

    grouped.push(block);
  }

  return grouped;
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

function MarkdownRenderer({ content, project }) {
  const [lightboxImage, setLightboxImage] = useState(null);
  const [copiedCodeKey, setCopiedCodeKey] = useState('');
  const [tocOpen, setTocOpen] = useState(false);
  const lines = content.split(/\r?\n/);
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const codeLines = [];
      const language = line.replace(/^```/, '').trim();
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ type: 'code', content: codeLines.join('\n'), language });
      continue;
    }

    if (/^####\s+/.test(line)) {
      blocks.push({ type: 'h4', content: line.replace(/^####\s+/, '') });
      index += 1;
      continue;
    }

    if (/^###\s+/.test(line)) {
      blocks.push({ type: 'h3', content: line.replace(/^###\s+/, '') });
      index += 1;
      continue;
    }

    if (/^##\s+/.test(line)) {
      blocks.push({ type: 'h2', content: line.replace(/^##\s+/, '') });
      index += 1;
      continue;
    }

    if (/^#\s+/.test(line)) {
      blocks.push({ type: 'h1', content: line.replace(/^#\s+/, '') });
      index += 1;
      continue;
    }

    if (/^>\s+/.test(line)) {
      const quoteLines = [];
      while (index < lines.length && /^>\s+/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^>\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'quote', content: quoteLines.join(' ') });
      continue;
    }

    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      const [, alt, src] = imageMatch;
      blocks.push({ type: 'image', alt, src: resolveProjectAsset(project, src.trim()) });
      index += 1;
      continue;
    }

    if (/^-\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^-\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^-\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    const paragraphLines = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(```|####\s+|###\s+|##\s+|#\s+|>\s+|-\s+|\d+\.\s+)/.test(lines[index])
    ) {
      paragraphLines.push(lines[index]);
      index += 1;
    }
    blocks.push({ type: 'p', content: paragraphLines.join(' ') });
  }

  const headingCounts = new Map();
  const blocksWithIds = blocks.map((block) => {
    if (!['h1', 'h2', 'h3', 'h4'].includes(block.type)) return block;

    const baseId = slugifyHeading(block.content);
    const count = headingCounts.get(baseId) || 0;
    headingCounts.set(baseId, count + 1);

    return {
      ...block,
      id: count === 0 ? baseId : `${baseId}-${count + 1}`,
      level: Number(block.type.slice(1)),
    };
  });

  const headings = blocksWithIds.filter((block) => ['h1', 'h2', 'h3', 'h4'].includes(block.type));
  const groupedBlocks = groupMarkdownBlocks(blocksWithIds);

  const renderImageFigure = (image, key, gallery = false) => (
    <figure key={key} className={gallery ? 'markdown-image-block markdown-gallery-item' : 'markdown-image-block'}>
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
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedCodeKey(key);
      window.setTimeout(() => {
        setCopiedCodeKey((current) => (current === key ? '' : current));
      }, 1800);
    } catch (error) {
      console.error('复制代码失败', error);
    }
  };

  const handleTocJump = (headingId) => {
    const element = document.getElementById(headingId);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTocOpen(false);
  };

  const renderHeading = (Tag, block, key) => (
    <Tag key={key} id={block.id} className="markdown-heading">
      <span>{renderInlineMarkdown(block.content, key)}</span>
      <button
        type="button"
        className="markdown-heading-anchor"
        onClick={() => handleTocJump(block.id)}
        aria-label={`跳转到 ${block.content}`}
        title="定位到该标题"
      >
        #
      </button>
    </Tag>
  );

  return (
    <div className="markdown-shell">
      {headings.length >= 2 ? (
        <div className={`markdown-toc-float${tocOpen ? ' open' : ''}`}>
          <button
            type="button"
            className="markdown-toc-toggle"
            onClick={() => setTocOpen((current) => !current)}
            aria-expanded={tocOpen}
            aria-label="切换目录"
          >
            <span>目录</span>
            <span className="markdown-toc-toggle-icon">{tocOpen ? '×' : '☰'}</span>
          </button>
          <nav className="markdown-toc-panel" aria-label="文章目录">
            <p className="markdown-toc-title">目录</p>
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
        </div>
      ) : null}

      <div className="markdown-content">
        {groupedBlocks.map((block, blockIndex) => {
          const key = `block-${blockIndex}`;

          if (block.type === 'h1') return renderHeading('h1', block, key);
          if (block.type === 'h2') return renderHeading('h2', block, key);
          if (block.type === 'h3') return renderHeading('h3', block, key);
          if (block.type === 'h4') return renderHeading('h4', block, key);
          if (block.type === 'p') return <p key={key}>{renderInlineMarkdown(block.content, key)}</p>;
          if (block.type === 'quote')
            return <blockquote key={key}>{renderInlineMarkdown(block.content, key)}</blockquote>;
          if (block.type === 'image') return renderImageFigure(block, key);
          if (block.type === 'gallery')
            return (
              <section key={key} className="markdown-gallery">
                {block.images.map((image, imageIndex) =>
                  renderImageFigure(image, `${key}-${imageIndex}`, true),
                )}
              </section>
            );
          if (block.type === 'code') {
            const highlighted = highlightCode(block.content, block.language);
            return (
              <div key={key} className="code-block-shell">
                <div className="code-block-toolbar">
                  <span className="code-block-dot red" />
                  <span className="code-block-dot yellow" />
                  <span className="code-block-dot green" />
                  <span className="code-block-language">
                    {highlighted.language || normalizeCodeLanguage(block.language) || 'code'}
                  </span>
                  <button
                    type="button"
                    className="code-copy-button"
                    onClick={() => handleCopyCode(block.content, key)}
                    aria-label="复制代码"
                  >
                    {copiedCodeKey === key ? '已复制' : '复制'}
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
          }
          if (block.type === 'ul')
            return (
              <ul key={key}>
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`}>{renderInlineMarkdown(item, `${key}-${itemIndex}`)}</li>
                ))}
              </ul>
            );
          if (block.type === 'ol')
            return (
              <ol key={key}>
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`}>{renderInlineMarkdown(item, `${key}-${itemIndex}`)}</li>
                ))}
              </ol>
            );
          return null;
        })}
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

function ProjectCard({ project }) {
  return (
    <a className="card project-card project-link-card" href={`#/project/${project.slug}`}>
      <div className="card-topline">
        <span className="dot" />
        <p>{project.course}</p>
      </div>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="chip-list">
        {project.tags.map((tag) => (
          <span key={tag} className="chip subtle">
            {tag}
          </span>
        ))}
      </div>
      <span className="text-link project-link-text">查看详情 →</span>
    </a>
  );
}

function ProjectTableRow({ project }) {
  return (
    <a className="project-table-row" href={`#/project/${project.slug}`}>
      <div className="project-table-cell project-table-title-cell">
        <strong>{project.title}</strong>
        <span>{project.course}</span>
      </div>
      <div className="project-table-cell project-table-desc-cell">{project.description}</div>
      <div className="project-table-cell project-table-tags-cell">
        <div className="project-table-tags">
          {project.tags.map((tag) => (
            <span key={tag} className="chip subtle">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
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
        <div className="chip-list detail-chip-list">
          {(project.listTags || project.tags).map((tag) => (
            <span key={tag} className="chip subtle">
              {tag}
            </span>
          ))}
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
    ...(project.listTags || []),
    ...(project.filters || []),
    project.detailMarkdown || '',
    ...(project.sections || []).flatMap((section) => [section.title, ...(section.items || [])]),
  ].join(' '));

  return searchableText.includes(normalizedQuery) || isSubsequenceMatch(searchableText, normalizedQuery);
}

function NotFoundPage() {
  return (
    <main className="detail-main">
      <section className="detail-hero-block card">
        <a href="#/projects" className="back-link">
          ← 返回全部项目
        </a>
        <h1>未找到该项目</h1>
        <p className="detail-summary">链接可能已失效，或该项目详情页尚未创建。</p>
      </section>
    </main>
  );
}

function AllProjectsPage({ projects }) {
  const [activeKeyword, setActiveKeyword] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesFilter = activeKeyword === '全部' || project.filters?.includes(activeKeyword);
      const matchesSearch = fuzzyMatchProject(project, searchQuery);
      return matchesFilter && matchesSearch;
    });
  }, [activeKeyword, projects, searchQuery]);

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
          </label>
        </div>
        <p className="detail-summary">可按编程语言和核心方向筛选查看全部项目，并支持模糊搜索。</p>

        <div className="filter-bar">
          {projectFilterOptions.map((keyword) => (
            <button
              key={keyword}
              type="button"
              className={`filter-chip ${activeKeyword === keyword ? 'active' : ''}`}
              onClick={() => setActiveKeyword(keyword)}
            >
              {keyword}
            </button>
          ))}
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
            filteredProjects.map((project) => <ProjectTableRow key={project.slug} project={project} />)
          ) : (
            <div className="project-table-empty">未找到匹配的项目。</div>
          )}
        </div>
      </section>
    </main>
  );
}

function HomePage({ featuredProjects }) {
  return (
    <main>
      <section className="hero" id="home">
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

      <section className="section" id="education">
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

      <section className="section" id="projects">
        <SectionTitle eyebrow="PROJECTS" title="项目实践" />

        <div className="card-grid">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>

        <div className="more-projects-row">
          <a className="button secondary" href="#/projects">
            更多项目
          </a>
        </div>
      </section>

      <section className="section contact-section" id="contact">
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

  const featuredProjects = useMemo(
    () => projects.filter((project) => project.featured).slice(0, 6),
    [],
  );
  const projectSlug = hash.startsWith('#/project/')
    ? decodeURIComponent(hash.replace('#/project/', ''))
    : null;
  const activeProject = projectSlug
    ? projects.find((project) => project.slug === projectSlug)
    : null;
  const isProjectDetail = hash.startsWith('#/project/');
  const isAllProjectsPage = hash === '#/projects';

  useEffect(() => {
    if (isProjectDetail || isAllProjectsPage) {
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
  }, [hash, isProjectDetail, isAllProjectsPage]);

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
        <AllProjectsPage projects={projects} />
      ) : (
        <HomePage featuredProjects={featuredProjects} />
      )}

      <footer className="footer">
        <p>© {year} Cecelia · Personal Website</p>
        <a href="#home">回到顶部 ↑</a>
      </footer>
    </div>
  );
}

export default App;
