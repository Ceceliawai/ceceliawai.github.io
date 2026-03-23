## 项目简介

**MyOpenClaw** 是一个基于 Python 构建的超轻量级个人 AI Agent 助手框架，聚焦个人使用场景下的可用性、可扩展性与低成本部署能力。

项目时间：**2025.12 — 2026.03**

## 项目描述

项目围绕 Agent Loop、工具调用、长期记忆、定时任务与多渠道接入实现完整闭环，支持 **CLI、Docker 与多实例部署**，能够满足个人 AI Agent 在本地运行、持续执行与多入口接入等需求。

## 核心实现

### 1. Agent 执行引擎

- 设计并实现核心 Agent 执行引擎
- 构建 `Context Builder`、`Session Manager` 与 `Tool Registry`
- 打通 **LLM 调用 → 工具执行 → 结果回写** 的迭代闭环
- 支持文件系统、Shell、Web Search / Web Fetch、消息通知、子 Agent 与 Cron 等工具编排

### 2. Provider / Channel 插件体系

- 搭建高扩展性的 Provider / Channel 插件体系
- 基于 `Registry + 自动发现` 机制解耦模型层与接入层
- 支持 **19 类 LLM Provider、11 个聊天渠道** 与 **MCP 协议扩展**
- 兼容 OpenAI、Anthropic、DeepSeek、OpenRouter 等生态，便于快速接入新模型与外部工具

### 3. 持久化会话与长期记忆

- 实现 `JSONL` 会话存储
- 设计 `MEMORY.md / HISTORY.md` 双层长期记忆机制
- 结合 Token 预算触发自动压缩，控制上下文成本
- 集成 Heartbeat 主动唤醒、Cron 定时任务与工作空间隔离机制

## 项目亮点

- 面向个人 AI Agent 场景，强调轻量化与完整闭环
- 兼顾本地使用体验、持续运行能力与后续扩展空间
- 从核心执行引擎、插件体系到记忆机制形成了一套可落地的 Agent 框架设计

## 项目收获

通过这个项目，我系统梳理了个人 AI Agent 框架从执行引擎、工具系统、长期记忆到多渠道接入的完整设计链路，也进一步提升了对 Agent 工程化、插件化架构和长期运行机制的理解。
