import type { ParsedIntent, IntentAction, IntentParams, BatchOperation } from '@/types'

// AI Intent Engine - Natural Language to Structured Intent Parser
// This module simulates an AI Agent that parses natural language into actionable blockchain intents

interface IntentPattern {
  patterns: RegExp[]
  action: IntentAction
  extractParams: (match: RegExpMatchArray) => Partial<IntentParams>
}

const INTENT_PATTERNS: IntentPattern[] = [
  // Staking patterns
  {
    patterns: [
      /质押\s*(\d+\.?\d*)\s*(ETH|eth)\s*到\s*(Lido|lido)/i,
      /stake\s*(\d+\.?\d*)\s*(ETH|eth)\s*(on|to|in)\s*(Lido|lido)/i,
      /把\s*(\d+\.?\d*)\s*(ETH|eth)\s*质押/i,
    ],
    action: 'stake',
    extractParams: (match) => ({
      amount: match[1],
      token: match[2].toUpperCase(),
      protocol: match[3] || 'Lido',
    }),
  },
  // Unstaking patterns
  {
    patterns: [
      /取消质押\s*(\d+\.?\d*)\s*(stETH|ETH|eth)/i,
      /unstake\s*(\d+\.?\d*)\s*(stETH|ETH|eth)/i,
      /赎回\s*(\d+\.?\d*)\s*(stETH|ETH)/i,
    ],
    action: 'unstake',
    extractParams: (match) => ({
      amount: match[1],
      token: match[2].toUpperCase(),
      protocol: 'Lido',
    }),
  },
  // Swap patterns
  {
    patterns: [
      /把\s*(\d+\.?\d*)\s*(ETH|USDC|USDT|WBTC|DAI)\s*(?:换成|兑换|swap)\s*(ETH|USDC|USDT|WBTC|DAI)/i,
      /swap\s*(\d+\.?\d*)\s*(ETH|USDC|USDT|WBTC|DAI)\s*(?:for|to)\s*(ETH|USDC|USDT|WBTC|DAI)/i,
      /兑换\s*(\d+\.?\d*)\s*(ETH|USDC|USDT|WBTC|DAI)\s*(?:为|到)\s*(ETH|USDC|USDT|WBTC|DAI)/i,
    ],
    action: 'swap',
    extractParams: (match) => ({
      amount: match[1],
      token: match[2].toUpperCase(),
      protocol: 'Uniswap',
      slippage: 0.5,
    }),
  },
  // Send patterns
  {
    patterns: [
      /(?:发送|转账|转|send)\s*(\d+\.?\d*)\s*(ETH|USDC|USDT)\s*(?:给|to)\s*(.+)/i,
      /给\s*(.+)\s*(?:转|发送)\s*(\d+\.?\d*)\s*(ETH|USDC|USDT)/i,
    ],
    action: 'send',
    extractParams: (match) => ({
      amount: match[1],
      token: match[2]?.toUpperCase() || match[4]?.toUpperCase(),
      recipient: match[3] || match[1],
      memo: '',
    }),
  },
  // Receive patterns
  {
    patterns: [
      /(?:收款|收付款|receive|收款码)/i,
    ],
    action: 'receive',
    extractParams: () => ({}),
  },
  // Batch patterns
  {
    patterns: [
      /批量\s*(.+)/i,
      /batch\s*(.+)/i,
      /同时\s*(.+)/i,
    ],
    action: 'batch',
    extractParams: (match) => ({
      operations: parseBatchOperations(match[1]),
    }),
  },
  // Complex multi-step intent
  {
    patterns: [
      /把\s*(\d+\.?\d*)\s*(ETH|eth)\s*质押到\s*(Lido|lido)\s*并把收益转给\s*(.+)/i,
    ],
    action: 'batch',
    extractParams: (match) => ({
      operations: [
        { action: 'stake', params: { amount: match[1], token: match[2].toUpperCase(), protocol: match[3] } },
        { action: 'send', params: { amount: '收益', token: 'stETH', recipient: match[4] } },
      ],
    }),
  },
]

function parseBatchOperations(text: string): BatchOperation[] {
  const ops: BatchOperation[] = []
  const parts = text.split(/[，,、并且and]/)
  for (const part of parts) {
    const parsed = parseIntent(part.trim())
    if (parsed.action !== 'unknown') {
      ops.push({ action: parsed.action, params: parsed.params })
    }
  }
  return ops
}

export function parseIntent(input: string): ParsedIntent {
  const trimmed = input.trim()
  if (!trimmed) {
    return {
      action: 'unknown',
      params: {},
      description: '请输入您的意图',
      estimatedGas: '0',
      requiresApproval: false,
    }
  }

  for (const pattern of INTENT_PATTERNS) {
    for (const regex of pattern.patterns) {
      const match = trimmed.match(regex)
      if (match) {
        const params = pattern.extractParams(match)
        const description = generateDescription(pattern.action, params)
        const estimatedGas = estimateGasForAction(pattern.action)
        const requiresApproval = ['stake', 'swap'].includes(pattern.action)

        return {
          action: pattern.action,
          params,
          description,
          estimatedGas,
          requiresApproval,
        }
      }
    }
  }

  return {
    action: 'unknown',
    params: {},
    description: `无法解析意图: "${trimmed}"。请尝试如: "质押 0.3 ETH 到 Lido" 或 "把 1 ETH 换成 USDC"`,
    estimatedGas: '0',
    requiresApproval: false,
  }
}

function generateDescription(action: IntentAction, params: Partial<IntentParams>): string {
  switch (action) {
    case 'stake':
      return `质押 ${params.amount || '?'} ${params.token || 'ETH'} 到 ${params.protocol || 'Lido'} 协议`
    case 'unstake':
      return `从 ${params.protocol || 'Lido'} 取回 ${params.amount || '?'} ${params.token || 'stETH'}`
    case 'swap':
      return `在 ${params.protocol || 'Uniswap'} 上兑换 ${params.amount || '?'} ${params.token || 'ETH'}`
    case 'send':
      return `发送 ${params.amount || '?'} ${params.token || 'ETH'} 到 ${params.recipient || '指定地址'}`
    case 'receive':
      return '生成收款二维码和地址'
    case 'batch':
      return `批量执行 ${params.operations?.length || 0} 个操作`
    case 'bridge':
      return '跨链桥接资产'
    default:
      return '未知操作'
  }
}

function estimateGasForAction(action: IntentAction): string {
  const gasEstimates: Record<IntentAction, string> = {
    stake: '0.002',
    unstake: '0.003',
    swap: '0.004',
    send: '0.001',
    receive: '0',
    batch: '0.008',
    bridge: '0.01',
    unknown: '0',
  }
  return gasEstimates[action] || '0'
}

export function getIntentSuggestions(): string[] {
  return [
    '质押 0.3 ETH 到 Lido',
    '把 1 ETH 换成 USDC',
    '发送 0.5 ETH 给 0x1234...5678',
    '取消质押 0.5 stETH',
    '批量：质押 0.3 ETH 到 Lido 并把收益转给我朋友',
    '收款',
  ]
}

export function validateIntent(intent: ParsedIntent): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (intent.action === 'unknown') {
    errors.push('无法识别的操作类型')
  }

  if (['stake', 'unstake', 'swap', 'send'].includes(intent.action)) {
    if (!intent.params.amount || parseFloat(intent.params.amount) <= 0) {
      errors.push('金额必须大于 0')
    }
  }

  if (intent.action === 'send' && !intent.params.recipient) {
    errors.push('必须指定收款地址')
  }

  if (intent.action === 'batch' && (!intent.params.operations || intent.params.operations.length === 0)) {
    errors.push('批量操作必须包含至少一个子操作')
  }

  return { valid: errors.length === 0, errors }
}
