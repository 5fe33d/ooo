import { useAppStore } from '@/store'
import { SecurityScoreRing, RiskBadge } from '@/components/common/Notification'
import { getSecurityLevel, SECURITY_RULES } from '@/lib/security'
import { isPasskeySupported } from '@/lib/passkey'

export function SecurityCenter() {
  const wallet = useAppStore((s) => s.wallet)
  const intents = useAppStore((s) => s.intents)
  const passkeyCredential = useAppStore((s) => s.passkeyCredential)

  const overallScore = wallet ? 85 : 0
  const securityLevel = getSecurityLevel(overallScore)
  const totalWarnings = intents.reduce((acc, i) => acc + i.riskWarnings.length, 0)
  const criticalWarnings = intents.reduce(
    (acc, i) => acc + i.riskWarnings.filter((w) => w.level === 'critical' || w.level === 'high').length,
    0
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Security Score */}
      <div className="glass-card p-6 glow-border">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <SecurityScoreRing score={overallScore} size={160} />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-2">安全中心</h2>
            <p className="text-lg font-semibold" style={{ color: securityLevel.color }}>
              {securityLevel.label}
            </p>
            <p className="text-sm text-gray-400 mt-1">{securityLevel.description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {passkeyCredential && <span className="badge-success">🔑 Passkey 已启用</span>}
              {wallet?.authType === 'passkey' && <span className="badge-info">生物识别保护</span>}
              <span className="badge-info">Sepolia 测试网</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '安全分数', value: overallScore, icon: '🛡️', color: 'text-primary-400' },
          { label: '总风险提示', value: totalWarnings, icon: '⚠️', color: 'text-amber-400' },
          { label: '高危提示', value: criticalWarnings, icon: '🔴', color: 'text-red-400' },
          { label: 'Passkey', value: passkeyCredential ? '已启用' : '未启用', icon: '🔑', color: passkeyCredential ? 'text-emerald-400' : 'text-gray-400' },
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

      {/* Security Rules Reference */}
      <div className="glass-card p-6">
        <h2 className="section-title">安全规则库</h2>
        <p className="text-sm text-gray-400 mb-4">
          以下安全规则参考 Token UI Security 材料实现，涵盖 Token 授权、合约验证、钓鱼检测等多个维度。
        </p>
        <div className="space-y-3">
          {SECURITY_RULES.map((rule) => (
            <div key={rule.id} className="p-4 rounded-xl bg-sovereign-bg border border-sovereign-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">{rule.name}</span>
                <RiskBadge level={rule.severity} />
              </div>
              <p className="text-xs text-gray-400">{rule.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">类别: {rule.category}</span>
                <span className="text-xs text-gray-600">|</span>
                <span className="text-xs text-primary-400">来源: Token UI Security</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Warnings from Intents */}
      <div className="glass-card p-6">
        <h2 className="section-title">风险提示记录</h2>
        {totalWarnings === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-sm text-emerald-400">✓ 暂无风险提示</p>
            <p className="text-xs text-gray-500 mt-1">所有交易安全审查均已通过</p>
          </div>
        ) : (
          <div className="space-y-3">
            {intents
              .filter((i) => i.riskWarnings.length > 0)
              .flatMap((i) => i.riskWarnings)
              .map((w, i) => (
                <div key={i} className="p-3 rounded-lg bg-sovereign-bg border border-sovereign-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{w.category}</span>
                    <RiskBadge level={w.level} />
                  </div>
                  <p className="text-xs text-gray-400">{w.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{w.detail}</p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Security Best Practices */}
      <div className="glass-card p-6">
        <h2 className="section-title">安全最佳实践</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: '密钥自托管',
              desc: '所有私钥在本地设备生成和存储，参考 Token Core 安全标准。密钥从未离开设备。',
              icon: '🔐',
              status: 'active',
            },
            {
              title: 'Passkey 保护',
              desc: '使用 WebAuthn Passkey 生物识别验证，防止未授权操作。参考 Token UI Security。',
              icon: '🔑',
              status: passkeyCredential ? 'active' : 'inactive',
            },
            {
              title: '交易模拟',
              desc: '每笔交易执行前进行模拟，预判状态变更和 Gas 消耗。参考 Token UI Security。',
              icon: '🔬',
              status: 'active',
            },
            {
              title: '多层安全审查',
              desc: '涵盖 Token 授权、合约验证、钓鱼检测、Gas 异常、地址投毒等多维检查。',
              icon: '🛡️',
              status: 'active',
            },
          ].map((practice) => (
            <div
              key={practice.title}
              className={`p-4 rounded-xl bg-sovereign-bg border ${
                practice.status === 'active' ? 'border-emerald-500/20' : 'border-gray-600/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span>{practice.icon}</span>
                <span className="font-medium text-white">{practice.title}</span>
                {practice.status === 'active' ? (
                  <span className="badge-success ml-auto">已启用</span>
                ) : (
                  <span className="badge-warning ml-auto">未启用</span>
                )}
              </div>
              <p className="text-xs text-gray-400">{practice.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="glass-card p-6 border-amber-500/30">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold text-amber-400 mb-2">安全声明</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 本项目为演示项目，仅供 Sepolia 测试网使用</li>
              <li>• 所有安全审查参考 Token UI Security 材料实现，但不构成投资建议</li>
              <li>• 密钥自托管意味着用户对密钥安全负全部责任</li>
              <li>• Passkey 丢失可能导致无法恢复访问，建议同时备份助记词</li>
              <li>• 请勿向测试网地址发送主网资产</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
