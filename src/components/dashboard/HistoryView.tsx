import { useAppStore } from '@/store'
import { formatAddress, getExplorerUrl } from '@/lib/wallet'
import { EmptyState } from '@/components/common/Notification'

export function HistoryView() {
  const transactions = useAppStore((s) => s.transactions)
  const intents = useAppStore((s) => s.intents)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intent History */}
      <div className="glass-card p-6">
        <h2 className="section-title">意图历史</h2>
        {intents.length === 0 ? (
          <EmptyState icon="🤖" title="暂无意图记录" description="通过 AI 意图引擎创建您的第一个意图" />
        ) : (
          <div className="space-y-3">
            {intents.map((intent) => (
              <div key={intent.id} className="p-4 rounded-xl bg-sovereign-bg border border-sovereign-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {intent.parsed.action === 'stake' ? '🥩' :
                       intent.parsed.action === 'swap' ? '🔄' :
                       intent.parsed.action === 'send' ? '📤' :
                       intent.parsed.action === 'batch' ? '📦' :
                       intent.parsed.action === 'receive' ? '📥' : '❓'}
                    </span>
                    <span className="font-medium text-white">{intent.parsed.action.toUpperCase()}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    intent.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    intent.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    intent.status === 'executing' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {intent.status}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-1">{intent.parsed.description}</p>
                <p className="text-xs text-gray-500 mb-2">原始输入: "{intent.raw}"</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>安全分: {intent.securityScore}</span>
                  <span>风险: {intent.riskWarnings.length} 项</span>
                  <span>{new Date(intent.timestamp).toLocaleString('zh-CN')}</span>
                </div>
                {intent.txHash && (
                  <a
                    href={getExplorerUrl(intent.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-primary-400 hover:text-primary-300"
                  >
                    TX: {formatAddress(intent.txHash)} ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="glass-card p-6">
        <h2 className="section-title">交易记录</h2>
        {transactions.length === 0 ? (
          <EmptyState icon="📜" title="暂无交易记录" description="完成第一笔交易后将在此显示" />
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-sovereign-bg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {tx.type === 'stake' ? '🥩' : tx.type === 'swap' ? '🔄' : tx.type === 'send' ? '📤' : '📥'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{tx.type.toUpperCase()}</p>
                    <p className="text-xs text-gray-500">
                      {formatAddress(tx.from)} → {formatAddress(tx.to)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{tx.value} ETH</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${tx.status === 'confirmed' ? 'text-emerald-400' : tx.status === 'failed' ? 'text-red-400' : 'text-amber-400'}`}>
                      {tx.status === 'confirmed' ? '✓ 已确认' : tx.status === 'failed' ? '✕ 失败' : '⏳ 待确认'}
                    </span>
                    <a
                      href={getExplorerUrl(tx.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-400 hover:text-primary-300"
                    >
                      ↗
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
