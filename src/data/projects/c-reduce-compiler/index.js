export default {
  order: 3,
  slug: 'c-reduce-compiler',
  title: 'C Reduce 编译器',
  course: '编译原理',
  featured: true,
  description: '完成词法分析、语法分析、语义分析、中间代码生成与解释执行。',
  repoUrl: 'https://github.com/Ceceliawai/minicompiler.git',
  tags: ['编译原理', '编译器', '解释执行'],
  listTags: ['编译器', '解释执行'],
  filters: ['C/C++', '编译器'],
  sections: [
    {
      title: '项目概述',
      items: ['在编译原理课程中，实现 C Reduce 语言编译器。', '项目覆盖从前端分析到中间表示再到执行的完整流程。', '目标是实现一个能够支持基础算法运行的小型编译系统。'],
    },
    {
      title: '主要实现内容',
      items: ['实现词法分析、语法分析与语义分析。', '完成中间代码生成。', '实现解释器执行，支持如快排等简单算法运行。'],
    },
    {
      title: '项目收获',
      items: ['系统梳理了编译器各阶段的输入输出关系。', '加深了对语法树、语义检查和中间表示的理解。', '提升了处理复杂模块链路的实现能力。'],
    },
  ],
};
