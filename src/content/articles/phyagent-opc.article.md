---
slug: phyagent-opc
order: 1
title: PhyAgent
keywords:
  - OPC
  - Physical AI
  - Evidence
abstract: >-
  A local POC for an industrial Physical AI agent. When digital records are not enough, it asks for field evidence, calls Rover-01, retrieves local knowledge, and only then creates a human-confirmation work order. Factory data and robot actions are simulated for the 2026 息壤杯 OPC competition.
cover: /assets/phyagent-opc-cover.png
kicker: 2026 / 息壤杯 OPC / MOCK MODE GUIDED DEMO
lede: 但知道异常在哪，并不等于知道现场发生了什么。
status:
  - 已实现 / 本地 POC
  - 演示模拟 / SimulatorAdapter
  - 待实测 / 真实 Adapter
note: PhyAgent 是基于模拟数据、模拟现场与 Mock/POC 的工业 Physical AI 概念验证。概念片和路演材料不宣称真实工厂部署、实测结果或已正式复产。
video:
  src: /assets/phyagent-opc/phyagent-concept-film.mp4
  poster: /assets/phyagent-opc/concept-film-poster.jpg
  label: 本地交付 / 最终概念片 / 58 秒
  caption: SMT 贴装异常调查的 POC 示例，不代表真实工厂部署或实测结果。
---

## 系统要做什么

> 当 AI 仅依靠 MES、AOI、维护记录、设备手册等数字信息不足以判断制造现场问题时，AI 不继续猜测，而是主动判断自己缺少什么物理证据，并根据任务所需能力，从小车、无人机、机器狗等 Physical Agents 中选择最合适的执行终端，调用其进入物理现场获取新的证据，再结合数字证据和知识库继续推理，直到满足 Evidence Gate，最后形成有依据的结论并完成工单等业务闭环。

当前 POC 不接真实机器人。可重复演示与验收只以 `SMT-Line-03 / Mounter-02 / Feeder F12` 贴装异常调查为主线；`Motor-03` 仅用于项目概述中的理念说明，不参与 POC 数据、代码或验收。

## 一条受控调查链

用户输入“3号 SMT 产线今天连续出现贴装异常，请帮我调查原因。”后，系统围绕 `SMT-Line-03 / Mounter-02 / Feeder F12` 运行：

```text
MES + AOI + 维护记录
  → Evidence Gate 锁定
  → 提取地面导航 + RGB 视觉能力
  → 确定性匹配 Rover-01
  → 控制面板现场证据
  → 知识依据
  → Feeder F12 近景现场证据
  → Evidence Gate 解锁
  → 初步根因 + 维护工单
```

![演示模拟：Mounter-02 控制面板与 Feeder F12 异常画面](/assets/phyagent-opc/mounter02-panel-f12-error.png)

*演示模拟 / `SimulatorAdapter` 提供的 Mounter-02 控制面板现场证据。*

![演示模拟：Feeder F12 料带路径偏移近景](/assets/phyagent-opc/feeder-f12-tape-misalignment.png)

*演示模拟 / `SimulatorAdapter` 提供的 Feeder F12 近景现场证据：料带路径偏移。*

## 把“会判断”和“能执行”分开

模型决定查什么、为什么查；系统控制流程、设备和证据记录。

![路演材料：模型、PhyAgent 与机器人的工程责任边界](/assets/phyagent-opc/pitch-slide-11-boundary.png)

*路演材料 / 最终提交版第 11 页。模型理解问题并提出调查意图；PhyAgent 控制流程、工具调用、设备选择和证据记录；机器人负责本地导航、避障与运动控制。*

LLM/Provider 只负责任务解析、能力需求与观察分析，不能直接选择执行器或绕过 Evidence Gate。

## 本迭代完成什么

- 已完成：纯 Python Guided Demo、状态机、Evidence Gate、能力匹配与 SQLite 审计。
- 已完成：FastAPI 健康检查、执行器列表和 Guided Demo API。
- 已完成：全中文 Mission Control 与可回放的事件、证据和执行器选择理由。
- 已完成：离线本地 RAG 的知识块向量检索与来源引用。

`LocalKnowledgeRetriever` 读取本地知识库，按二级标题切块，以稳定哈希特征向量与余弦相似度完成离线 Top-K 检索。工具调用审计保留文档、章节、摘录、分数和来源引用。它服务于 Mock Demo，不是厂商设备手册。

本地 Mock 验收条件包括：没有物理证据时最终结论必须被 Evidence Gate 锁定；地面视觉任务优先选择 Rover-01；SMT 主线生成两条物理证据、一条知识依据、可追溯 Evidence ID 与工单；`AI_MODE=mock` 下不需要网络或 API Key。

## 当前边界与后续

![路演材料：POC 与模拟器边界](/assets/phyagent-opc/pitch-slide-18-boundary.png)

*路演材料 / 最终提交版第 18 页。NOW 是 Web POC + Simulator；NEXT 才是真实 Rover + 5G；THEN 才从真实 MES、AOI 与知识库开始调查。*

### 已实现

Web POC、确定性状态跳转、证据解锁、能力过滤与排序、Mock 工具调用、工单生成、离线本地 RAG 与 SQLite 审计。

### 演示模拟

本迭代的 Physical Adapter 仅为 `SimulatorAdapter`。工厂数据、Rover-01 移动、现场画面和传感器结果均为本地模拟。

### 待实测

真实机器人与 ROS2 接入、真实 5G 网络、厂商设备手册、生产指标和现场安全验证。概念片、PPT 与本地测试都不证明这些事项已经完成。
