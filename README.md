# 主权枢纽 | Sovereign Hub

<div align="center">

![Sovereign Hub](https://img.shields.io/badge/Sovereign%20Hub-自托管意图枢纽-6366f1?style=for-the-badge)
![imToken 10th](https://img.shields.io/badge/imToken-10周年AI共创-f59e0b?style=for-the-badge)
![Sepolia](https://img.shields.io/badge/Network-Sepolia%20Testnet-10b981?style=for-the-badge)

**下一代 AI Agent 自托管意图枢纽**

[English](#english) | [中文](#中文)

</div>

---

## 中文

### 🏛️ 简介

主权枢纽（Sovereign Hub）是一个功能丰富的自托管意图枢纽。用户通过自然语言下达复杂意图，AI Agent 智能解析后提供质押、DeFi Swap、收付款、批量操作等多种方案，经过严格安全审查（Passkey + Security 材料），最终由用户完全自托管签名并广播到 Sepolia 测试网。

### ✨ 核心特性

| 特性 | 描述 |
|------|------|
| 🔑 钱包系统 | Passkey 创建/登录 + 助记词创建 + 私钥导入 |
| 🤖 AI 意图引擎 | 自然语言 → 结构化意图 → 智能路由 |
| ⚡ 多场景操作 | Staking / Unstaking / DeFi Swap / 收付款 / 批量交易 |
| 🛡️ 安全系统 | 多层风险审查 + Passkey 验证 + 交易模拟 |
| 📊 主权仪表盘 | 资产概览 / 安全分数 / 权限管理 / 操作历史 |
| 🔗 测试网集成 | Sepolia 测试网真实广播 + TX Hash + Etherscan |

### 🛠️ 技术栈

- **前端**: Vite 5 + React 18 + TypeScript 5 + Tailwind CSS 3
- **钱包**: Token Core 架构参考 + ethers.js v6
- **安全**: Token UI Security 材料深度集成
- **认证**: WebAuthn Passkey API
- **状态**: Zustand

### 🚀 快速开始

```bash
npm install
npm run dev
```

### 📦 构建

```bash
npm run build
```

### ☁️ Vercel 部署

1. 导入 GitHub 仓库到 Vercel
2. Framework 选择 "Vite"
3. 点击 Deploy

### ⚠️ 安全声明

**本项目为演示项目，仅供 Sepolia 测试网使用。** 所有密钥本地生成和存储，参考 Token Core 安全标准。安全审查参考 Token UI Security 材料，不构成投资建议。

---

## English

### 🏛️ Introduction

Sovereign Hub is a feature-rich self-sovereign intent hub. Users express complex intents through natural language, and the AI Agent intelligently parses them into actionable plans across staking, DeFi swaps, payments, and batch operations. After rigorous security auditing (Passkey + Security materials), transactions are self-sovereignly signed and broadcast to the Sepolia testnet.

### ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔑 Wallet System | Passkey creation/login + Mnemonic creation + Private key import |
| 🤖 AI Intent Engine | Natural language → Structured intent → Smart routing |
| ⚡ Multi-scenario Ops | Staking / Unstaking / DeFi Swap / Payments / Batch transactions |
| 🛡️ Security System | Multi-layer risk audit + Passkey verification + Transaction simulation |
| 📊 Sovereignty Dashboard | Asset overview / Security score / Permission management / History |
| 🔗 Testnet Integration | Sepolia testnet broadcast + TX Hash + Etherscan |

### 🛠️ Tech Stack

- **Frontend**: Vite 5 + React 18 + TypeScript 5 + Tailwind CSS 3
- **Wallet**: Token Core architecture reference + ethers.js v6
- **Security**: Token UI Security materials deep integration
- **Auth**: WebAuthn Passkey API
- **State**: Zustand

### 🚀 Quick Start

```bash
npm install
npm run dev
```

### 📦 Build

```bash
npm run build
```

### ☁️ Vercel Deployment

1. Import GitHub repo to Vercel
2. Select "Vite" as framework
3. Click Deploy

### ⚠️ Disclaimer

**This is a demo project for Sepolia testnet only.** All keys are generated and stored locally, following Token Core security standards. Security audits reference Token UI Security materials and do not constitute investment advice.

---

### 📄 References

- [Token Core](https://github.com/consenlabs/token-core-monorepo) - Wallet & signing architecture
- [Token UI](https://github.com/consenlabs/token-ui) - UI components & design patterns
- [Security Materials](https://github.com/consenlabs/token-ui/tree/main/security) - Security audit rules & risk detection

---

<div align="center">

**imToken 10周年 AI共创活动作品**

</div>
