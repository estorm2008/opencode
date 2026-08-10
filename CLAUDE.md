# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

OpenCode 是一个开源的 AI coding agent，支持终端 TUI、Web 和桌面 (Electron) 三种界面。

- **GitHub:** https://github.com/anomalyco/opencode
- **文档:** https://opencode.ai/docs
- **Discord:** https://opencode.ai/discord

## 技术栈

- **运行时:** Bun 1.3+（首选），也支持 Node.js
- **语言:** TypeScript（使用 `tsgo` 替代 `tsc` 做类型检查）
- **UI 框架:** SolidJS（TUI 和 Web 界面均使用）
- **TUI 框架:** OpenTUI（`@opentui/core`、`@opentui/solid`）
- **Effect 系统:** `effect` 库 — 函数式效应管理、依赖注入、Schema 校验
- **数据库:** SQLite + Drizzle ORM，通过 Effect 集成
- **LLM SDK:** Vercel AI SDK（`ai`）作为主要 LLM 抽象层
- **构建:** Bun 内置打包器 + Turborepo
- **代码检查:** oxlint（配置在 `.oxlintrc.json`）
- **测试:** Bun 内置测试运行器 + Playwright (e2e)

## 开发命令

```bash
bun install                              # 安装依赖（postinstall 自动 fix-node-pty）
bun dev                                  # 启动开发模式（TUI，默认在 packages/opencode 目录运行）
bun dev <directory>                      # 在指定目录运行开发模式
bun dev serve                            # 启动无头 API 服务（默认端口 4096）
bun dev serve --port 8080                # 指定端口
bun dev web                              # 启动 Web 界面
bun run --cwd packages/app dev           # 启动 Web 应用开发服务器
bun run --cwd packages/desktop dev       # 启动桌面应用开发模式
bun lint                                 # 运行 oxlint 代码检查
bun typecheck                            # 运行全项目类型检查（通过 Turborepo）
```

### 构建

```bash
./packages/opencode/script/build.ts --single   # 编译独立可执行文件
bun run --cwd packages/desktop build           # 构建桌面应用
bun run --cwd packages/desktop package         # 打包桌面应用
```

### 测试

```bash
# 在特定包中运行测试（始终从包目录运行）
cd packages/opencode && bun test --timeout 30000 --only-failures
cd packages/app && bun test                    # 运行 app 包测试
cd packages/app && bun test:unit               # 仅运行单元测试
cd packages/app && bun test:browser            # 仅运行浏览器测试
cd packages/llm && bun test                    # 运行 LLM 测试
cd packages/core && bun test                   # 运行 core 测试

# E2E 测试（app 包）
cd packages/app && bun test:e2e               # Playwright e2e
cd packages/app && bun test:e2e:ui            # Playwright UI 模式
```

### 调试

```bash
# 使用 inspect 模式启动
bun run --inspect-wait=ws://localhost:6499/ dev

# 分步调试（server + TUI 分开）
bun run --inspect=ws://localhost:6499/ --cwd packages/opencode ./src/index.ts serve --port 4096
opencode attach http://localhost:4096         # 在另一个终端 attach TUI
```

VSCode launch 配置示例见 `.vscode/launch.example.json`。

## Monorepo 结构

```
packages/
├── opencode/          # 主应用 — CLI 入口、session 处理器、agent 逻辑、tool 注册、MCP、provider 抽象
│   └── src/
│       ├── cli/       # CLI 入口和命令
│       ├── session/   # Session 核心 — processor(LLM循环), llm(请求), tool(工具调用), prompt(系统提示词)
│       ├── agent/     # Agent 定义和管理（build/plan/subagent）
│       ├── tool/      # 工具注册中心及各工具实现（read/write/shell/grep/edit/glob 等）
│       ├── server/    # HTTP API 服务端（Hono）
│       ├── provider/  # LLM Provider 抽象
│       ├── config/    # 配置管理和解析
│       ├── mcp/       # MCP 协议支持
│       ├── auth/      # 认证
│       ├── effect/    # Effect 层定义（bridge/runner/runtime）
│       ├── plugin/    # 插件系统
│       ├── permission/# 权限系统
│       ├── git/       # Git 集成
│       ├── lsp/       # LSP 集成
│       ├── image/     # 图片处理
│       └── project/   # 工作区项目管理
├── core/              # 共享核心库 — 数据库、FS、Git、Session 模型、Effect 工具、Plugin SDK
│   └── src/
│       ├── database/  # SQLite + Drizzle ORM + migration
│       ├── session/   # Session 模型、持久化、执行器
│       ├── effect/    # 核心 Effect 工具（LayerNode/AppNode/ServiceUse）
│       ├── plugin/    # 插件宿主
│       ├── filesystem/# 文件系统抽象
│       ├── tool/      # 工具定义
│       └── config/    # 配置模型
├── llm/               # LLM 抽象层 — 多 provider 实现、多 protocol 适配
│   └── src/
│       ├── providers/ # Provider 实现（anthropic/openai/google/bedrock/xai/azure/cloudflare 等）
│       └── protocols/ # API 协议适配（Anthropic Messages/OpenAI Chat/Gemini/Bedrock Converse）
├── app/               # 共享 Web UI 组件（SolidJS + Vite + Tailwind）
├── desktop/           # Electron 桌面应用
├── console/           # 云端 Console Web 应用（SolidJS + SST）
├── web/               # 营销网站（Astro + Starlight 文档）
├── tui/               # 终端 UI 组件（SolidJS + OpenTUI）
├── ui/                # 共享 UI 原语
├── session-ui/        # Session UI 组件（聊天界面）
├── server/            # 无头 API 服务器（Hono + Effect）
├── protocol/          # API 协议层
├── schema/            # Effect Schema 数据模型定义
├── sdk/               # SDK JS（NPM 包 opencode-ai）
├── sdk-next/          # 下一代 SDK
├── plugin/            # 插件 SDK（@opencode-ai/plugin）
├── cli/               # 备用 CLI（lildax）
├── slack/             # Slack 集成
├── stats/             # 统计服务
├── storybook/         # Storybook 组件开发
├── codemode/          # Code Mode 工具
├── function/          # 云函数
└── containers/        # Docker 容器
```

## 核心架构模式

### 1. Effect 依赖注入

整个项目使用 `effect` 库的 `Context` + `Layer` 模式进行依赖注入。每个 Service 定义为一个 `Context.Tag`，通过 `Layer` 组合并提供给运行环境。

```typescript
export class Service extends Context.Service<Service, Interface>()("@opencode/Session") {}
const layer = Layer.effect(Service, Effect.gen(function* () { ... }))
```

### 2. LayerNode 系统

在 `packages/core/src/effect/layer-node.ts` 中定义。是对 Effect `Layer` 的进一步封装，提供编译时依赖图检查能力。所有服务的依赖关系通过 `tags()` 声明式的结构化定义。

### 3. Session 处理循环

核心流程在 `packages/opencode/src/session/processor.ts` 中：

```
用户输入 → Agent 选择 → Provider/Model → LLM 请求 → Tool 调用循环 → 响应输出
                                            ↓
                                      Session 持久化 (SQLite)
```

- `SessionProcessor` 处理 LLM 流式请求和工具调用
- `Session` 服务管理会话的 CRUD 和持久化
- 工具在 `tool/registry.ts` 中注册，通过 ToolName 路由到具体实现

### 4. Plugin 系统

插件系统分为两层：
- **内部 Plugin**（`packages/opencode/src/plugin/`）— 加载和管理第三方插件
- **Plugin SDK**（`packages/plugin/`）— `@opencode-ai/plugin` NPM 包，暴露给插件开发者

插件可以注册工具、Agent、命令、事件处理等。

### 5. Provider 与 Protocol

LLM 接入分两层：
- **Provider**（`packages/llm/src/providers/`）— 各 AI 服务商的 client 配置和认证
- **Protocol**（`packages/llm/src/protocols/`）— API 格式转换（Anthropic Messages、OpenAI Chat、Gemini 等）

### 6. Agent 系统

Agent 定义在 `packages/opencode/src/agent/agent.ts` 中，核心概念：
- **build** — 默认 agent，完整权限
- **plan** — 只读 agent，用于分析和规划
- **subagent** — 内部调用的子 agent
- Agent 可以有自定义 system prompt、模型、权限规则集

## 重要约定

- **路径别名:** `@/` 指向 `packages/opencode/src/`
- **条件导出:** 使用 `#conditions=browser` 处理平台差异；通过 `imports` 在 package.json 中定义平台特定实现
- **代码风格:** 见 `AGENTS.md` — 无 `else` 语句、优先 `.catch()` 而非 `try/catch`、避免 `let`、使用精确类型
- **Git 分支:** 默认开发分支是 `dev`
- **PR 规范:** 所有 PR 必须关联 Issue，标题遵循 conventional commit 格式
- **版本号:** 所有包统一版本 `1.18.4`（在各自的 package.json 中维护）
