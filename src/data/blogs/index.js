const blogModules = import.meta.glob('./*/index.js', {
  eager: true,
  import: 'default',
});

export const blogs = Object.values(blogModules).sort(
  (left, right) => (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER),
);

export const blogCategoryOptions = ['全部', ...new Set(blogs.map((blog) => blog.category).filter(Boolean))];
