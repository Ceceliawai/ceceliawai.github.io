const projectModules = import.meta.glob('./projects/*/index.js', {
  eager: true,
  import: 'default',
});

const markdownModules = import.meta.glob('./projects/*/detail.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const projects = Object.values(projectModules)
  .map((project) => ({
    ...project,
    detailMarkdown: markdownModules[`./projects/${project.slug}/detail.md`] || '',
  }))
  .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));

export const projectFilterOptions = ['全部', 'C/C++', 'Python', 'SQL', 'Verilog', '图形学', '后端', '编译器', '多媒体', '人工智能'];
