# 健身系统设计文档

## 系统架构概述

本系统设计分为四个核心模块，分别定义了"练什么"、"怎么练"、"何时何地练"以及辅助上下文。

## A. 解剖学与动作库 (The Body & Movement)

这是系统的静态基石，定义了"练什么"。

### Muscle (肌肉)

- **独立存在**：代表人体解剖结构（如：胸大肌、三角肌前束）。
- **关系**：
  - 被 `Exercise` 引用。区分了**主要发力肌群 (Main)** 和**辅助肌群 (Support)**。这是一个多对多（N:M）关系。

### Exercise (动作)

- **核心定义**：代表一个抽象的训练动作（如：平板卧推）。
- **包含数据**：动作名称、描述、`Cues` (动作要领/提示列表)。
- **关系**：
  - 拥有多个 `Muscle`（主肌群/辅肌群）。
  - 被引用于 `Slot` 中。注意：`Exercise` 本身不包含"做多少公斤"，它只是动作的定义。

## B. 计划与编排 (The Plan)

这是系统的核心逻辑层，定义了"怎么练"。

### Routine (计划/流程)

- **双重身份**：通过 `template: Boolean` 字段区分。
  - `template = true`：计划模板（如"周一推胸日"）。
  - `template = false`：实际执行的课表（某次具体训练的记录容器）。
- **包含数据**：`checklist` (检查清单，JSON格式)、`note` (笔记)。
- **关系**：
  - 包含多个 `Slot`（一对多 1:N）。这是 `Routine` 的主体内容。
  - 关联多个 `Target`（多对多 N:M），用于打标签（如"增肌"、"康复"）。
  - 隶属于一个 `Workout`（一对一 1:1，如果是执行态的话）。

### Slot (训练槽/组)

- **连接桥梁**：这是最关键的一个中间类。它连接了抽象的 `Exercise` 和具体的 `Routine`。
- **定义具体参数**：它赋予了动作具体的训练量。
  - `Exercise` 只知道"深蹲"。
  - `Slot` 知道"深蹲 - 正式组(WorkingSets) - 第1组 - 100kg - 5次"。
- **关系**：
  - `Exercise` (多对一)：一个 `Slot` 对应一个动作。
  - `Routine` (多对一)：一个 `Slot` 属于一个计划。
- **特殊属性**：`category` (枚举)，区分了这是热身、正式组还是筋膜放松。

## C. 执行与场景 (The Event)

这是基于时间的动态记录，定义了"何时何地"。

### Workout (训练课/场次)

- **定义**：代表一次完整的进馆训练事件。
- **包含数据**：`startTime` / `endTime` (时间跨度)。
- **关系**：
  - 发生于一个 `Gym` (多对一)。
  - 执行一个 `Routine` (一对一)。
- **设计推测**：当你开始一次训练时，系统可能会复制一个"模板 `Routine`"生成一个新的"实例 `Routine`"并关联给这次 `Workout`，或者直接创建一个新的空白 `Routine`。
  - 关联多个 `Target`。

## D. 辅助上下文 (Context)

### Gym (健身房)

- **定义**：单纯的地点记录，被 `Workout` 引用。

### Target (训练目标/标签)

- **定义**：灵活的标签系统（如"背部"、"体态矫正"、"力量"）。
- **应用场景**：
  - 既可以打在 `Routine` 上（计划的属性）。
  - 也可以打在 `Workout` 上（当次训练的属性）。

## 数据流向示例 (Scenario)

为了验证这个设计，我们可以模拟 Alan (你) 的一次训练过程：

1. **定义库**：
   - 你创建了 `Muscle`："Gluteus Maximus" (臀大肌)。
   - 你创建了 `Exercise`："Barbell Squat" (杠铃深蹲)，关联主肌群为臀大肌。

2. **制定计划 (Template)**：
   - 你创建了一个 `Routine` (Template=true)，名为 "Leg Day A"。
   - 在这个 `Routine` 下，你创建了 3 个 `Slot`，分别对应"热身组深蹲"、"正式组深蹲 100kg"、"正式组深蹲 105kg"。

3. **开始训练 (Workout)**：
   - 你到达 `Gym` ("City Gym")。
   - 你创建了一个 `Workout`。
   - 系统基于 "Leg Day A" 模板，生成了一个新的 `Routine` (Template=false) 并关联给这个 `Workout`。
   - 你在新的 `Routine` 对应的 `Slot` 里填入实际完成的重量和次数。

## 实体关系图 (ERD)

```
+----------------+      +----------------+      +----------------+      +----------------+
|    Muscle      |      |    Exercise    |      |      Slot      |      |     Routine    |
+----------------+      +----------------+      +----------------+      +----------------+
| id             |<-----| id             |<-----| id             |<-----| id             |
| name           |      | name           |      | category       |      | template       |
| description    |      | description    |      | sets           |      | checklist      |
+----------------+      | cues           |      | reps           |      | note           |
                        +----------------+      | weight         |      +----------------+
                                               | exercise_id    |      | workout_id     |
                                               | routine_id     |      +----------------+
                                               +----------------+           |
                                                                           |
+----------------+      +----------------+      +----------------+           |
|     Target     |      |     Gym        |      |    Workout     |-----------+
+----------------+      +----------------+      +----------------+
| id             |      | id             |      | id             |
| name           |      | name           |      | start_time     |
+----------------+      | location       |      | end_time       |
                        +----------------+      | gym_id         |
                                               +----------------+
```

## 核心字段说明

| 实体       | 核心字段                | 类型          | 说明                                  |
|------------|-------------------------|---------------|---------------------------------------|
| Muscle     | id, name, description   | Long, String, String | 肌肉解剖信息                  |
| Exercise   | id, name, description, cues | Long, String, String, List<String> | 动作定义          |
| Slot       | id, category, sets, reps, weight | Long, Enum, Int, Int, Double | 训练组参数 |
| Routine    | id, template, checklist, note | Long, Boolean, String, String | 计划信息    |
| Workout    | id, start_time, end_time, gym_id | Long, LocalDateTime, LocalDateTime, Long | 训练记录 |
| Gym        | id, name, location      | Long, String, String | 健身房信息                |
| Target     | id, name                | Long, String  | 训练目标/标签                         |