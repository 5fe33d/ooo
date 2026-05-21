// Transaction Simulation Engine
// Simulates transaction execution before actual signing

import type { SimulateResult } from '@/types'

export async function simulateTransaction(
  action: string,
  params: Record<string, unknown>
): Promise<SimulateResult> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500))

  const warnings: string[] = []
  const stateChanges: string[] = []

  switch (action) {
    case 'stake': {
      const amount = params.amount as string
      const protocol = params.protocol as string
      stateChanges.push(`ETH: -${amount}`)
      stateChanges.push(`stETH: +${amount} (via ${protocol})`)
      if (parseFloat(amount) > 1) {
        warnings.push('大额质押，请确认质押锁定期')
      }
      break
    }
    case 'unstake': {
      const amount = params.amount as string
      stateChanges.push(`stETH: -${amount}`)
      stateChanges.push(`ETH: +${amount} (unstaking)`)
      warnings.push('取消质押可能需要等待解锁期')
      break
    }
    case 'swap': {
      const amount = params.amount as string
      const token = params.token as string
      stateChanges.push(`${token}: -${amount}`)
      stateChanges.push(`Target Token: +estimated amount`)
      warnings.push('兑换价格可能因滑点而变化')
      break
    }
    case 'send': {
      const amount = params.amount as string
      const token = params.token as string
      const recipient = params.recipient as string
      stateChanges.push(`${token}: -${amount}`)
      stateChanges.push(`Recipient ${recipient}: +${amount}`)
      break
    }
    case 'batch': {
      const ops = params.operations as unknown[]
      stateChanges.push(`Batch: ${ops?.length || 0} operations`)
      warnings.push('批量操作中任一失败可能导致整体回滚')
      break
    }
    default:
      warnings.push('未知操作类型，无法模拟')
  }

  // Random simulation success (95% success rate for demo)
  const success = Math.random() > 0.05

  return {
    success,
    gasEstimate: estimateGasForSimulation(action),
    stateChanges,
    warnings,
    error: success ? undefined : '模拟执行失败：Gas 不足或合约异常',
  }
}

function estimateGasForSimulation(action: string): string {
  const estimates: Record<string, string> = {
    stake: '0.002 - 0.005 ETH',
    unstake: '0.003 - 0.006 ETH',
    swap: '0.004 - 0.008 ETH',
    send: '0.001 - 0.002 ETH',
    batch: '0.008 - 0.015 ETH',
    bridge: '0.01 - 0.02 ETH',
  }
  return estimates[action] || '0.001 - 0.003 ETH'
}
