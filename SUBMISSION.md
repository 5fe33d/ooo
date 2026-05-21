# 主权枢纽 Sovereign Hub - 提交材料

---

## 📌 中文简介

**主权枢纽（Sovereign Hub）** 是一个功能丰富的自托管意图枢纽，为 imToken 10周年 AI共创活动打造。用户通过自然语言下达复杂意图（如"把 0.3 ETH 质押到 Lido 并把收益转给我朋友"），AI Agent 智能解析后提供质押、DeFi Swap、收付款、批量操作等多种方案，经过严格安全审查（Passkey + Token UI Security 材料深度集成），最终由用户完全自托管签名并广播到 Sepolia 测试网。

核心特性：
- 🔑 三种钱包创建方式：Passkey 生物识别 / 助记词 / 私钥导入
- 🤖 AI Agent 意图引擎：自然语言 → 结构化意图 → 智能路由
- ⚡ 多场景操作：Staking、DeFi Swap、收付款、批量交易
- 🛡️ 多层安全审查：Token UI Security 材料深度集成 + 交易模拟
- 📊 主权仪表盘：资产概览、安全分数、权限管理、操作历史
- 🔗 完整测试网流程：创建钱包 → 意图解析 → 安全审查 → 自托管签名 → Sepolia 广播

---

## 📌 English Introduction

**Sovereign Hub** is a feature-rich self-sovereign intent hub built for the imToken 10th Anniversary AI Co-creation Event. Users express complex intents through natural language (e.g., "Stake 0.3 ETH to Lido and send the yield to my friend"), and the AI Agent intelligently parses them into actionable plans across staking, DeFi swaps, payments, and batch operations. After rigorous security auditing (Passkey + Token UI Security materials integration), transactions are self-sovereignly signed and broadcast to the Sepolia testnet.

Key Features:
- 🔑 Three wallet creation methods: Passkey biometric / Mnemonic / Private key import
- 🤖 AI Agent Intent Engine: Natural language → Structured intent → Smart routing
- ⚡ Multi-scenario operations: Staking, DeFi Swap, Payments, Batch transactions
- 🛡️ Multi-layer security audit: Token UI Security materials integration + Transaction simulation
- 📊 Sovereignty Dashboard: Asset overview, Security score, Permission management, Operation history
- 🔗 Complete testnet flow: Create wallet → Intent parsing → Security audit → Self-sovereign signing → Sepolia broadcast

---

## 📌 创作笔记

### 技术选型
- **前端框架**: Vite 5 + React 18 + TypeScript 5，确保现代化开发体验和类型安全
- **样式方案**: Tailwind CSS 3 + 自定义 Sovereign 主题，深色科技感设计
- **钱包核心**: 参照 Token Core 的密钥管理架构，实现本地密钥生成、助记词管理、签名广播
- **安全体系**: 深度参考 Token UI Security 材料，实现 Token Approval Risk、Contract Verification、Phishing Detection、Gas Anomaly、Address Poisoning、Private Key Leakage 六大安全检查
- **AI 引擎**: 本地规则引擎 + 正则模式匹配，支持中英文自然语言意图解析
- **Passkey**: 使用 WebAuthn API 实现 Passkey 创建和验证
- **区块链交互**: ethers.js v6 + Sepolia 测试网

### 设计理念
1. **极致控制权**: 所有密钥本地生成和存储，签名过程不离开设备
2. **意图驱动**: 用自然语言替代复杂操作流程，降低使用门槛
3. **安全优先**: 每笔交易经过多层安全审查和模拟，参考 Token UI Security 最佳实践
4. **多功能集成**: 质押、Swap、收付款、批量操作一站式覆盖
5. **主权可视化**: 仪表盘直观展示资产、安全状态和操作历史

### 参考材料
- **Token Core** (https://github.com/consenlabs/token-core-monorepo): 参考了密钥管理架构（HDNodeWallet、Mnemonic 处理）、签名流程（本地签名 + 广播）、多链支持设计
- **Token UI** (https://github.com/consenlabs/token-ui): 参考了组件设计理念、UI/UX 交互模式
- **Security 材料** (https://github.com/consenlabs/token-ui/tree/main/security): 深度集成了六大安全检查规则（Token Approval Risk、Contract Verification、Phishing Detection、Gas Price Anomaly、Address Poisoning、Private Key Leakage）

---

## 📌 安全声明

1. **本项目为演示项目，仅供 Sepolia 测试网使用，请勿用于主网或发送真实资产。**
2. 所有密钥在本地设备生成和存储，从未上传至任何服务器。参考 Token Core 安全标准实现。
3. 安全审查参考 Token UI Security 材料实现，但不构成投资建议或安全保证。
4. Passkey 使用 WebAuthn API 实现，依赖设备生物识别能力。Passkey 丢失可能导致无法恢复访问，建议同时备份助记词。
5. 交易模拟为本地模拟，不代表实际链上执行结果。
6. 所有演示交易均在 Sepolia 测试网执行，不涉及真实资产。
7. 代码开源，欢迎审计。使用者需自行承担使用风险。

---

## 📌 本地运行命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

---

## 📌 Vercel 免费部署步骤

1. 访问 https://vercel.com 并登录
2. 点击 "Add New Project"
3. 导入 GitHub 仓库: https://github.com/5fe33d/ooo
4. Framework Preset 选择 "Vite"
5. Root Directory 设置为 `/`（默认即可）
6. 点击 "Deploy"
7. 等待部署完成，获取公开访问链接

**环境变量**（可选，有默认值）:
- `VITE_SEPOLIA_RPC`: Sepolia RPC URL
- `VITE_LIDO_CONTRACT`: Lido 合约地址
- `VITE_UNISWAP_ROUTER`: Uniswap Router 合约地址

---
