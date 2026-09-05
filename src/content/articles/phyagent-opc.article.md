---
slug: phyagent-opc
state: building
order: 1
title: 3 号 SMT 产线为什么连续出现贴装异常？
keywords:
  - OPC
  - Physical AI
  - Evidence
abstract: >-
  PhyAgent is an industrial investigation and orchestration system between factory data and field devices. Its local POC demonstrates how an AI can request physical evidence, select a suitable device, and keep the investigation open until the required evidence is available. Factory data and device actions are simulated for the 2026 息壤杯 OPC competition.
cover: /assets/phyagent-opc-cover.png
kicker: 一次从数字记录走向现场的调查
lede: MES 和 AOI 已经指出异常位置，但真正的原因还藏在现场。
video:
  src: /assets/phyagent-opc/phyagent-concept-film.mp4
  poster: /assets/phyagent-opc/concept-film-poster.jpg
---

在当前演示里，用户只说了一句话：“3号 SMT 产线今天连续出现贴装异常，请帮我调查原因。”MES、AOI 和维护记录很快把范围缩小到 Mounter-02，却仍然不能回答现场到底发生了什么。送料是否正常、连接有没有松动、关键位置是否被遮挡，这些情况不在现有记录里，必须到机器旁边看一眼才能继续判断。

传统流程通常需要人先决定去哪里、拍什么，再让机器人沿设定好的路线执行。这样可以完成巡检，却很难随着调查结果改变下一步行动。如果第一次观察没有找到原因，人还要重新查看材料、提出新的检查要求，再安排设备执行。问题并不是工厂没有数据或没有机器人，而是两者之间缺少一个能把问题继续查下去的系统。

## PhyAgent 怎样接着查下去

PhyAgent 就是为这一步设计的。用户提出要调查的问题，不必先给出巡检路线。系统会先查已有记录，弄清楚已经知道什么、还缺什么。如果数字记录仍然不能说明原因，它就决定下一步要去现场看什么，再选择能够完成这次观察的设备。需要在地面移动并近距离拍摄时可以选择 Rover，需要从高处观察或跨区域移动时可以选择 Drone。小车、无人机、机器狗和机械臂不再只会重复固定任务，它们也可以成为 AI 查清问题时使用的现场工具。

PhyAgent 放在工厂数据和现场设备之间。一边是 MES、AOI、手册和历史记录，另一边是 Rover、Drone 和其他能够进入现场的设备。它会把一个问题拆成几次具体的查询和观察，先查手册和 SOP，再说明现场任务需要哪些能力，然后从已经登记的设备中选择合适的一台。设备没有被写死在某一条流程里，系统每次都根据眼前的问题来选择。当前 POC 从 SMT 贴装异常开始演示，但这个思路也可以用于其他生产设备、厂务设施和园区仓储。

模型、PhyAgent 和机器人各自负责不同的事情。模型理解问题，提出下一步要查什么以及为什么要查。PhyAgent 决定调用哪个工具、选择哪台设备，并把调查过程和取得的信息记录下来。机器人继续负责导航、避障和运动控制，自己判断怎样安全到达目标位置。大模型不能直接控制轮子，也不能跳过系统规定的步骤。5G 负责在设备移动时保持连接，用来下发任务和传回现场图像或视频；它不会替 AI 作判断，也不会代替机器人的本地控制。

![路演材料：模型、PhyAgent 与机器人的工程责任边界](/assets/phyagent-opc/pitch-slide-11-boundary.png)

*模型提出要查什么，PhyAgent 安排调查，机器人负责安全执行。*

## 用一次 SMT 异常把流程跑通

当前演示从一句现场问题开始：“3号 SMT 产线今天连续出现贴装异常，请帮我调查原因。”系统先查询模拟的 MES、AOI 和维护记录，把调查范围缩小到 `SMT-Line-03 / Mounter-02 / Feeder F12`。这些记录只能说明问题大概出在哪里，还不能说明原因。系统接着判断需要一台能够在地面移动并拍摄彩色图像的设备，因此选择 Rover-01 前往目标位置。如果第一次拍摄仍然看不清问题，它会要求再靠近一些继续观察，不会把到达现场或拍到一张照片当成调查结束。

![演示模拟：Mounter-02 控制面板与 Feeder F12 异常画面](/assets/phyagent-opc/mounter02-panel-f12-error.png)

*模拟的 Mounter-02 控制面板画面。*

![演示模拟：Feeder F12 料带路径偏移近景](/assets/phyagent-opc/feeder-f12-tape-misalignment.png)

*模拟的 Feeder F12 近景画面。*

系统里有一条叫作 Evidence Gate 的规则，它用来检查证据够不够。只要关键证据还缺着，系统就不能给出最终结论。等现场画面和知识库里的依据都满足要求后，它才会写出初步原因、引用用过的证据、给出处理建议，并生成一张需要人工确认的工单。当前 POC 已经能够保存任务经过、设备选择理由和取得的证据，也能把整个过程重新播放出来。这个演示要确认的是：当原有数据不够时，系统确实会去补充现场信息，补齐以后再继续判断。

## 现在做到哪一步

这次演示仍然运行在 Web POC 和 `SimulatorAdapter` 上。工厂数据、Rover-01 的移动、现场画面和传感器结果都来自本地模拟，使用的知识文件也不是真正的厂商设备手册。因此，概念片、路演材料和本地测试只能说明这套调查流程已经在模拟环境中跑通。它们不能证明 PhyAgent 已经在真实工厂运行，也不能说明它已经改善了生产指标。

![路演材料：从 Web POC 逐步接入真实现场](/assets/phyagent-opc/pitch-slide-18-boundary.png)

*项目计划先接入真实 Rover 和 5G，再连接真实工厂数据，最后接入更多现场设备。*

下一步要把真实 Rover 和 5G 接进来，检查设备移动时能不能稳定传回图像，以及系统能不能守住安全边界。完成这些工作以后，再连接真实的 MES、AOI 和知识库，让一次调查真正从工厂数据开始。现在能够确认的是，Web POC 已经把查记录、选设备、模拟观察、检查证据和生成工单连了起来。真实设备和真实工厂系统还没有接入。

PhyAgent 希望解决的是这样一个问题：当数据库里的信息还不能解释异常时，AI 能不能自己发现还缺什么，再请合适的设备去现场看一眼。现在的 POC 证明这套流程可以在模拟环境里运行。等真实设备和工厂数据接入以后，我们才能知道它在现场是否同样可靠。
