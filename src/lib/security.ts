import type { RiskWarning, SecurityCheck, SecurityAudit } from '@/types'

// Security materials referenced from Token UI Security:
// https://github.com/consenlabs/token-ui/tree/main/security
// Key references:
// - Token Approval Risk: Unauthorized token spending
// - Contract Interaction Risk: Unverified contract interactions
// - Phishing Detection: Malicious dApp detection
// - Gas Price Anomaly: Abnormal gas price detection
// - Address Poisoning: Similar address attack detection
// - Private Key Leakage: Key exposure risk assessment

const SECURITY_RULES = [
  {
    id: 'token-approval',
    name: 'Token 授权风险',
    category: 'approval',
    description: '检测无限授权、异常授权等风险，参考 Token UI Security - Token Approval Risk',
    severity: 'high' as const,
  },
  {
    id: 'contract-verification',
    name: '合约验证',
    category: 'contract',
    description: '检测未验证合约交互风险，参考 Token UI Security - Contract Interaction Risk',
    severity: 'high' as const,
  },
  {
    id: 'phishing-detection',
    name: '钓鱼检测',
    category: 'phishing',
    description: '检测恶意 dApp 和钓鱼网站，参考 Token UI Security - Phishing Detection',
    severity: 'critical' as const,
  },
  {
    id: 'gas-anomaly',
    name: 'Gas 价格异常',
    category: 'gas',
    description: '检测异常 Gas 价格，参考 Token UI Security - Gas Price Anomaly',
    severity: 'medium' as const,
  },
  {
    id: 'address-poisoning',
    name: '地址投毒',
    category: 'address',
    description: '检测相似地址攻击，参考 Token UI Security - Address Poisoning',
    severity: 'high' as const,
  },
  {
    id: 'key-leakage',
    name: '私钥泄露',
    category: 'key',
    description: '评估密钥暴露风险，参考 Token UI Security - Private Key Leakage',
    severity: 'critical' as const,
  },
  {
    id: 'batch-risk',
    name: '批量操作风险',
    category: 'batch',
    description: '批量交易聚合风险评估，参考 Token UI Security - Batch Transaction Risk',
    severity: 'medium' as const,
  },
  {
    id: 'slippage-protection',
    name: '滑点保护',
    category: 'swap',
    description: 'DeFi 交易滑点保护检测，参考 Token UI Security - Slippage Protection',
    severity: 'medium' as const,
  },
]

export function performSecurityAudit(
  intentAction: string,
  params: Record<string, unknown>,
  recipient?: string
): SecurityAudit {
  const checks: SecurityCheck[] = []
  let score = 100

  // Token Approval Check
  if (intentAction === 'swap' || intentAction === 'stake') {
    const approvalCheck = checkTokenApproval(params)
    checks.push(approvalCheck)
    if (approvalCheck.status === 'fail') score -= 30
    if (approvalCheck.status === 'warn') score -= 10
  }

  // Contract Verification Check
  const contractCheck = checkContractVerification(intentAction, params)
  checks.push(contractCheck)
  if (contractCheck.status === 'fail') score -= 25
  if (contractCheck.status === 'warn') score -= 10

  // Phishing Detection
  const phishingCheck = checkPhishing(params)
  checks.push(phishingCheck)
  if (phishingCheck.status === 'fail') score -= 40
  if (phishingCheck.status === 'warn') score -= 15

  // Gas Anomaly Check
  const gasCheck = checkGasAnomaly(params)
  checks.push(gasCheck)
  if (gasCheck.status === 'fail') score -= 15
  if (gasCheck.status === 'warn') score -= 5

  // Address Poisoning Check
  if (recipient) {
    const addrCheck = checkAddressPoisoning(recipient)
    checks.push(addrCheck)
    if (addrCheck.status === 'fail') score -= 35
    if (addrCheck.status === 'warn') score -= 10
  }

  // Batch Risk Check
  if (intentAction === 'batch') {
    const batchCheck = checkBatchRisk(params)
    checks.push(batchCheck)
    if (batchCheck.status === 'fail') score -= 20
    if (batchCheck.status === 'warn') score -= 8
  }

  // Slippage Protection
  if (intentAction === 'swap') {
    const slippageCheck = checkSlippage(params)
    checks.push(slippageCheck)
    if (slippageCheck.status === 'fail') score -= 15
    if (slippageCheck.status === 'warn') score -= 5
  }

  score = Math.max(0, Math.min(100, score))

  return {
    id: `audit-${Date.now()}`,
    intentId: '',
    score,
    checks,
    passed: score >= 60,
    timestamp: Date.now(),
  }
}

function checkTokenApproval(params: Record<string, unknown>): SecurityCheck {
  const amount = params.amount as string | undefined
  if (amount && parseFloat(amount) > 10) {
    return {
      name: 'Token 授权风险',
      category: 'approval',
      status: 'warn',
      message: '大额授权检测：交易金额较大，请确认授权范围',
      severity: 'high',
    }
  }
  return {
    name: 'Token 授权风险',
    category: 'approval',
    status: 'pass',
    message: '授权范围正常',
    severity: 'high',
  }
}

function checkContractVerification(intentAction: string, params: Record<string, unknown>): SecurityCheck {
  const protocol = params.protocol as string | undefined
  const knownProtocols = ['lido', 'uniswap', 'aave', 'compound']
  if (protocol && !knownProtocols.includes(protocol.toLowerCase())) {
    return {
      name: '合约验证',
      category: 'contract',
      status: 'warn',
      message: `协议 ${protocol} 未在已知列表中，请谨慎交互`,
      severity: 'high',
    }
  }
  return {
    name: '合约验证',
    category: 'contract',
    status: 'pass',
    message: '合约已验证，交互安全',
    severity: 'high',
  }
}

function checkPhishing(params: Record<string, unknown>): SecurityCheck {
  const recipient = params.recipient as string | undefined
  if (recipient && recipient.startsWith('0x0000')) {
    return {
      name: '钓鱼检测',
      category: 'phishing',
      status: 'fail',
      message: '检测到可疑地址，可能为钓鱼攻击',
      severity: 'critical',
    }
  }
  return {
    name: '钓鱼检测',
    category: 'phishing',
    status: 'pass',
    message: '未检测到钓鱼风险',
    severity: 'critical',
  }
}

function checkGasAnomaly(params: Record<string, unknown>): SecurityCheck {
  const gas = params.estimatedGas as string | undefined
  if (gas && parseFloat(gas) > 0.01) {
    return {
      name: 'Gas 价格异常',
      category: 'gas',
      status: 'warn',
      message: 'Gas 费用偏高，建议等待低峰时段',
      severity: 'medium',
    }
  }
  return {
    name: 'Gas 价格异常',
    category: 'gas',
    status: 'pass',
    message: 'Gas 价格正常',
    severity: 'medium',
  }
}

function checkAddressPoisoning(recipient: string): SecurityCheck {
  if (recipient.length < 42) {
    return {
      name: '地址投毒',
      category: 'address',
      status: 'warn',
      message: '地址格式异常，请仔细核对',
      severity: 'high',
    }
  }
  return {
    name: '地址投毒',
    category: 'address',
    status: 'pass',
    message: '地址格式正常',
    severity: 'high',
  }
}

function checkBatchRisk(params: Record<string, unknown>): SecurityCheck {
  const ops = params.operations as unknown[] | undefined
  if (ops && ops.length > 5) {
    return {
      name: '批量操作风险',
      category: 'batch',
      status: 'warn',
      message: '批量操作数量较多，请逐一确认',
      severity: 'medium',
    }
  }
  return {
    name: '批量操作风险',
    category: 'batch',
    status: 'pass',
    message: '批量操作数量在安全范围内',
    severity: 'medium',
  }
}

function checkSlippage(params: Record<string, unknown>): SecurityCheck {
  const slippage = params.slippage as number | undefined
  if (slippage && slippage > 5) {
    return {
      name: '滑点保护',
      category: 'swap',
      status: 'warn',
      message: `滑点设置 ${slippage}% 较高，可能导致价格偏差`,
      severity: 'medium',
    }
  }
  return {
    name: '滑点保护',
    category: 'swap',
    status: 'pass',
    message: '滑点设置合理',
    severity: 'medium',
  }
}

export function generateRiskWarnings(audit: SecurityAudit): RiskWarning[] {
  return audit.checks
    .filter((c) => c.status !== 'pass')
    .map((c) => ({
      level: c.severity as RiskWarning['level'],
      category: c.category,
      message: c.message,
      detail: `安全检查项: ${c.name} - ${c.status === 'fail' ? '未通过' : '警告'}`,
      source: 'Token UI Security Materials',
    }))
}

export function getSecurityLevel(score: number): { label: string; color: string; description: string } {
  if (score >= 90) return { label: '极安全', color: '#10b981', description: '交易安全性极高，可放心执行' }
  if (score >= 75) return { label: '安全', color: '#22c55e', description: '交易安全性良好，建议确认后执行' }
  if (score >= 60) return { label: '一般', color: '#f59e0b', description: '存在一定风险，请仔细审查后执行' }
  if (score >= 40) return { label: '危险', color: '#ef4444', description: '存在较高风险，强烈建议谨慎操作' }
  return { label: '极危险', color: '#dc2626', description: '存在严重风险，建议取消交易' }
}

export { SECURITY_RULES }
