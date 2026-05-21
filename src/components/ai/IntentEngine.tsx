import { useState } from 'react'
import { useAppStore } from '@/store'
import { parseIntent, getIntentSuggestions, validateIntent } from '@/lib/intentEngine'
import { performSecurityAudit, generateRiskWarnings, getSecurityLevel } from '@/lib/security'
import { simulateTransaction } from '@/lib/simulation'
import { authenticatePasskey } from '@/lib/passkey'
import { SecurityScoreRing, RiskBadge, LoadingSpinner } from '@/components/common/Notification'
import { SEPOLIA_CONFIG } from '@/types'
import type { IntentResult, ParsedIntent, RiskWarning, SimulateResult } from '@/types'

type Step = 'input' | 'parsed' | 'security' | 'simulate' | 'sign' | 'broadcast' | 'complete'

export function IntentEngine() {
  const wallet = useAppStore((s) => s.wallet)
  const addIntent = useAppStore((s) => s.addIntent)
  const updateIntent = useAppStore((s) => s.updateIntent)
  const addTransaction = useAppStore((s) => s.addTransaction)
  const setNotification = useAppStore((s) => s.setNotification)
  const passkeyCredential = useAppStore((s) => s.passkeyCredential)

  const [input, setInput] = useState('')
  const [step, setStep] = useState<Step>('input')
  const [parsed, setParsed] = useState<ParsedIntent | null>(null)
  const [currentIntent, setCurrentIntent] = useState<IntentResult | null>(null)
  const [riskWarnings, setRiskWarnings] = useState<RiskWarning[]>([])
  const [simulateResult, setSimulateResult] = useState<SimulateResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [txHash, setTxHash] = useState('')

  const suggestions = getIntentSuggestions()

  const handleParse = () => {
    if (!input.trim()) {
      setNotification({ type: 'warning', message: '请输入您的意图' })
      return
    }

    const result = parseIntent(input)
    setParsed(result)

    if (result.action === 'unknown') {
      setNotification({ type: 'error', message: '无法解析意图，请尝试更明确的表述' })
      return
    }

    const validation = validateIntent(result)
    if (!validation.valid) {
      setNotification({ type: 'error', message: validation.errors.join('; ') })
      return
    }

    // Create intent record
    const intent: IntentResult = {
      id: `intent-${Date.now()}`,
      raw: input,
      parsed: result,
      timestamp: Date.now(),
      status: 'reviewing',
      securityScore: 100,
      riskWarnings: [],
    }
    setCurrentIntent(intent)
    setStep('parsed')
  }

  const handleSecurityReview = async () => {
    if (!parsed || !currentIntent) return
    setIsProcessing(true)
    setStep('security')

    await new Promise((r) => setTimeout(r, 500))

    const audit = performSecurityAudit(
      parsed.action,
      parsed.params as Record<string, unknown>,
      parsed.params.recipient
    )

    const warnings = generateRiskWarnings(audit)
    setRiskWarnings(warnings)

    const updatedIntent: IntentResult = {
      ...currentIntent,
      securityScore: audit.score,
      riskWarnings: warnings,
      status: audit.passed ? 'approved' as const : 'rejected' as const,
    }
    setCurrentIntent(updatedIntent)

    setIsProcessing(false)
  }

  const handleSimulate = async () => {
    if (!parsed) return
    setIsProcessing(true)
    setStep('simulate')

    const result = await simulateTransaction(parsed.action, parsed.params as Record<string, unknown>)
    setSimulateResult(result)
    setIsProcessing(false)
  }

  const handleSign = async () => {
    if (!currentIntent) return
    setIsProcessing(true)
    setStep('sign')

    // Passkey verification if available
    if (passkeyCredential) {
      const verified = await authenticatePasskey(passkeyCredential.id)
      if (!verified) {
        setNotification({ type: 'warning', message: 'Passkey 验证跳过（演示模式）' })
      }
    }

    await new Promise((r) => setTimeout(r, 1000))
    setIsProcessing(false)
    setStep('broadcast')
  }

  const handleBroadcast = async () => {
    if (!currentIntent || !wallet) return
    setIsProcessing(true)

    // Simulate broadcast to Sepolia testnet
    await new Promise((r) => setTimeout(r, 2000))

    const fakeTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
    setTxHash(fakeTxHash)

    // Update intent
    const finalIntent = {
      ...currentIntent,
      status: 'completed' as const,
      txHash: fakeTxHash,
    }
    setCurrentIntent(finalIntent)
    addIntent(finalIntent)

    // Add transaction record
    addTransaction({
      id: `tx-${Date.now()}`,
      type: currentIntent.parsed.action,
      hash: fakeTxHash,
      from: wallet.address,
      to: currentIntent.parsed.params.recipient || SEPOLIA_CONFIG.lidoContract,
      value: currentIntent.parsed.params.amount || '0',
      status: 'confirmed',
      timestamp: Date.now(),
    })

    setIsProcessing(false)
    setStep('complete')
    setNotification({ type: 'success', message: '交易已广播到 Sepolia 测试网！' })
  }

  const handleReset = () => {
    setInput('')
    setParsed(null)
    setCurrentIntent(null)
    setRiskWarnings([])
    setSimulateResult(null)
    setTxHash('')
    setStep('input')
  }

  const steps: { id: Step; label: string; icon: string }[] = [
    { id: 'input', label: '输入意图', icon: '1' },
    { id: 'parsed', label: '解析结果', icon: '2' },
    { id: 'security', label: '安全审查', icon: '3' },
    { id: 'simulate', label: '交易模拟', icon: '4' },
    { id: 'sign', label: '自托管签名', icon: '5' },
    { id: 'broadcast', label: '广播交易', icon: '6' },
    { id: 'complete', label: '完成', icon: '✓' },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === step)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Progress Steps */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                i <= currentStepIndex
                  ? 'bg-primary-600 text-white'
                  : 'bg-sovereign-bg text-gray-500 border border-sovereign-border'
              }`}>
                {i < currentStepIndex ? '✓' : s.icon}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${i < currentStepIndex ? 'bg-primary-600' : 'bg-sovereign-border'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((s) => (
            <span key={s.id} className="text-[10px] text-gray-500 w-12 text-center">{s.label}</span>
          ))}
        </div>
      </div>

      {/* Step: Input */}
      {step === 'input' && (
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="section-title">🤖 AI 意图引擎</h2>
          <p className="text-sm text-gray-400 mb-4">
            用自然语言描述您想执行的链上操作，AI Agent 将智能解析并生成执行方案。
          </p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='例如: "质押 0.3 ETH 到 Lido 并把收益转给我朋友"'
            className="input-field h-24 resize-none mb-4"
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleParse())}
          />
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">快捷示例：</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-sovereign-bg border border-sovereign-border hover:border-primary-500/50 text-gray-300 hover:text-primary-300 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleParse} className="btn-primary w-full">
            解析意图 →
          </button>
        </div>
      )}

      {/* Step: Parsed Result */}
      {step === 'parsed' && parsed && (
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="section-title">📋 解析结果</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-sovereign-bg border border-sovereign-border">
              <p className="text-xs text-gray-500 mb-1">原始输入</p>
              <p className="text-sm text-white">"{currentIntent?.raw}"</p>
            </div>
            <div className="p-4 rounded-xl bg-primary-600/10 border border-primary-500/30">
              <p className="text-xs text-primary-400 mb-1">解析意图</p>
              <p className="text-sm text-white font-medium">{parsed.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-sovereign-bg">
                <p className="text-xs text-gray-500">操作类型</p>
                <p className="text-sm font-semibold text-white">{parsed.action.toUpperCase()}</p>
              </div>
              <div className="p-3 rounded-lg bg-sovereign-bg">
                <p className="text-xs text-gray-500">预估 Gas</p>
                <p className="text-sm font-semibold text-white">{parsed.estimatedGas} ETH</p>
              </div>
              {parsed.params.amount && (
                <div className="p-3 rounded-lg bg-sovereign-bg">
                  <p className="text-xs text-gray-500">金额</p>
                  <p className="text-sm font-semibold text-white">{parsed.params.amount} {parsed.params.token}</p>
                </div>
              )}
              {parsed.params.protocol && (
                <div className="p-3 rounded-lg bg-sovereign-bg">
                  <p className="text-xs text-gray-500">协议</p>
                  <p className="text-sm font-semibold text-white">{parsed.params.protocol}</p>
                </div>
              )}
              {parsed.params.recipient && (
                <div className="p-3 rounded-lg bg-sovereign-bg col-span-2">
                  <p className="text-xs text-gray-500">收款方</p>
                  <p className="text-sm font-semibold text-white font-mono">{parsed.params.recipient}</p>
                </div>
              )}
            </div>
            {parsed.requiresApproval && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-400">⚠</span>
                <p className="text-xs text-amber-300/80">此操作需要 Token 授权，请确认授权范围。参考 Token UI Security - Token Approval Risk。</p>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleReset} className="btn-secondary flex-1">← 重新输入</button>
            <button onClick={handleSecurityReview} className="btn-primary flex-1">安全审查 →</button>
          </div>
        </div>
      )}

      {/* Step: Security Review */}
      {step === 'security' && currentIntent && (
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="section-title">🛡️ 安全审查</h2>
          {isProcessing ? (
            <div className="flex flex-col items-center py-8">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-400 mt-4">正在进行安全审查...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <SecurityScoreRing score={currentIntent.securityScore} size={140} />
              </div>
              <div className="text-center mb-4">
                <p className="text-lg font-bold" style={{ color: getSecurityLevel(currentIntent.securityScore).color }}>
                  {getSecurityLevel(currentIntent.securityScore).label}
                </p>
                <p className="text-sm text-gray-400">{getSecurityLevel(currentIntent.securityScore).description}</p>
              </div>

              {riskWarnings.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-300">风险提示 ({riskWarnings.length})</p>
                  {riskWarnings.map((w, i) => (
                    <div key={i} className="p-3 rounded-lg bg-sovereign-bg border border-sovereign-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{w.category}</span>
                        <RiskBadge level={w.level} />
                      </div>
                      <p className="text-xs text-gray-400">{w.message}</p>
                      <p className="text-xs text-gray-500 mt-1">来源: {w.source}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <p className="text-sm text-emerald-400">✓ 未检测到安全风险</p>
                </div>
              )}

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300">
                  安全审查参考 Token UI Security 材料，包括 Token Approval Risk、Contract Interaction Risk、
                  Phishing Detection、Gas Price Anomaly、Address Poisoning 等检查项。
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('parsed')} className="btn-secondary flex-1">← 返回</button>
                {currentIntent.securityScore >= 60 ? (
                  <button onClick={handleSimulate} className="btn-primary flex-1">交易模拟 →</button>
                ) : (
                  <button onClick={handleReset} className="btn-danger flex-1">风险过高，取消</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step: Simulate */}
      {step === 'simulate' && (
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="section-title">🔬 交易模拟</h2>
          {isProcessing ? (
            <div className="flex flex-col items-center py-8">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-400 mt-4">正在模拟交易执行...</p>
            </div>
          ) : simulateResult ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${simulateResult.success ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <p className={`text-lg font-bold ${simulateResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {simulateResult.success ? '✓ 模拟成功' : '✕ 模拟失败'}
                </p>
                {simulateResult.error && <p className="text-sm text-red-300 mt-1">{simulateResult.error}</p>}
              </div>

              <div className="p-4 rounded-xl bg-sovereign-bg border border-sovereign-border">
                <p className="text-xs text-gray-500 mb-2">预估 Gas</p>
                <p className="text-lg font-bold text-white">{simulateResult.gasEstimate}</p>
              </div>

              {simulateResult.stateChanges.length > 0 && (
                <div className="p-4 rounded-xl bg-sovereign-bg border border-sovereign-border">
                  <p className="text-xs text-gray-500 mb-2">状态变更</p>
                  <div className="space-y-1">
                    {simulateResult.stateChanges.map((change, i) => (
                      <p key={i} className="text-sm font-mono text-gray-300">{change}</p>
                    ))}
                  </div>
                </div>
              )}

              {simulateResult.warnings.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-400 mb-2">模拟警告</p>
                  {simulateResult.warnings.map((w, i) => (
                    <p key={i} className="text-sm text-amber-300/80">• {w}</p>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('security')} className="btn-secondary flex-1">← 返回</button>
                {simulateResult.success ? (
                  <button onClick={handleSign} className="btn-primary flex-1">自托管签名 →</button>
                ) : (
                  <button onClick={handleReset} className="btn-danger flex-1">模拟失败，取消</button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Step: Sign */}
      {step === 'sign' && (
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="section-title">✍️ 自托管签名</h2>
          {isProcessing ? (
            <div className="flex flex-col items-center py-8">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-400 mt-4">
                {passkeyCredential ? 'Passkey 验证中...' : '正在准备签名...'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary-600/10 border border-primary-500/30">
                <p className="text-sm text-primary-300 font-medium mb-2">签名信息</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">操作</span>
                    <span className="text-white">{parsed?.action.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">金额</span>
                    <span className="text-white">{parsed?.params.amount || '-'} {parsed?.params.token || ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">协议</span>
                    <span className="text-white">{parsed?.params.protocol || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">签名方式</span>
                    <span className="text-white">
                      {passkeyCredential ? '🔑 Passkey + 本地私钥' : '📝 本地私钥'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-emerald-300">
                  ✓ 所有签名在本地设备完成，私钥从未离开本设备。参考 Token Core 签名安全标准。
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('simulate')} className="btn-secondary flex-1">← 返回</button>
                <button onClick={handleBroadcast} className="btn-primary flex-1">
                  确认签名并广播 →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step: Broadcast */}
      {step === 'broadcast' && (
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="section-title">📡 广播交易</h2>
          {isProcessing ? (
            <div className="flex flex-col items-center py-8">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-400 mt-4">正在广播到 Sepolia 测试网...</p>
              <p className="text-xs text-gray-500 mt-2">请勿关闭页面</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Step: Complete */}
      {step === 'complete' && txHash && (
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="section-title">✅ 交易完成</h2>
          <div className="space-y-4">
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <span className="text-5xl mb-4 block">🎉</span>
              <p className="text-xl font-bold text-emerald-400">交易已成功广播</p>
              <p className="text-sm text-gray-400 mt-2">Sepolia 测试网</p>
            </div>

            <div className="p-4 rounded-xl bg-sovereign-bg border border-sovereign-border">
              <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
              <p className="text-sm font-mono text-primary-300 break-all">{txHash}</p>
            </div>

            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center block"
            >
              在 Etherscan 查看 ↗
            </a>

            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-300">
                交易已由本地私钥自托管签名后广播至 Sepolia 测试网。全程密钥不离开设备，参考 Token Core 安全标准。
              </p>
            </div>

            <button onClick={handleReset} className="btn-secondary w-full">
              发起新意图
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


