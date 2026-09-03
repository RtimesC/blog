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
kicker: 2026 / 息壤杯 OPC / LOCAL POC
lede: When the digital record is not enough, an industrial agent should ask for evidence before it offers an answer.
status:
  - 演示模拟
  - 离线本地 RAG
  - 人工确认闭环
note: 本地材料已收口；线上提交回执未核验。
---

## The question

不是再做一辆巡检小车

这次比赛里，我们把问题从“机器人能不能拍到异常”往前推了一步：当生产记录、AOI 结果和维修历史无法解释 SMT 产线的反复异常时，系统能不能自己判断还缺什么证据？

PhyAgent 是一个面向智能制造的 Physical AI 决策与编排 POC。人只需要提出调查目标，Agent 负责拆解调查、请求现场证据，并把结果交回给人确认。

## The loop

Evidence before answers

1. **01 / Digital records**: 读取 MES、AOI 与维护记录，定位到 SMT-Line-03 的 Mounter-02 / Feeder F12。
2. **02 / Evidence Gate**: 数字证据不足时锁定结论，不允许 Agent 直接猜测根因。
3. **03 / Rover-01**: 确定性能力匹配选择具备地面导航与 RGB 视觉能力的现场工具，获取控制面板和 Feeder F12 近景证据。
4. **04 / Local knowledge**: 通过离线本地 RAG 检索知识库，把证据和可追溯来源放进同一条账本。
5. **05 / Human confirmation**: 证据充分后生成初步根因与维护工单，最终处置仍由人确认。

## Local acceptance

一个可以重复播放的闭环

- **COMPLETED**: Guided Demo
- **06**: evidence records
- **08**: tool calls
- **WO-2026-SMT-0001**: human-confirmation work order

以上为本地 Mock 验收结果，不代表真实工厂部署或生产实测。

## The boundary

这次真正做到了什么

### 已实现

可重复的 Mock 状态机、Evidence Gate、能力匹配、Mission Control、离线本地 RAG、证据账本和工单生成。

### 演示模拟

工厂数据、现场画面、Rover-01 移动、传感器结果与 5G 协同均由本地模拟器提供。

### 待实测

真实机器人与 ROS2 接入、真实 5G 链路、厂商设备手册、生产指标和现场安全验证。

## What stays with me

这次项目最重要的收获，不是让模型说得更像专家，而是给它加了一道“先找证据”的门。Physical AI 的下一步，可能不是让语言模型直接控制更多设备，而是让它更诚实地知道自己还不知道什么。
