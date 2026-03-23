const detailMarkdownTemplates = {
  minisql: `## 项目背景

MiniSQL 是数据库系统课程中的课程项目，目标是实现一个具备基础数据管理能力的小型数据库系统。

## 我的工作

- 参与系统整体框架设计
- 实现基础数据操作功能
- 支持条件查找与排序
- 实现索引加速能力

## 技术要点

- SQL 基础语义支持
- 数据存储与查询流程
- 索引优化

## 可继续补充

你可以在这里继续写：

- 系统架构图
- 模块划分
- 遇到的难点
- 你自己的贡献比例
- 性能优化结果


> 这里支持 Markdown 语法，可继续扩展成完整作品集介绍。`,
  opengl: `## 项目背景

这是计算机图形学课程中的小组项目，目标是将建模、渲染、碰撞检测与用户交互结合起来，完成一个可运行的图形学作品。

## 我的工作

- 参与游戏场景设计
- 实现物理引擎与碰撞检测
- 支持 OBJ 模型导入与贴图
- 实现交互和漫游体验

## 技术要点

- OpenGL 渲染流程
- 模型导入与贴图映射
- 场景交互与运动逻辑

## 可继续补充

你可以加入项目截图、功能演示、模块说明与技术难点。`,
  backend: `## 项目背景

线上医疗系统后端项目来自软件工程课程，目标是从 0 开始完成一个面向移动端应用的后端系统。

## 我的工作

- 负责数据库与服务端设计
- 使用 FastAPI 构建后端服务
- 设计并实现接口
- 参与系统联调

## 技术要点

- FastAPI
- API 设计
- 数据库建模
- 团队协作开发

## 可继续补充

建议在这里记录：

1. 接口设计示例
2. 数据库表结构
3. 项目分工
4. 实际遇到的问题与解决方式`,
  compiler: `## 项目背景

该项目来自编译原理课程，目标是实现一个支持基础算法执行的小型编译器系统。

## 我的工作

- 实现词法分析
- 实现语法分析
- 实现语义分析
- 完成中间代码生成与解释执行

## 技术要点

- Token 设计
- 语法树构建
- 语义检查
- 中间表示与解释器

## 可继续补充

你可以继续补充语法设计、样例程序、编译流程图与调试经验。`,
  verilog: `## 项目背景

该项目来自计算机组成课程，核心目标是使用 Verilog HDL 实现 CPU，并理解处理器执行过程。

## 我的工作

- 实现单周期 CPU
- 实现多周期 CPU
- 支持计分板功能

## 技术要点

- 数据通路设计
- 控制逻辑实现
- 指令执行流程
- Verilog HDL 硬件描述

## 可继续补充

后续可以继续加入状态图、模块图、指令支持情况和仿真结果。`,
  multimedia: `## 项目背景

该项目来自多媒体技术课程，目标是通过编程实践理解 JPEG 压缩算法的核心流程。

## 我的工作

- 实现 DCT 变换
- 实现下采样
- 实现 DPCM 差分预测

## 技术要点

- 图像压缩原理
- 频域变换
- 多媒体数据处理流程

## 可继续补充

建议补充实验效果、压缩前后对比和算法流程图。`,
  cgame: `## 项目背景

该项目来自 C 语言程序设计课程，目标是结合基础编程与图形界面能力，实现一个完整的小型游戏。

## 我的工作

- 实现多种玩法规则
- 支持不同力度击打
- 处理球体运动与碰撞检测

## 技术要点

- C 语言基础
- Graphics 图形界面
- 碰撞检测与运动逻辑

## 可继续补充

可以继续加入规则说明、界面展示与关键算法描述。`,
  security: `## 项目背景

该项目来自多媒体安全课程，围绕数字水印与隐写术相关算法展开实践。

## 我的工作

- 编程实现相关算法
- 对算法效率与效果进行分析

## 技术要点

- 数字水印
- 隐写术
- 多媒体安全基础

## 可继续补充

建议加入实验对比、评价指标与应用场景说明。`,
  ai: `## 项目背景

该项目来自人工智能课程，重点在于理解模型训练流程以及常见算法和工具链。

## 我的工作

- 学习基础模型与算法
- 使用 Python 库完成实践
- 接触 GPU 使用方式

## 技术要点

- 模型训练流程
- Python AI 工具链
- GPU 基础使用

## 可继续补充

后续可以加入训练任务、数据集、实验结果和心得总结。`,
};

export const projects = [
  {
    slug: 'minisql',
    title: 'MiniSQL 数据库系统',
    course: '数据库系统',
    featured: true,
    description: '组队实现 MiniSQL，完成插入、删除、修改、条件查找、排序与索引加速等功能。',
    tags: ['数据库', 'SQL', '系统设计'],
    listTags: ['SQL', '系统设计'],
    filters: ['SQL', 'C/C++'],
    detailMarkdown: detailMarkdownTemplates.minisql,
    sections: [
      {
        title: '项目概述',
        items: [
          '在数据库系统课程中，以小组形式实现一个 MiniSQL 数据库系统。',
          '项目围绕数据库基本框架设计展开，目标是完成一个具备基础数据管理能力的小型系统。',
          '整体工作覆盖数据操作、查询能力与性能优化。',
        ],
      },
      {
        title: '主要实现内容',
        items: ['支持基本插入、删除、修改操作。', '支持条件查找与排序功能。', '实现索引加速，提升查询效率。'],
      },
      {
        title: '项目收获',
        items: [
          '加深了对数据库系统基本结构和数据操作流程的理解。',
          '进一步理解了查询效率与索引设计之间的关系。',
          '提升了团队协作下的系统实现能力。',
        ],
      },
    ],
  },
  {
    slug: 'opengl-game',
    title: 'OpenGL 游戏设计与物理引擎',
    course: '计算机图形学',
    featured: false,
    description: '完成物理引擎、碰撞检测、OBJ 模型导入、贴图与交互漫游等功能。',
    tags: ['图形学', 'OpenGL', '游戏开发'],
    listTags: ['OpenGL', '游戏开发'],
    filters: ['C/C++', '图形学'],
    detailMarkdown: detailMarkdownTemplates.opengl,
    sections: [
      {
        title: '项目概述',
        items: [
          '在计算机图形学课程中，以小组形式完成游戏设计项目。',
          '项目目标是将图形学课程中的建模、渲染、交互与物理效果结合起来。',
          '最终形成一个可交互、可漫游的图形学项目。',
        ],
      },
      {
        title: '主要实现内容',
        items: ['实现物理引擎与碰撞检测。', '支持 OBJ 模型导入与贴图渲染。', '实现玩家交互与场景漫游功能。'],
      },
      {
        title: '项目收获',
        items: [
          '加深了对图形渲染流程与交互设计的理解。',
          '在实践中掌握了模型导入、贴图和碰撞处理等关键环节。',
          '提升了将课程理论落地为可视化项目的能力。',
        ],
      },
    ],
  },
  {
    slug: 'medical-backend',
    title: '线上医疗系统后端',
    course: '软件工程',
    featured: false,
    description: '负责数据库与服务端设计，使用 FastAPI 构建接口并完成后端实现。',
    tags: ['后端', 'FastAPI', '软件工程'],
    listTags: ['FastAPI', '后端'],
    filters: ['Python', 'SQL', '后端'],
    detailMarkdown: detailMarkdownTemplates.backend,
    sections: [
      {
        title: '项目概述',
        items: ['在软件工程课程中，合作完成线上医疗系统设计与开发。', '项目从 0 开始实现 Mobile App 配套系统。', '我主要负责后端设计与服务端实现。'],
      },
      {
        title: '主要实现内容',
        items: ['负责数据库与服务端架构设计。', '使用 FastAPI 搭建服务端。', '完成系统相关接口的实现与联调。'],
      },
      {
        title: '项目收获',
        items: ['积累了从需求到后端落地的完整工程实践经验。', '提升了 API 设计、服务组织和数据库配合的能力。', '进一步理解了团队协作中的模块分工与接口协同。'],
      },
    ],
  },
  {
    slug: 'c-reduce-compiler',
    title: 'C Reduce 编译器',
    course: '编译原理',
    featured: true,
    description: '完成词法分析、语法分析、语义分析、中间代码生成与解释执行。',
    tags: ['编译原理', '编译器', '解释执行'],
    listTags: ['编译器', '解释执行'],
    filters: ['C/C++', '编译器'],
    detailMarkdown: detailMarkdownTemplates.compiler,
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
  },
  {
    slug: 'verilog-cpu',
    title: 'Verilog CPU 设计',
    course: '计算机组成',
    featured: false,
    description: '实现单周期 CPU、多周期 CPU，并支持计分板功能。',
    tags: ['计算机组成', 'Verilog', 'CPU'],
    listTags: ['Verilog', 'CPU'],
    filters: ['Verilog'],
    detailMarkdown: detailMarkdownTemplates.verilog,
    sections: [
      {
        title: '项目概述',
        items: ['在计算机组成课程中，使用 Verilog HDL 完成 CPU 设计。', '项目围绕处理器结构实现展开，关注指令执行流程和硬件组织方式。', '涵盖单周期和多周期两类 CPU 设计。'],
      },
      {
        title: '主要实现内容',
        items: ['实现单周期 CPU。', '实现多周期 CPU。', '支持计分板功能。'],
      },
      {
        title: '项目收获',
        items: ['加深了对处理器执行过程与硬件模块协作的理解。', '通过 Verilog HDL 实践提升了硬件描述能力。', '对体系结构课程中的核心概念形成了更直观的认识。'],
      },
    ],
  },
  {
    slug: 'jpeg-compression',
    title: 'JPEG 压缩算法实现',
    course: '多媒体技术',
    featured: false,
    description: '实现 DCT 变换、下采样和 DPCM 差分预测等关键步骤。',
    tags: ['多媒体', 'JPEG', '算法实现'],
    listTags: ['JPEG', '算法实现'],
    filters: ['C/C++', '多媒体'],
    detailMarkdown: detailMarkdownTemplates.multimedia,
    sections: [
      {
        title: '项目概述',
        items: ['在多媒体技术课程中，实现 JPEG 压缩算法。', '项目重点在于理解图像压缩流程中的关键步骤和原理。', '通过编程实践完成从理论到算法实现的转化。'],
      },
      {
        title: '主要实现内容',
        items: ['实现 DCT 变换。', '实现下采样流程。', '实现 DPCM 差分预测等步骤。'],
      },
      {
        title: '项目收获',
        items: ['加深了对图像压缩原理和多媒体数据处理方式的理解。', '理解了经典压缩算法中各处理环节的作用。', '提升了将数学原理转化为程序实现的能力。'],
      },
    ],
  },
  {
    slug: 'billiards-game',
    title: 'C 语言台球游戏',
    course: 'C 语言程序设计',
    featured: false,
    description: '使用 Graphics 库实现三种不同规则的台球游戏，支持不同力度击打与碰撞检测。',
    tags: ['C语言', '图形界面', '碰撞检测'],
    listTags: ['C语言', '碰撞检测'],
    filters: ['C/C++', '图形学'],
    detailMarkdown: detailMarkdownTemplates.cgame,
    sections: [
      {
        title: '项目概述',
        items: ['在 C 语言程序设计课程中，使用 Graphics 库实现台球游戏。', '项目目标是将基础编程能力与图形界面交互结合起来。', '最终实现三种不同规则的台球玩法。'],
      },
      {
        title: '主要实现内容',
        items: ['实现三种不同规则的台球游戏模式。', '支持不同力度的击打效果。', '完成球体运动与碰撞检测逻辑。'],
      },
      {
        title: '项目收获',
        items: ['提升了 C 语言编程与图形界面处理能力。', '加深了对物理运动和碰撞逻辑的理解。', '积累了从基础语法到完整小型应用实现的经验。'],
      },
    ],
  },
  {
    slug: 'multimedia-security',
    title: '数字水印与隐写术实验',
    course: '多媒体安全',
    featured: false,
    description: '实现数字水印和隐写术相关算法，并分析算法效率。',
    tags: ['多媒体安全', '数字水印', '隐写术'],
    listTags: ['数字水印', '隐写术'],
    filters: ['Python', '多媒体'],
    detailMarkdown: detailMarkdownTemplates.security,
    sections: [
      {
        title: '项目概述',
        items: ['在多媒体安全课程中，围绕数字水印和隐写术展开算法实践。', '项目重点在于理解信息隐藏与版权保护相关方法。', '通过实验对算法效果与效率进行分析。'],
      },
      {
        title: '主要实现内容',
        items: ['编程实现数字水印相关算法。', '编程实现隐写术相关算法。', '从效率与效果角度进行对比分析。'],
      },
      {
        title: '项目收获',
        items: ['加深了对多媒体安全核心问题的理解。', '理解了信息隐藏与版权保护算法的应用场景。', '提升了算法实现与实验分析能力。'],
      },
    ],
  },
  {
    slug: 'ai-practice',
    title: '人工智能基础实践',
    course: '人工智能',
    featured: false,
    description: '学习人工智能模型训练过程，接触常见算法、Python 库与 GPU 使用方式。',
    tags: ['人工智能', 'Python', '模型训练'],
    listTags: ['Python', '模型训练'],
    filters: ['Python', '人工智能'],
    detailMarkdown: detailMarkdownTemplates.ai,
    sections: [
      {
        title: '项目概述',
        items: ['在人工智能课程中，围绕模型训练流程与基础算法展开学习与实践。', '项目关注人工智能基础模型和训练过程的理解。', '同时接触常见 Python 库与 GPU 的使用。'],
      },
      {
        title: '主要实现内容',
        items: ['学习人工智能领域基本算法和模型。', '实践使用 Python 库完成相关任务。', '了解 GPU 在训练过程中的基础使用方式。'],
      },
      {
        title: '项目收获',
        items: ['建立了对人工智能训练流程的整体认识。', '加深了对算法、模型与工程工具链之间关系的理解。', '为后续继续深入相关方向打下基础。'],
      },
    ],
  },
];

export const projectFilterOptions = ['全部', 'C/C++', 'Python', 'SQL', 'Verilog', '图形学', '后端', '编译器', '多媒体', '人工智能'];
