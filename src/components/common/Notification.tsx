import { useAppStore } from '@/store'
import type { RiskWarning } from '@/types'

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

export function Notification({ type, message }: NotificationProps) {
  const setNotification = useAppStore((s) => s.setNotification)

  const colors = {
    success: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
    error: 'bg-red-500/20 border-red-500/50 text-red-300',
    warning: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colors[type]} backdrop-blur-xl`}>
        <span className="text-lg">{icons[type]}</span>
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => setNotification(null)}
          className="ml-2 text-current opacity-60 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export function RiskBadge({ level }: { level: RiskWarning['level'] }) {
  const styles = {
    info: 'badge-info',
    low: 'badge-info',
    medium: 'badge-warning',
    high: 'badge-danger',
    critical: 'bg-red-600/30 text-red-300 border border-red-500/50',
  }
  const labels = { info: '信息', low: '低风险', medium: '中风险', high: '高风险', critical: '极高风险' }

  return <span className={styles[level]}>{labels[level]}</span>
}

export function SecurityScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getColor = (s: number) => {
    if (s >= 90) return '#10b981'
    if (s >= 75) return '#22c55e'
    if (s >= 60) return '#f59e0b'
    if (s >= 40) return '#ef4444'
    return '#dc2626'
  }

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color: getColor(score) }}>
          {score}
        </span>
        <span className="text-xs text-gray-400">安全分</span>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`${sizes[size]} animate-spin`}>
      <div className="w-full h-full rounded-full border-2 border-sovereign-border border-t-primary-500" />
    </div>
  )
}

export function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs">{description}</p>
    </div>
  )
}
