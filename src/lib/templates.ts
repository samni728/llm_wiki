export interface WikiTemplate {
  id: string
  name: string
  description: string
  icon: string
  schema: string
  purpose: string
  extraDirs: string[]
}

const BASE_SCHEMA_TYPES = `| entity | wiki/entities/ | Named things (people, tools, organizations, datasets) |
| concept | wiki/concepts/ | Ideas, techniques, phenomena, frameworks |
| source | wiki/sources/ | Papers, articles, talks, books, blog posts |
| query | wiki/queries/ | Open questions under active investigation |
| comparison | wiki/comparisons/ | Side-by-side analysis of related entities |
| synthesis | wiki/synthesis/ | Cross-cutting summaries and conclusions |
| overview | wiki/ | High-level project summary (one per project) |`

const BASE_NAMING = `- Files: \`kebab-case.md\`
- Entities: match official name where possible (e.g., \`openai.md\`, \`gpt-4.md\`)
- Concepts: descriptive noun phrases (e.g., \`chain-of-thought.md\`)
- Sources: \`author-year-slug.md\` (e.g., \`wei-2022-cot.md\`)
- Queries: question as slug (e.g., \`does-scale-improve-reasoning.md\`)`

const BASE_FRONTMATTER = `All pages must include YAML frontmatter:

\`\`\`yaml
---
type: entity | concept | source | query | comparison | synthesis | overview
title: Human-readable title
tags: []
related: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
\`\`\`

Source pages also include:
\`\`\`yaml
authors: []
year: YYYY
url: ""
venue: ""
\`\`\``

const BASE_INDEX_FORMAT = `\`wiki/index.md\` lists all pages grouped by type. Each entry:
\`\`\`
- [[page-slug]] — one-line description
\`\`\``

const BASE_LOG_FORMAT = `\`wiki/log.md\` records activity in reverse chronological order:
\`\`\`
## YYYY-MM-DD

- Action taken / finding noted
\`\`\``

const BASE_CROSSREF = `- Use \`[[page-slug]]\` syntax to link between wiki pages
- Every entity and concept should appear in \`wiki/index.md\`
- Queries link to the sources and concepts they draw on
- Synthesis pages cite all contributing sources via \`related:\``

const BASE_CONTRADICTION = `When sources contradict each other:
1. Note the contradiction in the relevant concept or entity page
2. Create or update a query page to track the open question
3. Link both sources from the query page
4. Resolve in a synthesis page once sufficient evidence exists`

const enterpriseTemplate: WikiTemplate = {
  id: "enterprise",
  name: "企业知识库",
  description: "适合公司内部资料、飞书群知识、OCR 单据和业务流程沉淀",
  icon: "🏢",
  extraDirs: [
    "wiki/business-domains",
    "wiki/processes",
    "wiki/policies",
    "wiki/customers",
    "wiki/orders",
    "wiki/finance",
    "wiki/warehouse",
    "wiki/decisions",
    "wiki/incidents",
  ],
  schema: `# 企业 Wiki Schema

## 使用目标

这个 Wiki 是企业内部知识库，不是个人笔记。所有页面都应服务于员工检索、业务复盘、流程传承、单据核对和跨部门协作。

## 页面类型

| 类型 | 目录 | 用途 |
|------|------|------|
| overview | wiki/ | 全局概览、知识库状态和关键索引 |
| business-domain | wiki/business-domains/ | 业务域，如销售、仓库、财务、客服、采购 |
| process | wiki/processes/ | 标准流程、操作步骤、异常处理 |
| policy | wiki/policies/ | 规则、制度、口径、权限边界 |
| customer | wiki/customers/ | 客户、供应商、合作方上下文 |
| order | wiki/orders/ | 订单、发货、入库、对账、售后相关资料 |
| finance | wiki/finance/ | 金额、付款、发票、报销、对账线索 |
| warehouse | wiki/warehouse/ | 仓储、库存、物流、签收、异常件 |
| decision | wiki/decisions/ | 管理决策、业务口径变更和原因 |
| incident | wiki/incidents/ | 事故、异常、投诉、复盘和改进 |
| source | wiki/sources/ | 原始资料摘要，保留来源可追溯 |
| query | wiki/queries/ | 尚未确认的问题、待补资料、待人工复核项 |
| synthesis | wiki/synthesis/ | 跨资料归纳、阶段总结、管理复盘 |

## 命名规范

- 文件名使用 \`kebab-case.md\`。
- 客户/供应商页面优先使用正式名称或稳定简称。
- 单据和订单页面优先包含日期、客户、单号或业务对象。
- 流程页面使用动词短语，例如 \`warehouse-return-process.md\`。
- 决策页面使用 \`YYYY-MM-DD-slug.md\`。

## Frontmatter

所有页面必须包含：

\`\`\`yaml
---
type: overview | business-domain | process | policy | customer | order | finance | warehouse | decision | incident | source | query | synthesis
title: 页面标题
business_domain: general
sensitivity: normal
owners: []
source_refs: []
tags: []
related: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
\`\`\`

单据、财务、仓储类页面应额外保留：

\`\`\`yaml
customer: ""
supplier: ""
order_no: ""
document_no: ""
amount: ""
date: YYYY-MM-DD
status: draft | pending | confirmed | disputed | archived
needs_human_review: true | false
\`\`\`

## 索引规范

\`wiki/index.md\` 按业务域和页面类型组织：

\`\`\`
## 销售
- [[page-slug]] — 一句话说明

## 仓库
- [[page-slug]] — 一句话说明
  
## 待复核
- [[page-slug]] — 为什么需要复核
\`\`\`

## 来源和审计

- 每条关键结论必须能追溯到 source、飞书消息、OCR 文件或人工确认记录。
- OCR、截图、语音转写、扫描件中的金额、数量、日期、地址、电话、单号必须标记是否需要人工复核。
- 不确定的信息只能写“疑似 / 无法确认 / 待复核”，禁止补全或猜测。

## 更新规则

- 同一业务对象已有页面时，优先更新既有页面，不要重复创建。
- 口径变化必须写入 decision 或 policy，并链接旧口径。
- 异常和投诉必须沉淀到 incident，并记录原因、影响、处理结果和预防措施。
- 跨部门信息要用 business_domain 和 sensitivity 标记边界。
`,
  purpose: `# 企业 Wiki 目标

## 知识库定位

这是企业内部知识库，用于沉淀飞书群消息、OCR 单据、PDF/Office 文档、业务流程、客户与订单上下文、财务/仓库/售后信息。

## 主要服务对象

- 普通员工：快速查询自己有权限访问的业务知识。
- 管理员：维护业务域、权限、流程、复盘和关键口径。
- AI 助手：基于可靠来源回答问题，不编造、不越权。

## 当前重点业务域

1. 销售与客户沟通
2. 仓库、发货、入库和物流异常
3. 财务、对账、付款和发票
4. 售后、投诉、异常和复盘

## 入库原则

- 来源可追溯：保留文件名、飞书群、发送人、时间、附件或原始消息线索。
- 权限优先：不同业务域和敏感等级不能默认互通。
- 人工复核：金额、数量、日期、客户名称、地址、电话、单号等关键字段必须允许人工复核。
- 持续更新：新资料进入时优先更新已有页面，避免碎片化重复页面。

## 暂不处理

- 没有来源的猜测性内容。
- 未授权业务域的跨域汇总。
- 无法确认且没有复核路径的关键结论。
`,
}

const groupChatTemplate: WikiTemplate = {
  id: "group-chat",
  name: "群聊信息",
  description: "适合把飞书群里的讨论、决定、待办和异常线索沉淀为 Wiki",
  icon: "💬",
  extraDirs: [
    "wiki/daily-summaries",
    "wiki/decisions",
    "wiki/todos",
    "wiki/issues",
    "wiki/people",
    "wiki/source-messages",
  ],
  schema: `# 群聊信息 Wiki Schema

## 使用目标

这个 Wiki 用于把飞书群聊中的高价值信息沉淀为可检索、可复核、可持续更新的企业知识。原始群聊是证据，Wiki 页面是经过整理后的业务口径。

## 页面类型

| 类型 | 目录 | 用途 |
|------|------|------|
| overview | wiki/ | 群聊知识概览、重点业务域、最近变更 |
| daily-summary | wiki/daily-summaries/ | 按日期沉淀当天的重要讨论、结论和风险 |
| decision | wiki/decisions/ | 已形成的决定、负责人、原因和影响 |
| todo | wiki/todos/ | 待办、负责人、截止时间、状态 |
| issue | wiki/issues/ | 异常、争议、客户问题、仓库/财务/售后线索 |
| person | wiki/people/ | 关键联系人、职责、上下文 |
| source | wiki/source-messages/ | 原始消息、OCR、附件或 RAG 证据摘要 |
| synthesis | wiki/synthesis/ | 跨天、跨群、跨资料的阶段性归纳 |

## Frontmatter

\`\`\`yaml
---
type: overview | daily-summary | decision | todo | issue | person | source | synthesis
title: 页面标题
status: draft | needs_review | confirmed | archived
business_domain: general
chat_id: ""
source_refs: []
owners: []
tags: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
\`\`\`

## 沉淀规则

- 所有关键结论必须保留来源引用：消息 ID、附件 ID、OCR 会话、ParsedContent 或 RAG source。
- 涉及金额、单号、客户、发票、库存、物流时，默认标记 \`needs_review\`，人工确认后才改为 \`confirmed\`。
- 不要把群聊闲聊、重复确认、机器人回复写成正式知识。
- 对跨群信息要标记 \`business_domain\` 和权限边界。
`,
  purpose: `# 群聊信息 Wiki Purpose

## 目标

- 将飞书群里反复出现的业务信息沉淀成可查询的长期知识。
- 把零散讨论整理为决定、待办、异常、复盘和来源证据。
- 减少“谁说过、在哪个群、哪张图、哪个单号”的反复查找成本。

## 使用方式

- 从飞书消息、OCR/MinerU 解析、信息库查询结果中导入候选资料。
- LLM 生成草稿后由负责人确认，确认后的页面可作为后续 RAG 的高质量知识。
- 对不确定内容保留待复核状态，不直接当成正式结论。
`,
}

const researchTemplate: WikiTemplate = {
  id: "research",
  name: "专题研究",
  description: "适合项目调研、竞品分析、假设追踪和研究结论沉淀",
  icon: "🔬",
  extraDirs: ["wiki/methodology", "wiki/findings", "wiki/thesis"],
  schema: `# Wiki Schema — Research Deep-Dive

## Page Types

| Type | Directory | Purpose |
|------|-----------|---------|
${BASE_SCHEMA_TYPES}
| thesis | wiki/thesis/ | Working hypothesis and its evolution over time |
| methodology | wiki/methodology/ | Research methods, protocols, and study designs |
| finding | wiki/findings/ | Individual empirical results or observations |

## Naming Conventions

${BASE_NAMING}
- Theses: hypothesis as slug (e.g., \`scaling-improves-reasoning.md\`)
- Methodologies: method name (e.g., \`systematic-review.md\`, \`ablation-study.md\`)
- Findings: descriptive slug (e.g., \`larger-models-better-few-shot.md\`)

## Frontmatter

${BASE_FRONTMATTER}

Thesis pages also include:
\`\`\`yaml
confidence: low | medium | high
status: speculative | supported | refuted | settled
\`\`\`

Finding pages also include:
\`\`\`yaml
source: "[[source-slug]]"
confidence: low | medium | high
replicated: true | false | null
\`\`\`

## Index Format

${BASE_INDEX_FORMAT}

## Log Format

${BASE_LOG_FORMAT}

## Cross-referencing Rules

${BASE_CROSSREF}
- Findings link back to their source via the \`source:\` frontmatter field
- Thesis pages reference supporting and refuting findings via \`related:\`
- Methodology pages are cited by the findings that used them

## Contradiction Handling

${BASE_CONTRADICTION}

## Research-Specific Conventions

- Keep the thesis pages updated as evidence accumulates — they are living documents
- Every finding should assess replication status when known
- Methodology pages explain the *why* (rationale) not just the *how*
- Distinguish between direct evidence and inference in finding pages
`,
  purpose: `# Project Purpose — Research Deep-Dive

## Research Question

<!-- State the central question this research aims to answer. Be specific and falsifiable. -->

>

## Hypothesis / Working Thesis

<!-- Your current best guess. This will evolve — update it as evidence accumulates. -->

>

## Background

<!-- What prior work or context motivates this research? What gap does it fill? -->

## Sub-questions

<!-- Break down the main question into tractable sub-questions. -->

1.
2.
3.
4.

## Scope

**In scope:**
-

**Out of scope:**
-

## Methodology

<!-- How will you investigate this? What types of sources or experiments are relevant? -->

-

## Success Criteria

<!-- How will you know when you have a satisfying answer? -->

-

## Current Status

> Not started — update this section as research progresses.
`,
}

const readingTemplate: WikiTemplate = {
  id: "reading",
  name: "资料阅读",
  description: "适合书籍、长文档、培训材料和章节笔记",
  icon: "📚",
  extraDirs: ["wiki/characters", "wiki/themes", "wiki/plot-threads", "wiki/chapters"],
  schema: `# Wiki Schema — Reading a Book

## Page Types

| Type | Directory | Purpose |
|------|-----------|---------|
${BASE_SCHEMA_TYPES}
| character | wiki/characters/ | People and figures in the book |
| theme | wiki/themes/ | Recurring ideas, motifs, and symbolic threads |
| plot-thread | wiki/plot-threads/ | Storylines or narrative arcs being tracked |
| chapter | wiki/chapters/ | Per-chapter notes and summaries |

## Naming Conventions

${BASE_NAMING}
- Characters: character name in kebab-case (e.g., \`elizabeth-bennet.md\`)
- Themes: thematic noun phrase (e.g., \`social-class-mobility.md\`, \`deception-vs-honesty.md\`)
- Plot threads: arc description (e.g., \`darcys-redemption-arc.md\`)
- Chapters: \`ch-NN-slug.md\` (e.g., \`ch-01-opening-scene.md\`)

## Frontmatter

${BASE_FRONTMATTER}

Character pages also include:
\`\`\`yaml
first_appearance: "Ch. N"
role: protagonist | antagonist | supporting | minor
\`\`\`

Chapter pages also include:
\`\`\`yaml
chapter: N
pages: "1-24"
\`\`\`

## Index Format

${BASE_INDEX_FORMAT}

## Log Format

${BASE_LOG_FORMAT}

## Cross-referencing Rules

${BASE_CROSSREF}
- Chapter notes reference characters appearing in that chapter via \`related:\`
- Theme pages link to the chapters where the theme is most prominent
- Plot thread pages list chapters that advance the arc

## Contradiction Handling

${BASE_CONTRADICTION}

## Reading-Specific Conventions

- Chapter pages are written during or immediately after reading — capture fresh reactions
- Distinguish between plot summary and personal interpretation in chapter notes
- Theme pages should track *development* across the book, not just state that a theme exists
- Flag unresolved plot threads with status: \`open\` until resolved
- Note page numbers for important quotes to enable re-finding later
`,
  purpose: `# Project Purpose — Reading

## Book Details

**Title:**
**Author:**
**Year:**
**Genre:**

## Why I'm Reading This

<!-- What drew you to this book? What do you hope to get from it? -->

## Key Themes to Track

<!-- What thematic threads do you expect or want to follow? -->

1.
2.
3.

## Questions Going In

<!-- What do you want answered or explored by the end? -->

1.
2.

## Reading Pace

**Started:**
**Target finish:**
**Current chapter:**

## First Impressions

<!-- Update after first chapter or first sitting. -->

>

## Final Takeaways

<!-- Fill in when finished. What did this book teach you? -->

>
`,
}

export const personalTemplate: WikiTemplate = {
  id: "personal",
  name: "个人成长",
  description: "保留兼容模板：目标、习惯、反思和日志",
  icon: "🌱",
  extraDirs: ["wiki/goals", "wiki/habits", "wiki/reflections", "wiki/journal"],
  schema: `# Wiki Schema — Personal Growth

## Page Types

| Type | Directory | Purpose |
|------|-----------|---------|
${BASE_SCHEMA_TYPES}
| goal | wiki/goals/ | Specific outcomes you are working toward |
| habit | wiki/habits/ | Recurring behaviours and their tracking |
| reflection | wiki/reflections/ | Periodic reviews and lessons learned |
| journal | wiki/journal/ | Freeform daily or session entries |

## Naming Conventions

${BASE_NAMING}
- Goals: outcome as slug (e.g., \`run-a-marathon.md\`, \`learn-spanish.md\`)
- Habits: behaviour name (e.g., \`daily-meditation.md\`, \`morning-pages.md\`)
- Reflections: type + date (e.g., \`weekly-2024-03.md\`, \`quarterly-2024-q1.md\`)
- Journal: date slug (e.g., \`2024-03-15.md\`)

## Frontmatter

${BASE_FRONTMATTER}

Goal pages also include:
\`\`\`yaml
target_date: YYYY-MM-DD
status: active | paused | achieved | abandoned
progress: 0-100
\`\`\`

Habit pages also include:
\`\`\`yaml
frequency: daily | weekly | monthly
streak: N
status: active | paused | dropped
\`\`\`

Reflection pages also include:
\`\`\`yaml
period: weekly | monthly | quarterly | annual
\`\`\`

## Index Format

${BASE_INDEX_FORMAT}

## Log Format

${BASE_LOG_FORMAT}

## Cross-referencing Rules

${BASE_CROSSREF}
- Reflection pages reference the goals and habits reviewed during that period
- Goals link to the habits that support them via \`related:\`
- Journal entries can reference goals and reflections inline with \`[[slug]]\`

## Contradiction Handling

${BASE_CONTRADICTION}

## Personal Growth Conventions

- Be honest in journal and reflection entries — this wiki is for you, not an audience
- Update goal progress fields regularly; stale data is worse than no data
- Distinguish between outcome goals (what you want) and process goals (what you will do)
- Reflect on *why* habits succeed or fail, not just whether they did
- Use the synthesis directory for cross-cutting insights that span multiple goals or periods
`,
  purpose: `# Project Purpose — Personal Growth

## Focus Areas

<!-- What areas of your life or self are you actively working on? -->

1.
2.
3.

## Motivation

<!-- Why now? What prompted you to start this wiki? -->

## Current Goals (Summary)

<!-- High-level list — create detailed goal pages in wiki/goals/ -->

- [ ]
- [ ]
- [ ]

## Active Habits

<!-- High-level list — create detailed habit pages in wiki/habits/ -->

-
-

## Review Cadence

**Daily journal:** Yes / No
**Weekly reflection:**
**Monthly reflection:**
**Quarterly reflection:**

## Guiding Principles

<!-- What values or principles guide your growth work? -->

1.
2.
3.

## This Year's Theme

<!-- One phrase or sentence that captures your intention for the year. -->

>
`,
}

const businessTemplate: WikiTemplate = {
  id: "business",
  name: "团队业务",
  description: "适合会议、决策、项目和干系人上下文",
  icon: "💼",
  extraDirs: ["wiki/meetings", "wiki/decisions", "wiki/projects", "wiki/stakeholders"],
  schema: `# Wiki Schema — Business / Team

## Page Types

| Type | Directory | Purpose |
|------|-----------|---------|
${BASE_SCHEMA_TYPES}
| meeting | wiki/meetings/ | Meeting notes, agendas, and action items |
| decision | wiki/decisions/ | Architectural or strategic decisions (ADR-style) |
| project | wiki/projects/ | Project briefs, status, and retrospectives |
| stakeholder | wiki/stakeholders/ | People, teams, and organisations involved |

## Naming Conventions

${BASE_NAMING}
- Meetings: \`YYYY-MM-DD-slug.md\` (e.g., \`2024-03-15-sprint-planning.md\`)
- Decisions: \`NNN-slug.md\` (e.g., \`001-adopt-typescript.md\`)
- Projects: descriptive slug (e.g., \`payments-redesign.md\`)
- Stakeholders: name or team in kebab-case (e.g., \`alice-chen.md\`, \`platform-team.md\`)

## Frontmatter

${BASE_FRONTMATTER}

Meeting pages also include:
\`\`\`yaml
date: YYYY-MM-DD
attendees: []
action_items: []
\`\`\`

Decision pages also include:
\`\`\`yaml
status: proposed | accepted | deprecated | superseded
deciders: []
date: YYYY-MM-DD
supersedes: ""   # slug of ADR this replaces, if any
\`\`\`

Project pages also include:
\`\`\`yaml
status: planned | active | on-hold | complete | cancelled
owner: ""
start_date: YYYY-MM-DD
target_date: YYYY-MM-DD
\`\`\`

## Index Format

${BASE_INDEX_FORMAT}

## Log Format

${BASE_LOG_FORMAT}

## Cross-referencing Rules

${BASE_CROSSREF}
- Meeting notes reference attendees via \`attendees:\` frontmatter and \`[[stakeholder-slug]]\` links
- Decision pages link to the meetings where the decision was discussed
- Project pages link to their key decisions via \`related:\`
- Stakeholder pages list projects and decisions they are involved in

## Contradiction Handling

${BASE_CONTRADICTION}

## Business-Specific Conventions

- Write meeting notes during or within 24 hours — memory fades fast
- Action items must have a named owner and due date to be actionable
- Decision pages capture *context and consequences*, not just the decision itself
- Deprecated decisions should link to the decision that superseded them
- Projects should have a retrospective section added on completion
`,
  purpose: `# Project Purpose — Business / Team

## Business Context

**Organisation / Team:**
**Domain:**
**Time period covered:**

## Objectives

<!-- What are the top-level business objectives this wiki supports? -->

1.
2.
3.

## Key Projects

<!-- High-level list — create detailed pages in wiki/projects/ -->

-
-

## Key Stakeholders

<!-- Who are the primary people or teams involved? -->

-
-

## Open Decisions

<!-- Decisions currently in flight — create ADR pages in wiki/decisions/ -->

-
-

## Metrics / Success Criteria

<!-- How does the team measure progress toward its objectives? -->

-

## Constraints and Risks

<!-- Known constraints (budget, time, org) and risks to track -->

-

## Review Cadence

**Weekly sync notes:**
**Monthly status update:**
**Quarterly retrospective:**
`,
}

const generalTemplate: WikiTemplate = {
  id: "general",
  name: "通用空白",
  description: "最小结构，适合自定义知识库",
  icon: "📄",
  extraDirs: [],
  schema: `# Wiki Schema

## Page Types

| Type | Directory | Purpose |
|------|-----------|---------|
${BASE_SCHEMA_TYPES}

## Naming Conventions

${BASE_NAMING}

## Frontmatter

${BASE_FRONTMATTER}

## Index Format

${BASE_INDEX_FORMAT}

## Log Format

${BASE_LOG_FORMAT}

## Cross-referencing Rules

${BASE_CROSSREF}

## Contradiction Handling

${BASE_CONTRADICTION}
`,
  purpose: `# Project Purpose

## Goal

<!-- What are you trying to understand or build? -->

## Key Questions

<!-- List the primary questions driving this project -->

1.
2.
3.

## Scope

**In scope:**
-

**Out of scope:**
-

## Thesis

<!-- Your current working hypothesis or conclusion (update as the project progresses) -->

> TBD
`,
}

export const templates: WikiTemplate[] = [
  enterpriseTemplate,
  groupChatTemplate,
  researchTemplate,
  readingTemplate,
  businessTemplate,
  generalTemplate,
]

export function getTemplate(id: string): WikiTemplate {
  const found = templates.find((t) => t.id === id)
  if (!found) {
    throw new Error(`Unknown template id: "${id}"`)
  }
  return found
}
