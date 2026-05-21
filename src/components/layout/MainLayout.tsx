import { useAppStore } from '@/store'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { IntentEngine } from '@/components/ai/IntentEngine'
import { OperationsPanel } from '@/components/operations/OperationsPanel'
import { SecurityCenter } from '@/components/security/SecurityCenter'
import { HistoryView } from '@/components/dashboard/HistoryView'
import { formatAddress, getExplorerUrl } from '@/lib/wallet'
import { SEPOLIA_CONFIG } from '@/types'
import { useState } from 'react'

type TabId = 'dashboard' | 'intent' | 'operations' | 'security' | 'history'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'dashboard', label: '仪表盘', icon: '📊' },
  { id: 'intent', label: 'AI 意图', icon: '🤖' },
  { id: 'operations', label: '操作', icon: '⚡' },
  { id: 'security', label: '安全', icon: '🛡️' },
  { id: 'history', label: '历史', icon: '📜' },
]

export function MainLayout() {
  const wallet = useAppStore((s) => s.wallet)
  const setWallet = useAppStore((s) => s.setWallet)
  const setNotification = useAppStore((s) => s.setNotification)
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleDisconnect = () => {
    setWallet(null)
    setNotification({ type: 'info', message: '钱包已断开连接' })
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />
      case 'intent': return <IntentEngine />
      case 'operations': return <OperationsPanel />
      case 'security': return <SecurityCenter />
      case 'history': return <HistoryView />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-sovereign-bg/90 backdrop-blur-xl border-b border-sovereign-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <span className="text-lg">🏛️</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gradient">主权枢纽</h1>
              <p className="text-[10px] text-gray-500">Sovereign Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sovereign-card border border-sovereign-border">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-gray-300">{SEPOLIA_CONFIG.name}</span>
            </div>

            <a
              href={wallet ? getExplorerUrl(wallet.address, 'address') : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sovereign-card border border-sovereign-border hover:border-primary-500/50 transition-colors"
            >
              <span className="text-xs font-mono text-primary-300">
                {wallet ? formatAddress(wallet.address) : ''}
              </span>
              <span className="text-xs text-gray-500">↗</span>
            </a>

            <button
              onClick={handleDisconnect}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1"
            >
              断开
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-16 z-30 bg-sovereign-bg/90 backdrop-blur-xl border-b border-sovereign-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-sovereign-card'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-sovereign-border py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-600">
            ⚠ 演示项目，仅供 Sepolia 测试网使用 | imToken 10周年 AI共创
          </p>
          <p className="text-xs text-gray-600">
            参考材料: Token Core · Token UI · Security Materials
          </p>
        </div>
      </footer>
    </div>
  )
}
