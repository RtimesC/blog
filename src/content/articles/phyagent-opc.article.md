---
slug: phyagent-opc
state: building
order: 1
title: 数据不够时，AI 去现场找答案
keywords:
  - OPC
  - Physical AI
  - Evidence
abstract: >-
  PhyAgent is an industrial investigation and orchestration system between factory data and field devices. Its local POC demonstrates how an AI can request physical evidence, select a suitable device, and keep the investigation open until the required evidence is available. Factory data and device actions are simulated for the 2026 息壤杯 OPC competition.
cover: /assets/phyagent-opc-cover.png
kicker: PhyAgent / 2026 息壤杯 OPC / 工业现场智能调查与调度系统
lede: 工业系统往往知道异常在哪里，却不知道现场发生了什么。
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

## 现场为什么还需要调查

制造企业已经积累了 MES、AOI、告警、维修记录和设备手册，这些数据能够指出哪条产线、哪台设备出现了异常，却未必能够解释现场究竟发生了什么。送料状态、连接松动、遮挡和局部异常往往仍然留在数字系统之外。面对这种信息缺口，传统流程通常需要人先判断去哪里、看什么，再安排机器人沿预设路线执行巡检。机器人可以完成任务，却不会根据调查进展追问下一步还缺少什么证据。

PhyAgent 的出发点是把这一步从人工经验转成系统决策。用户不再输入一条巡检路线，而是提出一个需要调查的现场问题。系统先查询已有数据，在信息不足时判断下一步需要取得什么现场证据，再根据任务所需能力调用合适的设备。机器人由此不只是重复执行固定路线的巡检工具，而成为 AI 调查过程中可以调用的 Physical Tool。SMT 贴装异常是当前 POC 的演示入口，但系统设想并不限定在 SMT 产线，同一个调查中枢可以面向电子制造、设备产线、厂务设施和园区仓储，并接入小车、无人机、机器狗或机械臂等不同终端。

## 工厂数据与现场设备之间的调查中枢

PhyAgent 位于工厂数据和现场设备之间。左侧是 MES、AOI、手册和历史记录，右侧是 Rover、Drone 以及其他能够进入现场的设备，中间层负责任务理解、知识检索、能力匹配和证据门控。它把一句现场问题转成调查目标与缺失信息，查询手册和 SOP，再描述完成下一步观察所需的能力，由系统从设备注册表中选择执行终端。地面到达和近距离拍摄可以匹配 Rover，高处视角和跨区域移动可以匹配 Drone。设备不是预先写死在流程里，系统先判断需要什么能力，再决定由谁完成。

这层中枢同时划定了模型与设备的工程边界。模型负责理解问题并提出调查意图，也就是决定查什么、为什么查；PhyAgent 负责流程控制、工具调用、设备选择和证据记录；机器人保留本地导航、避障和运动控制，决定怎样安全到达并完成动作。大模型不能直接控制轮子，也不能自己选择设备或越过证据规则。5G 在这套系统中的作用同样被限定为连接层，用于任务动态下发、现场图像或视频回传，以及设备移动过程中的持续接入，而不是替代 AI 决策或机器人本地自治。

![路演材料：模型、PhyAgent 与机器人的工程责任边界](/assets/phyagent-opc/pitch-slide-11-boundary.png)

*最终提交版第 11 页所示的工程边界：模型提出调查意图，PhyAgent 控制流程和证据，机器人完成本地执行。*

## 用一次 SMT 异常调查验证闭环

当前 Guided Demo 从一句现场问题开始：“3号 SMT 产线今天连续出现贴装异常，请帮我调查原因。”系统首先查询模拟的 MES、AOI 和维护记录，将目标锁定到 `SMT-Line-03 / Mounter-02 / Feeder F12`。这些记录只能确定调查范围，还不足以结束调查。系统因此提取地面导航和 RGB 视觉能力，匹配 Rover-01 到达目标点位并获取新的现场信息。如果第一次观察仍不能支持判断，系统会继续请求更近的观察，而不是把一次到达或一次拍摄当成任务终点。

![演示模拟：Mounter-02 控制面板与 Feeder F12 异常画面](/assets/phyagent-opc/mounter02-panel-f12-error.png)

*`SimulatorAdapter` 提供的 Mounter-02 控制面板模拟观察。*

![演示模拟：Feeder F12 料带路径偏移近景](/assets/phyagent-opc/feeder-f12-tape-misalignment.png)

*`SimulatorAdapter` 提供的 Feeder F12 近景模拟观察。*

Evidence Gate 用来约束这条调查链何时可以结束。关键证据缺失时，最终结论保持锁定；现场观察和知识依据满足预设条件后，系统才生成初步原因、证据引用、处理建议和需要人工确认的工单。当前 POC 已经实现状态机、能力匹配、Evidence Gate、Mock 工具调用、本地知识检索和 SQLite 审计，全中文 Mission Control 可以回放任务状态、设备选择理由和证据记录。这里要证明的不是模型给出了一次看似正确的回答，而是“数据不足、现场取证、再判断”的调查过程能够被执行和追溯。

## 从 Web POC 走向真实现场

这次演示仍然运行在 Web POC 和 `SimulatorAdapter` 上。工厂数据、Rover-01 的移动、现场画面和传感器结果均为本地模拟，本地知识文件也不是厂商设备手册。因此，概念片、路演材料和本地测试只能说明调查逻辑、设备匹配与证据闭环已经在模拟环境中实现，不能证明 PhyAgent 已经进入真实工厂，也不能据此声称真实生产指标得到改善。

![路演材料：从 Web POC 逐步接入真实现场](/assets/phyagent-opc/pitch-slide-18-boundary.png)

*最终提交版第 18 页给出的演进顺序：先验证 Web POC，再接入真实 Rover 与 5G，随后连接 MES、AOI 和知识库，最终形成多设备协同平台。*

项目下一步不是再增加一套概念展示，而是按顺序接入真实 Rover 与 5G，验证图像回传、移动连接和安全边界，再连接真实 MES、AOI 与知识库，让调查从真实工厂数据开始。最终目标也不是再制造一台机器人，而是让已有设备共享同一个 AI 调查中枢。PhyAgent 当前完成的是这条路线的第一步：先在可重复的模拟环境中证明，当数字信息不足时，系统能够把问题继续带到现场。
