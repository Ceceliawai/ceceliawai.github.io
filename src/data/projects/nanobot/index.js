export default {
  order: 1,
  slug: 'nanobot',
  title: 'nanobot / MyOpenClaw —— 轻量级个人 AI Agent Runtime',
  course: 'Agent',
  featured: true,
  description: '基于 Python 实现个人 AI Agent Runtime，重点完成 LLM Agent Loop、分层记忆压缩、多 Agent 协作与 Skill 渐进加载机制，形成可扩展、可长期运行的智能体闭环。',
  tags: ['Python', 'AI Agent', 'LLM Loop', '长期记忆', '多 Agent', 'Skills'],
  listTags: ['LLM Loop', '长期记忆', '多 Agent', 'Skills'],
  filters: ['Python', 'Agent'],
  sections: [
    {
      title: '项目概述',
      items: [
        '独立实现超轻量级个人 AI Agent Runtime，希望把“能对话”的模型真正落成“能持续工作”的 Agent。',
        '整体设计不只关注模型调用，而是围绕 LLM 循环、上下文组织、记忆沉淀、子 Agent 分工与 Skill 扩展搭建完整运行时。',
        '系统支持 CLI、多聊天渠道、Docker 与多实例部署，既适合个人工作流，也方便继续做 Agent 能力实验。',
      ],
    },
    {
      title: 'LLM Loop 与上下文编排',
      items: [
        '实现 AgentLoop 主执行引擎：消息进入后先构建 system prompt + history + runtime context，再统一发起 LLM 调用，并在“模型输出 → 工具执行 → 结果回写”之间迭代闭环。',
        '将 ContextBuilder、ToolRegistry、SessionManager 解耦：一侧负责拼装身份/Bootstrap 文件/记忆/Skills 摘要，另一侧负责工具定义注册与会话持久化，降低核心 loop 的耦合度。',
        '在执行层补充最大迭代次数、tool hint 进度回传、think 内容清洗、超长工具结果截断等策略，提升长链路推理和工具调用的稳定性。',
      ],
    },
    {
      title: '记忆系统设计',
      items: [
        '设计 JSONL append-only 会话存储，保留完整消息轨迹；同时通过 last_consolidated 游标把“在线对话上下文”和“已归档历史”明确分层。',
        '实现 MEMORY.md + HISTORY.md 双层记忆：前者存放长期事实并直接进入 prompt，后者记录带时间戳的历史事件，便于 grep 式检索和低成本回忆。',
        '基于 Token 预算实现自动压缩：当上下文逼近窗口上限时，按 user-turn 边界抽取旧消息，交给独立 memory consolidator 总结并回写长期记忆，保证会话可持续增长。',
      ],
    },
    {
      title: '多 Agent 协作与 Skill 机制',
      items: [
        '实现 spawn 工具与 SubagentManager，把复杂任务拆给后台子 Agent 执行；子 Agent 复用文件、Shell、Web 等核心工具，但限制消息/再生成能力，避免协作链失控。',
        '子 Agent 完成任务后通过 system bus 回注主会话，由主 Agent 统一整理对用户回复，形成“后台执行 + 前台汇总”的协作模式。',
        '设计 SkillsLoader 与 SKILL.md 规范：通过 frontmatter 描述 name / description / metadata，在主上下文中只放技能摘要，真正需要时再按需读取全文，实现渐进加载与低 token 成本扩展。',
      ],
    },
  ],
};
