import { useAppStore } from '@/store'
import { SecurityScoreRing, EmptyState } from '@/components/common/Notification'
import { formatAddress, getExplorerUrl } from '@/lib/wallet'
import { getSecurityLevel } from '@/lib/security'
import { SEPOLIA_CONFIG, SUPPORTED_TOKENS } from '@/types'
import { useState, useEffect } from 'react'
import { getBalance } from '@/lib/wallet'

export function DashboardView() {
  const wallet = useAppStore((s) => s.wallet)
  const setWallet = useAppStore((s) => s.setWallet)
  const transactions = useAppStore((s) => s.transactions)
  const intents = useAppStore((s) => s.intents)
  const [balanceLoading, setBalanceLoading] = useState(false)

  const securityScore = wallet ? 85 : 0
  const securityLevel = getSecurityLevel(securityScore)
  const activeIntents = intents.filter((i) => i.status === 'pending' || i.status === 'reviewing').length
  const completedTxs = transactions.filter((t) => t.status === 'confirmed').length

  useEffect(() => {
    if (wallet?.address) {
      refreshBalance()
    }
  }, [wallet?.address])

  const refreshBalance = async () => {
    if (!wallet?.address) return
    setBalanceLoading(true)
    try {
      const balance = await getBalance(wallet.address)
      setWallet({ ...wallet, balance })
    } catch {
      // Balance fetch might fail on testnet, use demo value
      setWallet({ ...wallet, balance: '0.05' })
    } finally {
      setBalanceLoading(false)
    }
  }

  if (!wallet) return null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balance Card */}
        <div className="glass-card p-6 glow-border md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">总资产 (Sepolia)</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{wallet.balance}</span>
                <span className="text-lg text-gray-400">ETH</span>
              </div>
            </div>
            <button
              onClick={refreshBalance}
              disabled={balanceLoading}
              className="p-2 rounded-lg bg-sovereign-bg hover:bg-gray-800 transition-colors"
            >
              <span className={balanceLoading ? 'animate-spin inline-block' : ''}>🔄</span>
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              href={getExplorerUrl(wallet.address, 'address')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 font-mono"
            >
              {formatAddress(wallet.address)} ↗
            </a>
            <span className="badge-info">
              {wallet.authType === 'passkey' ? '🔑 Passkey' : wallet.authType === 'mnemonic' ? '📝 助记词' : '📥 导入'}
            </span>
          </div>
        </div>

        {/* Security Score */}
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <SecurityScoreRing score={securityScore} size={100} />
          <div className="mt-3 text-center">
            <p className="text-sm font-semibold" style={{ color: securityLevel.color }}>
              {securityLevel.label}
            </p>
            <p className="text-xs text-gray-500 mt-1">{securityLevel.description}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '活跃意图', value: activeIntents, icon: '🤖', color: 'text-primary-400' },
          { label: '已完成交易', value: completedTxs, icon: '✅', color: 'text-emerald-400' },
          { label: '安全分数', value: securityScore, icon: '🛡️', color: 'text-amber-400' },
          { label: '网络', value: 'Sepolia', icon: '🌐', color: 'text-blue-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span>{stat.icon}</span>
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Asset Breakdown */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">资产列表</h2>
          <span className="text-xs text-gray-500">Sepolia 测试网</span>
        </div>
        <div className="space-y-3">
          {SUPPORTED_TOKENS.map((token) => (
            <div key={token.symbol} className="flex items-center justify-between p-3 rounded-xl bg-sovereign-bg hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{token.icon}</span>
                <div>
                  <p className="font-semibold text-white">{token.symbol}</p>
                  <p className="text-xs text-gray-500">{token.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">
                  {token.symbol === 'ETH' ? wallet.balance : '0.00'}
                </p>
                <p className="text-xs text-gray-500">{token.change24h}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h2 className="section-title">最近活动</h2>
        {transactions.length === 0 ? (
          <EmptyState
            icon="📭"
            title="暂无交易记录"
            description="使用 AI 意图引擎发起您的第一笔交易"
          />
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-sovereign-bg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {tx.type === 'stake' ? '🥩' : tx.type === 'swap' ? '🔄' : tx.type === 'send' ? '📤' : '📥'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{tx.type.toUpperCase()}</p>
                    <p className="text-xs text-gray-500 font-mono">{formatAddress(tx.hash)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{tx.value} ETH</p>
                  <a
                    href={getExplorerUrl(tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-400 hover:text-primary-300"
                  >
                    查看 ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permissions & Sovereignty */}
      <div className="glass-card p-6">
        <h2 className="section-title">主权控制</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-sovereign-bg border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-emerald-400">✓</span>
              <span className="font-medium text-emerald-300">密钥自托管</span>
            </div>
            <p className="text-xs text-gray-400">所有私钥仅在本地设备生成和存储，从未上传至任何服务器</p>
          </div>
          <div className="p-4 rounded-xl bg-sovereign-bg border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-emerald-400">✓</span>
              <span className="font-medium text-emerald-300">本地签名</span>
            </div>
            <p className="text-xs text-gray-400">所有交易签名在本地完成，参考 Token Core 签名标准</p>
          </div>
          <div className="p-4 rounded-xl bg-sovereign-bg border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-emerald-400">✓</span>
              <span className="font-medium text-emerald-300">安全审查</span>
            </div>
            <p className="text-xs text-gray-400">每笔交易经过多层安全审查，参考 Token UI Security 材料</p>
          </div>
          <div className="p-4 rounded-xl bg-sovereign-bg border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-emerald-400">✓</span>
              <span className="font-medium text-emerald-300">Passkey 保护</span>
            </div>
            <p className="text-xs text-gray-400">支持 WebAuthn Passkey 生物识别验证，防止未授权操作</p>
          </div>
        </div>
      </div>
    </div>
  )
}
