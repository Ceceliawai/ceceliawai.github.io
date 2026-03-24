## 项目简介

**MyOpenClaw** 是一个基于 Python 实现的轻量级个人 AI Agent Runtime。相比“只封装一次模型调用”的聊天机器人，我更关心的是：如何把 LLM 变成一个可以**持续接收消息、调用工具、沉淀记忆、主动执行任务、支持多入口接入**的长期运行系统。

因此，这个项目的重点不是某一个单点能力，而是把一个 Agent 真正跑起来所需的几层基础设施串起来：

- **LLM Agent Loop**：让模型在多轮工具调用中持续迭代，直到任务完成
- **Context / Session / Tool 编排**：把 prompt 组织、会话持久化和工具注册拆成独立模块
- **Memory**：把在线上下文、长期事实和历史事件分层存储
- **Multi-Agent**：支持把复杂任务拆给后台子 Agent 执行
- **Skills**：通过 `SKILL.md` 机制按需扩展 Agent 能力
- **Heartbeat / Cron / Message Bus**：让 Agent 不只“被动回答”，也能“主动醒来”和“异步协作”

项目支持 **CLI、Docker、多聊天渠道、多实例部署**，既能作为个人工作流助手，也适合作为研究 Agent Runtime 机制的实验平台。

---

## 设计目标

我在设计 nanobot 时，主要关注下面几个问题：

1. **Agent 如何稳定地跑完一个长任务，而不是只输出一段文本？**
2. **上下文越来越长时，历史消息如何压缩，哪些信息应该长期保留？**
3. **当一个任务耗时较长时，是否可以拆给后台 Agent，主线程继续保持响应？**
4. **如何让 Agent 能通过文档化方式获得新能力，而不是每加一个能力都去改主 prompt？**
5. **如何把 Telegram / Discord / CLI 这类入口和核心 Agent 解耦？**
6. **如何支持定时任务和主动唤醒，让系统具备“持续运行”能力？**

整个项目实际上就是围绕这些问题，逐层补齐运行时能力。

---

## 整体架构

从代码结构看，nanobot 主要由以下几层组成：

### 1. 接入层：Channels

接入层负责和外部世界交互，比如 CLI、Telegram、Discord、Slack、WhatsApp、Feishu 等。

每个渠道都继承统一的 `BaseChannel` 接口，负责三件事：

- 连接平台并监听用户消息
- 把外部消息转成统一的 `InboundMessage`
- 把系统生成的 `OutboundMessage` 发回对应平台

这层的好处是：**平台协议、鉴权和消息格式变化，不会直接污染 Agent 核心逻辑**。

### 2. 解耦层：Message Bus

所有渠道不直接调用 Agent，而是统一把消息扔进 `MessageBus`：

- `inbound queue`：渠道 → Agent
- `outbound queue`：Agent → 渠道

这层把“消息接入”和“消息处理”解耦开了。对于 Agent Core 来说，它不需要知道消息来自 Telegram 还是 CLI；对于渠道层来说，它也不需要知道 Agent 内部是如何组织 prompt、如何调用工具的。

### 3. 核心运行时：AgentLoop

`AgentLoop` 是整个系统的核心调度器。它负责：

- 从总线消费输入消息
- 查找或创建 session
- 构造系统 prompt、历史消息、运行时上下文和技能摘要
- 调用 LLM
- 执行工具调用并回写结果
- 保存会话
- 触发记忆压缩
- 把最终结果重新投递到 outbound queue

### 4. 持久化与扩展层

这一层包括：

- `SessionManager`：会话 JSONL 持久化
- `MemoryStore / MemoryConsolidator`：长期记忆与自动压缩
- `SubagentManager`：后台子 Agent 执行
- `SkillsLoader`：技能发现、摘要构建与按需加载
- `CronService / HeartbeatService`：定时任务与主动唤醒

如果把 nanobot 看作一个最小可运行 Agent OS，这一层就是它的“长期状态”和“调度扩展能力”。

---

## Agent Loop：系统的主执行链路

我最核心的一部分工作，是把 Agent 的一次交互从“用户说一句、模型回一句”扩展为一个真正可迭代的执行循环。

### 一次请求的完整流程

可以把主链路概括为：

```text
Channel 收到消息
→ BaseChannel 校验权限并封装 InboundMessage
→ MessageBus.publish_inbound()
→ AgentLoop.consume_inbound()
→ SessionManager 加载会话
→ ContextBuilder 构造 prompt
→ LLM 调用
→ 若有 tool_calls，则执行工具并把结果回写 messages
→ 继续下一轮 LLM 调用
→ 生成最终回复
→ 保存 session
→ 触发 memory consolidation
→ MessageBus.publish_outbound()
→ ChannelManager 分发到目标渠道
```

### 为什么要做成循环，而不是一次调用？

因为一个真正可用的 Agent 经常不是“想一下就答”，而是：

- 先看文件
- 再执行 Shell
- 再搜索网页
- 再整理结果
- 还可能再去调用其他工具补充信息

因此 `AgentLoop` 里采用的是 **多轮 LLM + Tool Calling** 机制：

1. 先把当前上下文发给模型
2. 如果模型返回 `tool_calls`，就逐个执行工具
3. 把工具结果作为 `tool` message 再追加回消息序列
4. 再次请求模型
5. 直到模型不再请求工具，而是给出最终文本回复

### 这一层我特别处理了哪些稳定性问题？

为了让 loop 更适合长期运行，我额外补了几类运行时策略：

- **最大迭代次数限制**：避免模型陷入无限工具调用循环
- **tool hint / progress 输出**：在长任务中向前端持续报告当前进度
- **`<think>` 内容清洗**：兼容部分模型把思维链混在可见输出中的情况
- **超长工具结果截断**：避免单次工具输出把 session 污染得过大
- **错误响应不持久化**：避免异常输出进入历史上下文后反复诱发错误
- **运行时上下文注入**：把时间、channel、chat_id 等元信息注入用户消息前缀，保证模型具备当前环境感知

这里的目标很明确：**不是让模型“更聪明”，而是让 runtime “更稳”**。

---

## Context / Session / Tool 的拆分方式

为了避免核心循环过于臃肿，我把 Agent 的三类职责拆开了。

### 1. ContextBuilder：负责 prompt 组织

`ContextBuilder` 负责把这些内容拼成最终 system prompt：

- Agent 身份信息
- 当前运行平台与工作空间路径
- `AGENTS.md / SOUL.md / USER.md / TOOLS.md` 等 bootstrap 文件
- 长期记忆 `MEMORY.md`
- always-on 的 Skills
- 全量技能摘要（只放简介和位置）
- 当前对话的 runtime metadata（时间、channel、chat_id）

这样做的好处是：**prompt 的组织逻辑与 AgentLoop 的执行逻辑分离**，后续如果想换 bootstrap 文件、扩展上下文组成，都不需要重写主循环。

### 2. SessionManager：负责消息持久化

每个会话以 `channel:chat_id` 为 key，持久化到 `sessions/*.jsonl` 中。

这里我采用的是 **append-only** 设计：

- 每次新消息都直接追加
- 保留消息时间戳、角色、tool_call_id、tool_calls 等信息
- 不直接在原消息上做复杂改写

这样做一方面便于调试和追踪完整链路，另一方面也更适合后续做记忆归档和上下文裁剪。

### 3. ToolRegistry：负责能力注册

工具能力被统一注册到 `ToolRegistry`，核心默认工具包括：

- 文件系统读写 / 编辑 / 列目录
- Shell 执行
- Web Search / Web Fetch
- 消息发送
- 子 Agent Spawn
- Cron
- MCP 工具（按需连接）

这使得工具定义、参数 schema、执行逻辑都从 AgentLoop 中抽离出来，AgentLoop 只负责“调度”，不直接关心每个工具的细节。

---

## 记忆系统：在线上下文、长期事实、历史事件三层分离

我觉得这是这个项目里最像“Runtime”而不只是“聊天机器人”的部分。

### 1. Session：保留完整对话轨迹

会话文件保存的是**完整消息流**，包括 user / assistant / tool message。这样做保证了系统在需要时可以回看完整执行过程，而不只是保留一段摘要。

### 2. MEMORY.md：长期事实层

`memory/MEMORY.md` 里放的是应该长期记住、并且要直接进入 system prompt 的信息，例如：

- 用户偏好
- 项目背景
- 长期约束
- 与当前工作相关的重要事实

这部分是“事实记忆”。它的特点是稳定、可复用、适合直接参与后续推理。

### 3. HISTORY.md：历史事件层

`memory/HISTORY.md` 记录的是按时间追加的历史事件摘要，每条记录带有 `[YYYY-MM-DD HH:MM]` 时间戳。

这部分不会自动进入 prompt，而是作为**低成本、可检索的外部历史**存在。需要时可以用 grep 或文件工具搜索。

这相当于把“过去发生过什么”与“模型现在必须知道什么”区分开了。

### 4. 自动压缩机制是怎么工作的？

随着 session 不断增长，prompt token 会越来越大。如果所有历史都直接送给模型，成本和稳定性都会迅速恶化。

因此我实现了 `MemoryConsolidator`：

1. 估算当前 session 构造成 prompt 后的 token 数量
2. 一旦超过设定的 `context_window_tokens`，就开始归档旧消息
3. 归档时不随意截断，而是**优先按 user turn 边界切分**，避免只截到半段工具调用链
4. 把选中的消息块交给独立的 memory consolidation 流程
5. 由 LLM 必须调用 `save_memory` 这个虚拟工具，返回：
   - 一条写入 `HISTORY.md` 的事件摘要
   - 一份更新后的 `MEMORY.md`
6. 更新 `last_consolidated` 游标，让新 prompt 只包含未归档部分

这个设计解决的是一个很实际的问题：**让 Agent 的对话可以持续变长，但 prompt 不会无限膨胀**。

---

## 多 Agent 协作：把长任务拆给后台执行

除了单 Agent loop，我还实现了基础的多 Agent 协作能力。

### 核心思路

主 Agent 在遇到适合异步处理的任务时，可以调用 `spawn` 工具，把任务丢给 `SubagentManager`。子 Agent 会在后台独立运行，并在完成后把结果回传给主 Agent。

### 子 Agent 能做什么？

子 Agent 会获得一套较小但足够实用的工具集：

- 文件系统工具
- Shell
- Web Search / Web Fetch

但**不会再拥有 message 工具和 spawn 工具**。这意味着：

- 子 Agent 不能直接和用户对话
- 子 Agent 不能再无限递归地产生更多 Agent

这是一种很刻意的约束。目的不是限制能力，而是防止多 Agent 链路失控。

### 子 Agent 结果如何回到主会话？

子 Agent 完成任务后，不是直接返回给用户，而是会把结果封装成一条 `system` 类型消息，通过 `MessageBus.publish_inbound()` 回注到主系统。

随后主 Agent 会像处理普通消息一样处理这条系统消息：

- 读入当前会话历史
- 把子任务结果纳入上下文
- 重新组织成对用户更自然的最终表达

因此，从用户视角看，它不是“看到了后台线程日志”，而是“稍后收到了更自然的任务总结”。

这种机制实现的是：**后台执行与前台交互分离，主 Agent 负责最终统一对外表达**。

---

## Skills 机制：用 `SKILL.md` 扩展 Agent，而不是无限膨胀主 prompt

我很喜欢 nanobot 的 Skills 设计，因为它解决的是一个常见问题：

> Agent 的能力越来越多时，主 prompt 会越来越大，最终变得又贵又难维护。

### SkillsLoader 的做法

`SkillsLoader` 会同时扫描：

- 工作空间下的 `skills/{name}/SKILL.md`
- 内置 builtin skills 目录

然后收集每个 skill 的：

- `name`
- `description`
- `location`
- `metadata`
- 是否满足依赖（如缺少某些命令行工具或环境变量）

### 为什么要“渐进加载”？

我这里采用的不是“把所有 skill 全文都塞进 prompt”，而是三层加载：

1. **常驻元信息**：技能名、描述、路径
2. **按需正文**：用户需求触发后，再读取具体 `SKILL.md`
3. **再按需读取 references / scripts / assets**

这和现代软件中的 lazy loading 很像。这样做的收益有两个：

- 大幅节省 context window
- 让 skill 可以写得更工程化，而不是一股脑塞进 system prompt

### `SKILL.md` 是如何组织的？

从内置 skill 和 skill-creator 的设计可以看出，Skill 的核心规范是：

- frontmatter 提供 `name`、`description`、`metadata`
- markdown body 提供流程说明
- 复杂能力再拆到 `scripts/`、`references/`、`assets/`

这让 Skill 不只是“一段提示词”，而更像一个**可分发的 Agent 能力包**。

---

## Heartbeat：让 Agent 主动醒来检查任务

这是我觉得非常有意思、也很能体现“长期运行 Agent”思路的一部分。

很多 Agent 系统只能在“有人发消息”时工作。但现实里，个人助手类 Agent 往往还需要一种能力：**即使没有新消息，也要周期性醒来检查有没有该做的事**。

### Heartbeat 的工作机制

nanobot 中的 `HeartbeatService` 会以固定间隔运行，例如每 30 分钟一次。每次 tick 的过程不是直接执行任务，而是分两阶段：

#### Phase 1：决策阶段

1. 读取工作空间中的 `HEARTBEAT.md`
2. 调用 LLM，但不给它自由文本输出，而是要求它调用一个虚拟的 `heartbeat` 工具
3. `heartbeat` 工具只允许两种动作：
   - `skip`：当前没有需要执行的任务
   - `run`：发现了应该执行的活跃任务，并返回任务摘要 `tasks`

这一步的关键价值在于：**把“是否执行”从自由文本解析，变成结构化决策**，从而减少误判。

#### Phase 2：执行阶段

如果 Phase 1 返回的是 `run`，系统才会继续：

1. 把 `tasks` 作为一条新的任务指令
2. 调用 `agent.process_direct()` 走完整的 Agent Loop
3. 得到执行结果后，再通过 `on_notify` 回送到用户所在渠道

也就是说，Heartbeat 本身不是另一个完整 Agent，而是一个**外层调度器**：

- 它决定是否该唤醒主 Agent
- 真正执行任务的仍然是主 Agent Loop

### 为什么这套设计比“定时直接执行 prompt”更好？

因为它把“是否该做”和“具体怎么做”分开了：

- `HEARTBEAT.md` 更像任务池或巡检清单
- HeartbeatService 负责周期扫描和结构化判定
- AgentLoop 负责真正执行

这让系统更容易控制，也更容易排查“为什么这次没有执行 / 为什么这次被执行了”。

---

## Message Bus：系统解耦的关键

如果只看功能，Message Bus 好像只是两个异步队列；但从系统结构上看，它其实是整个 nanobot 解耦的中心。

### 总线中的两类消息

统一消息模型分成两类：

#### InboundMessage

表示“进入 Agent Core 的消息”，包括：

- `channel`
- `sender_id`
- `chat_id`
- `content`
- `media`
- `metadata`
- `session_key_override`

这意味着，无论消息来自 CLI、Discord 还是系统内部，只要能被转成 `InboundMessage`，AgentLoop 都可以统一处理。

#### OutboundMessage

表示“从 Agent Core 发出去的消息”，包括：

- `channel`
- `chat_id`
- `content`
- `reply_to`
- `media`
- `metadata`

### 总线具体是怎么流动的？

#### 1. 用户消息进入系统

外部渠道监听到消息后，会调用 `BaseChannel._handle_message()`：

- 先做 `allow_from` 权限校验
- 然后封装成 `InboundMessage`
- 再调用 `bus.publish_inbound(msg)` 推入 inbound queue

#### 2. AgentLoop 从 inbound queue 消费

`AgentLoop.run()` 会循环调用 `consume_inbound()`：

- 收到普通消息就创建处理任务 `_dispatch(msg)`
- 收到 `/stop` 就取消当前 session 下的活动任务与子 Agent
- 收到 `/restart` 就触发进程内重启

为了保证状态一致性，内部还用了 `_processing_lock` 来串行化核心处理流程；同时又把任务注册到 `_active_tasks`，让 `/stop` 能对正在执行的任务做取消。

#### 3. 处理完成后投递到 outbound queue

不论是：

- 主 Agent 的最终回复
- 中途 progress 提示
- tool hint 提示
- Heartbeat / Cron 触发后的消息
- 由 `message` 工具主动发送的结果

最终都会统一走 `bus.publish_outbound()`。

#### 4. ChannelManager 统一分发

`ChannelManager` 内部启动一个 `_dispatch_outbound()` 循环：

- 从 outbound queue 拉取消息
- 根据 `msg.channel` 找到对应渠道实例
- 过滤是否发送 progress / tool_hint
- 调用该渠道的 `send()` 方法真正发出去

因此，**Agent Core 完全不用关心 Discord 的 websocket 协议，也不用关心 Telegram 的 HTTP API**；它只需要把标准化消息丢给总线即可。

### 总线除了连接渠道，还有什么价值？

还有一个很重要的点：**系统内部模块之间也可以借这条总线通信**。

例如：

- 子 Agent 完成任务后，会把结果作为 system inbound message 回注
- Heartbeat / Cron 执行后，可以走 outbound message 回送给用户

这意味着总线不只是“聊天入口的适配器”，它也是**内部异步事件协作层**。

---

## Heartbeat、Cron、Bus 三者是如何配合的？

如果把 nanobot 看成一个长期运行的 Agent，Heartbeat、Cron、Bus 分别扮演不同角色：

- **Cron**：按时间点精确触发任务
- **Heartbeat**：周期性唤醒，检查开放式任务池
- **Bus**：把触发、执行和回送过程解耦

一个典型链路可以概括为：

```text
Heartbeat/Cron 触发
→ 调用 AgentLoop.process_direct()
→ 结果进入 outbound queue
→ ChannelManager 分发
→ 用户在聊天渠道收到回复
```

而对于子 Agent：

```text
主 Agent 调用 spawn
→ SubagentManager 后台执行
→ 完成后 publish_inbound(system message)
→ 主 Agent 再次处理
→ 统一生成对用户的最终回复
```

可以看到，bus 在这里承担的是“统一数据流入口/出口”的作用。

---

## 我认为这个项目的技术价值

对我来说，nanobot 的价值不只是“做了一个 AI 助手”，而是在工程上系统地回答了几个 Agent Runtime 问题：

1. **如何把 LLM 调用变成稳定的工具调用闭环**
2. **如何让会话长期增长但 prompt 不无限膨胀**
3. **如何把复杂任务拆给后台 Agent 并回收结果**
4. **如何用 Skill 机制把能力扩展和主上下文解耦**
5. **如何通过 Heartbeat / Cron 让 Agent 具备主动执行能力**
6. **如何通过 Message Bus 把渠道接入、核心推理和结果分发拆成独立层**

这些能力拼在一起后，nanobot 才真正从“模型壳子”变成了“可长期运行的个人 Agent Runtime”。

---

## 项目收获

这个项目让我对 Agent 系统的理解，从“prompt engineering”推进到了“runtime engineering”。

我不再只把 Agent 看作一次模型调用，而是把它看作一个要长期维护状态、调度工具、处理异步消息、控制上下文成本、支持多入口接入的运行时系统。

从这个角度说，nanobot 更像是我对“个人 AI Agent 基础设施应该如何设计”的一次完整实现。
