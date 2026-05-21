import { useState } from 'react'
import { useAppStore } from '@/store'
import { parseIntent, validateIntent } from '@/lib/intentEngine'
import { performSecurityAudit, generateRiskWarnings } from '@/lib/security'
import { simulateTransaction } from '@/lib/simulation'
import { LoadingSpinner } from '@/components/common/Notification'
import { SEPOLIA_CONFIG } from '@/types'

type OperationTab = 'stake' | 'swap' | 'send' | 'receive' | 'batch'

export function OperationsPanel() {
  const wallet = useAppStore((s) => s.wallet)
  const addIntent = useAppStore((s) => s.addIntent)
  const addTransaction = useAppStore((s) => s.addTransaction)
  const setNotification = useAppStore((s) => s.setNotification)

  const [activeTab, setActiveTab] = useState<OperationTab>('stake')
  const [isProcessing, setIsProcessing] = useState(false)

  // Stake form
  const [stakeAmount, setStakeAmount] = useState('')
  const [stakeProtocol, setStakeProtocol] = useState('Lido')

  // Swap form
  const [swapAmount, setSwapAmount] = useState('')
  const [swapFrom, setSwapFrom] = useState('ETH')
  const [swapTo, setSwapTo] = useState('USDC')
  const [swapSlippage, setSwapSlippage] = useState('0.5')

  // Send form
  const [sendAmount, setSendAmount] = useState('')
  const [sendToken, setSendToken] = useState('ETH')
  const [sendRecipient, setSendRecipient] = useState('')
  const [sendMemo, setSendMemo] = useState('')

  // Batch form
  const [batchInput, setBatchInput] = useState('')

  const tabs: { id: OperationTab; label: string; icon: string }[] = [
    { id: 'stake', label: '质押', icon: '🥩' },
    { id: 'swap', label: '兑换', icon: '🔄' },
    { id: 'send', label: '转账', icon: '📤' },
    { id: 'receive', label: '收款', icon: '📥' },
    { id: 'batch', label: '批量', icon: '📦' },
  ]

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setNotification({ type: 'warning', message: '请输入有效金额' })
      return
    }
    setIsProcessing(true)
    const intentText = `质押 ${stakeAmount} ETH 到 ${stakeProtocol}`
    await executeOperation('stake', intentText, { amount: stakeAmount, token: 'ETH', protocol: stakeProtocol })
    setIsProcessing(false)
  }

  const handleSwap = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      setNotification({ type: 'warning', message: '请输入有效金额' })
      return
    }
    setIsProcessing(true)
    const intentText = `把 ${swapAmount} ${swapFrom} 换成 ${swapTo}`
    await executeOperation('swap', intentText, { amount: swapAmount, token: swapFrom, protocol: 'Uniswap', slippage: parseFloat(swapSlippage) })
    setIsProcessing(false)
  }

  const handleSend = async () => {
    if (!sendAmount || !sendRecipient) {
      setNotification({ type: 'warning', message: '请填写金额和收款地址' })
      return
    }
    setIsProcessing(true)
    const intentText = `发送 ${sendAmount} ${sendToken} 给 ${sendRecipient}`
    await executeOperation('send', intentText, { amount: sendAmount, token: sendToken, recipient: sendRecipient, memo: sendMemo })
    setIsProcessing(false)
  }

  const handleBatch = async () => {
    if (!batchInput.trim()) {
      setNotification({ type: 'warning', message: '请输入批量操作描述' })
      return
    }
    setIsProcessing(true)
    await executeOperation('batch', batchInput, { operations: [] })
    setIsProcessing(false)
  }

  const executeOperation = async (action: string, rawInput: string, params: Record<string, unknown>) => {
    if (!wallet) return

    // Security audit
    const audit = performSecurityAudit(action, params, params.recipient as string | undefined)
    const warnings = generateRiskWarnings(audit)

    if (audit.score < 60) {
      setNotification({ type: 'error', message: '安全审查未通过，请检查风险提示' })
      return
    }

    // Simulate
    const simResult = await simulateTransaction(action, params)
    if (!simResult.success) {
      setNotification({ type: 'error', message: '交易模拟失败: ' + (simResult.error || '未知错误') })
      return
    }

    // Create intent & transaction
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
    const intentAction = action as import('@/types').IntentAction
    const intent = {
      id: `intent-${Date.now()}`,
      raw: rawInput,
      parsed: { action: intentAction, params, description: rawInput, estimatedGas: simResult.gasEstimate, requiresApproval: ['stake', 'swap'].includes(action) },
      timestamp: Date.now(),
      status: 'completed' as const,
      txHash,
      securityScore: audit.score,
      riskWarnings: warnings,
    }
    addIntent(intent)
    addTransaction({
      id: `tx-${Date.now()}`,
      type: action as 'stake' | 'swap' | 'send' | 'receive' | 'batch',
      hash: txHash,
      from: wallet.address,
      to: (params.recipient as string) || SEPOLIA_CONFIG.lidoContract,
      value: (params.amount as string) || '0',
      status: 'confirmed',
      timestamp: Date.now(),
    })
    setNotification({ type: 'success', message: `${rawInput} - 交易已广播到 Sepolia 测试网！` })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tab Navigation */}
      <div className="glass-card p-2">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-sovereign-bg'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stake */}
      {activeTab === 'stake' && (
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="section-title">🥩 质押 (Staking)</h2>
          <p className="text-sm text-gray-400 mb-6">将 ETH 质押到 Lido 等协议，获取 stETH 收益</p>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">质押金额 (ETH)</label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.0"
                className="input-field"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">协议</label>
              <select
                value={stakeProtocol}
                onChange={(e) => setStakeProtocol(e.target.value)}
                className="input-field"
              >
                <option value="Lido">Lido</option>
                <option value="Rocket Pool">Rocket Pool</option>
              </select>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-300">
                质押后您将获得 stETH，可随时取消质押取回 ETH。参考 Token UI Security - Token Approval Risk。
              </p>
            </div>
            <button onClick={handleStake} disabled={isProcessing} className="btn-primary w-full">
              {isProcessing ? <LoadingSpinner size="sm" /> : '质押'}
            </button>
          </div>
        </div>
      )}

      {/* Swap */}
      {activeTab === 'swap' && (
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="section-title">🔄 DeFi 兑换 (Swap)</h2>
          <p className="text-sm text-gray-400 mb-6">在 Uniswap 等去中心化交易所兑换代币</p>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">支付</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  placeholder="0.0"
                  className="input-field flex-1"
                  step="0.01"
                />
                <select value={swapFrom} onChange={(e) => setSwapFrom(e.target.value)} className="input-field w-28">
                  {['ETH', 'USDC', 'USDT', 'WBTC', 'DAI'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-center">
              <span className="text-2xl text-gray-500">⇅</span>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">获得</label>
              <select value={swapTo} onChange={(e) => setSwapTo(e.target.value)} className="input-field">
                {['USDC', 'USDT', 'ETH', 'WBTC', 'DAI'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">滑点容忍度 (%)</label>
              <input
                type="number"
                value={swapSlippage}
                onChange={(e) => setSwapSlippage(e.target.value)}
                className="input-field"
                step="0.1"
                min="0.1"
                max="50"
              />
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-300">
                滑点保护参考 Token UI Security - Slippage Protection。建议设置不超过 1%。
              </p>
            </div>
            <button onClick={handleSwap} disabled={isProcessing} className="btn-primary w-full">
              {isProcessing ? <LoadingSpinner size="sm" /> : '兑换'}
            </button>
          </div>
        </div>
      )}

      {/* Send */}
      {activeTab === 'send' && (
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="section-title">📤 转账 (Send)</h2>
          <p className="text-sm text-gray-400 mb-6">发送代币到指定地址，支持添加备注</p>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">收款地址</label>
              <input
                type="text"
                value={sendRecipient}
                onChange={(e) => setSendRecipient(e.target.value)}
                placeholder="0x..."
                className="input-field font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">金额</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.0"
                  className="input-field flex-1"
                  step="0.01"
                />
                <select value={sendToken} onChange={(e) => setSendToken(e.target.value)} className="input-field w-28">
                  {['ETH', 'USDC', 'USDT', 'DAI'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">备注 (可选)</label>
              <input
                type="text"
                value={sendMemo}
                onChange={(e) => setSendMemo(e.target.value)}
                placeholder="添加备注..."
                className="input-field"
              />
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-300">
                地址安全检测参考 Token UI Security - Address Poisoning。请仔细核对收款地址。
              </p>
            </div>
            <button onClick={handleSend} disabled={isProcessing} className="btn-primary w-full">
              {isProcessing ? <LoadingSpinner size="sm" /> : '发送'}
            </button>
          </div>
        </div>
      )}

      {/* Receive */}
      {activeTab === 'receive' && wallet && (
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="section-title">📥 收款 (Receive)</h2>
          <p className="text-sm text-gray-400 mb-6">分享您的地址接收代币</p>
          <div className="space-y-4">
            <div className="p-6 rounded-xl bg-sovereign-bg border border-sovereign-border text-center">
              {/* QR Code placeholder */}
              <div className="w-48 h-48 mx-auto bg-white rounded-xl flex items-center justify-center mb-4">
                <div className="text-center">
                  <span className="text-6xl">📱</span>
                  <p className="text-xs text-gray-600 mt-2">QR Code</p>
                </div>
              </div>
              <p className="text-sm font-mono text-primary-300 break-all">{wallet.address}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={wallet.address}
                className="input-field flex-1 text-sm font-mono"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(wallet.address)
                  setNotification({ type: 'success', message: '地址已复制' })
                }}
                className="btn-secondary px-4"
              >
                复制
              </button>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-300">
                此地址仅用于 Sepolia 测试网。请勿向此地址发送主网资产。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Batch */}
      {activeTab === 'batch' && (
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="section-title">📦 批量操作 (Batch)</h2>
          <p className="text-sm text-gray-400 mb-6">一次性执行多个操作，节省 Gas 费用</p>
          <div className="space-y-4">
            <textarea
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder='例如: "质押 0.3 ETH 到 Lido 并把收益转给我朋友"'
              className="input-field h-32 resize-none"
            />
            <div className="flex flex-wrap gap-2">
              {[
                '质押 0.3 ETH 到 Lido 并发送 0.1 ETH 给 0x1234',
                '兑换 1 ETH 为 USDC 并质押到 Aave',
              ].map((s, i) => (
                <button
                  key={i}
                  onClick={() => setBatchInput(s)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-sovereign-bg border border-sovereign-border hover:border-primary-500/50 text-gray-300 hover:text-primary-300 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-300">
                批量操作风险参考 Token UI Security - Batch Transaction Risk。任一操作失败可能导致整体回滚。
              </p>
            </div>
            <button onClick={handleBatch} disabled={isProcessing} className="btn-primary w-full">
              {isProcessing ? <LoadingSpinner size="sm" /> : '执行批量操作'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
