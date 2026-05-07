# AI 药物研发预测沙盒

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-yellow.svg)

AI 药物研发预测沙盒是一个面向科研演示场景的前端小应用，用于模拟药物预测、新分子设计、智能体分析、ADMET 风险评估与结果导出流程。

> 注意：本项目仅用于科研产品演示和交互原型，不构成医疗、诊断、治疗或临床决策建议。

## 项目概述

本项目采用零前端框架、零外部运行依赖的轻量架构，使用原生 HTML、CSS、JavaScript 和 Node.js 静态服务实现。应用包含两条主流程：

- 药物预测：输入或选择已有药物，模拟智能体分析并生成风险、疗效、ADMET 与副作用结果。
- 新分子设计：通过目标驱动生成或手动创建分子，并调用本地代理接口预测新分子的潜在作用。

默认模型地址为本地 mock 流程，可直接运行 Demo；配置真实 REST 模型接口后，前端会通过本地代理请求模型，避免浏览器 CORS 问题。

## 核心功能

- 药物名称、SMILES、适应症、靶点与预测类型输入
- 新分子手动创建：分子名称、SMILES、分子量、生物利用度、目标器官、靶点、适应症
- 目标驱动新分子生成：基于疾病、症状、部位、下游靶点和代谢物生成候选分子
- 智能体分析：多个模拟专家智能体协同评估，可在卡片内开启或关闭
- 模型代理接口：`POST /api/predict-molecule`
- 本地 mock 预测：无需 API Key 即可运行演示
- 结构化结果展示：判定、置信度、预测分数、器官风险、疗效评分、副作用热力图
- 结果导出：PDF、CSV、新分子 CSV
- 响应式科研工作台界面

## 快速安装与运行

### 环境要求

- Node.js 18 或更高版本
- npm

### 安装

```bash
npm install
```

当前项目没有外部依赖，执行安装主要用于保持标准 Node 项目流程。

### 本地运行

```bash
npm run dev
```

启动后访问：

```text
http://localhost:5173/
```

### 生产方式启动

```bash
npm start
```

## 项目结构说明

```text
drug-discovery-sandbox/
├── index.html        # 页面入口
├── app.js            # 应用状态、页面渲染、交互逻辑、预测与导出逻辑
├── styles.css        # UI 样式、布局、响应式与工作台视觉
├── server.js         # 本地静态服务与模型代理接口
├── package.json      # npm 脚本与项目信息
├── README.md         # 项目说明文档
├── LICENSE           # MIT 开源许可证
└── AGENTS.md         # 项目内协作约定
```

## 技术栈

- 前端：HTML、CSS、原生 JavaScript
- 后端：Node.js HTTP Server
- 数据交互：REST JSON
- 导出能力：浏览器 Blob 下载
- 架构特点：零前端框架、零外部运行依赖、本地 mock 与代理接口并存

## 示例截图 / 使用演示

截图占位：

- 药物预测页面截图：展示预设药物、智能体分析、结果展示与导出按钮。
- 新分子设计页面截图：展示目标驱动生成、手动创建分子、分子预览与作用预测。
- 智能体开关截图：展示每个专家智能体卡片内的启用/停用状态。

使用演示占位：

1. 打开应用首页。
2. 在“药物预测”中选择预设案例或输入药物信息。
3. 点击“开始 AI 预测”，查看模拟智能体分析过程和结果。
4. 切换到“新分子设计”，生成候选分子或手动输入分子。
5. 点击“调用模型预测作用”，查看新分子风险、疗效和 ADMET 表现。
6. 使用 PDF 或 CSV 导出结果。

## 贡献指南

欢迎提交 Issue 和 Pull Request。建议遵循以下流程：

1. Fork 本仓库。
2. 创建功能分支。

```bash
git checkout -b feature/your-feature-name
```

3. 保持改动聚焦，避免无关格式化或大范围重构。
4. 提交前运行基础检查。

```bash
node --check app.js
node --check server.js
```

5. 提交 Pull Request，并说明改动内容、验证方式和可能影响。

## 许可证

本项目基于 MIT License 开源，允许自由使用、复制、修改、合并、发布、分发、再授权和销售副本。使用时请保留原始版权声明和许可证声明。

完整许可证文本见 [LICENSE](./LICENSE)。
