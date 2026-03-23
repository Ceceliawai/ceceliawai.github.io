export default {
  order: 3,
  slug: 'nanobot',
  title: 'MyOpenClaw--超轻量级个人 AI Agent 助手框架',
  course: '个人项目 · 2025.12 — 2026.03',
  featured: true,
  description: '基于 Python 构建轻量级个人 AI Agent 框架，围绕 Agent Loop、工具调用、长期记忆、定时任务与多渠道接入实现完整闭环，支持 CLI、Docker 与多实例部署。',
  tags: ['Python', 'AI Agent', '工具调用', '长期记忆'],
  listTags: ['Python', 'AI Agent', '长期记忆', '多渠道接入'],
  filters: ['Python', '人工智能'],
  sections: [
    {
      title: '项目概述',
      items: [
        '独立设计并实现超轻量级个人 AI Agent 助手框架，目标是搭建可用、可扩展的 Agent 基础设施。',
        '项目围绕 Agent Loop、工具调用、长期记忆、定时任务与多渠道接入构建完整运行闭环。',
        '整体支持 CLI、Docker 与多实例部署，兼顾本地使用体验与后续扩展能力。',
      ],
    },
    {
      title: '核心实现',
      items: [
        '设计并实现核心 Agent 执行引擎，构建 Context Builder、Session Manager 与 Tool Registry，打通 LLM 调用、工具执行、结果回写的迭代流程。',
        '支持文件系统、Shell、Web Search / Web Fetch、消息通知、子 Agent 与 Cron 等工具编排，提升任务自动化能力。',
        '基于 Registry + 自动发现机制搭建 Provider / Channel 插件体系，支持 19 类 LLM Provider、11 个聊天渠道以及 MCP 协议扩展。',
      ],
    },
    {
      title: '工程能力',
      items: [
        '实现 JSONL 会话存储 + MEMORY.md / HISTORY.md 双层长期记忆，并结合 Token 预算触发自动压缩。',
        '进一步集成 Heartbeat 主动唤醒、Cron 定时任务与工作空间隔离机制，增强系统可持续运行能力。',
        '兼容 OpenAI、Anthropic、DeepSeek、OpenRouter 等生态，便于快速接入新模型与外部工具。',
      ],
    },
  ],
};
