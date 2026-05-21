export interface WalletState {
  address: string
  publicKey?: string
  mnemonic?: string
  createdAt: number
  authType: 'passkey' | 'mnemonic' | 'import'
  chainId: number
  balance: string
}

export interface IntentResult {
  id: string
  raw: string
  parsed: ParsedIntent
  timestamp: number
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed'
  txHash?: string
  securityScore: number
  riskWarnings: RiskWarning[]
}

export interface ParsedIntent {
  action: IntentAction
  params: IntentParams
  description: string
  estimatedGas: string
  requiresApproval: boolean
}

export type IntentAction =
  | 'stake'
  | 'unstake'
  | 'swap'
  | 'send'
  | 'receive'
  | 'batch'
  | 'bridge'
  | 'unknown'

export interface IntentParams {
  token?: string
  amount?: string
  recipient?: string
  protocol?: string
  slippage?: number
  memo?: string
  operations?: BatchOperation[]
}

export interface BatchOperation {
  action: IntentAction
  params: IntentParams
}

export interface RiskWarning {
  level: 'info' | 'low' | 'medium' | 'high' | 'critical'
  category: string
  message: string
  detail: string
  source: string
}

export interface SecurityAudit {
  id: string
  intentId: string
  score: number
  checks: SecurityCheck[]
  passed: boolean
  timestamp: number
}

export interface SecurityCheck {
  name: string
  category: string
  status: 'pass' | 'warn' | 'fail'
  message: string
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
}

export interface TransactionRecord {
  id: string
  type: IntentAction
  hash: string
  from: string
  to: string
  value: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  blockNumber?: number
  gasUsed?: string
}

export interface DashboardData {
  totalBalance: string
  securityScore: number
  activeIntents: number
  completedTransactions: number
  recentActivity: TransactionRecord[]
  assetBreakdown: AssetItem[]
}

export interface AssetItem {
  symbol: string
  name: string
  balance: string
  value: string
  change24h: string
  icon: string
}

export interface PasskeyCredential {
  id: string
  publicKey: string
  counter: number
  createdAt: number
}

export interface SimulateResult {
  success: boolean
  gasEstimate: string
  stateChanges: string[]
  warnings: string[]
  error?: string
}

export const SEPOLIA_CONFIG = {
  chainId: 11155111,
  name: 'Sepolia Testnet',
  rpcUrl: 'https://rpc.sepolia.org',
  blockExplorer: 'https://sepolia.etherscan.io',
  nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
  lidoContract: '0x3e7e93c24F00B7f3C4B6e6eE7a5f1F3eB1DdA1D5',
  uniswapRouter: '0x3bFA4769FB09e8C5a0Edb1E0D2e60191D6d3C5e1',
} as const

export const SUPPORTED_TOKENS: AssetItem[] = [
  { symbol: 'ETH', name: 'Ethereum', balance: '0', value: '0', change24h: '+0.00%', icon: '⟠' },
  { symbol: 'USDC', name: 'USD Coin', balance: '0', value: '0', change24h: '+0.01%', icon: '💵' },
  { symbol: 'USDT', name: 'Tether', balance: '0', value: '0', change24h: '+0.00%', icon: '₮' },
  { symbol: 'WBTC', name: 'Wrapped BTC', balance: '0', value: '0', change24h: '+1.23%', icon: '₿' },
  { symbol: 'stETH', name: 'Lido Staked ETH', balance: '0', value: '0', change24h: '+0.05%', icon: '🥩' },
  { symbol: 'DAI', name: 'Dai Stablecoin', balance: '0', value: '0', change24h: '+0.00%', icon: '◆' },
]
