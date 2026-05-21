import { useState } from 'react'
import { useAppStore } from '@/store'
import { createRandomWallet, createWalletFromMnemonic, importWalletFromPrivateKey, validateMnemonic, validatePrivateKey, getBalance } from '@/lib/wallet'
import { createPasskey, isPasskeySupported } from '@/lib/passkey'
import type { WalletState } from '@/types'

export function WelcomeScreen() {
  const setWallet = useAppStore((s) => s.setWallet)
  const setPasskeyCredential = useAppStore((s) => s.setPasskeyCredential)
  const setNotification = useAppStore((s) => s.setNotification)
  const setLoading = useAppStore((s) => s.setLoading)
  const isLoading = useAppStore((s) => s.isLoading)

  const [mode, setMode] = useState<'select' | 'passkey' | 'mnemonic' | 'import'>('select')
  const [mnemonicDisplay, setMnemonicDisplay] = useState('')
  const [importKey, setImportKey] = useState('')
  const [passkeyUsername, setPasskeyUsername] = useState('')
  const [agreed, setAgreed] = useState(false)

  const handlePasskeyCreate = async () => {
    if (!passkeyUsername.trim()) {
      setNotification({ type: 'warning', message: '请输入用户名' })
      return
    }
    setLoading(true)
    try {
      const cred = await createPasskey(passkeyUsername)
      if (cred) {
        setPasskeyCredential(cred)
        const { wallet, mnemonic } = createRandomWallet()
        setMnemonicDisplay(mnemonic)
        const walletState: WalletState = {
          address: wallet.address,
          mnemonic,
          createdAt: Date.now(),
          authType: 'passkey',
          chainId: 11155111,
          balance: '0',
        }
        setWallet(walletState)
        setNotification({ type: 'success', message: 'Passkey 钱包创建成功！' })
      } else {
        setNotification({ type: 'error', message: 'Passkey 创建失败，请检查浏览器支持' })
      }
    } catch {
      setNotification({ type: 'error', message: 'Passkey 创建异常' })
    } finally {
      setLoading(false)
    }
  }

  const handleMnemonicCreate = () => {
    const { wallet, mnemonic } = createRandomWallet()
    setMnemonicDisplay(mnemonic)
    const walletState: WalletState = {
      address: wallet.address,
      mnemonic,
      createdAt: Date.now(),
      authType: 'mnemonic',
      chainId: 11155111,
      balance: '0',
    }
    setWallet(walletState)
    setNotification({ type: 'success', message: '助记词钱包创建成功！' })
  }

  const handleImport = () => {
    if (validatePrivateKey(importKey)) {
      const wallet = importWalletFromPrivateKey(importKey)
      const walletState: WalletState = {
        address: wallet.address,
        createdAt: Date.now(),
        authType: 'import',
        chainId: 11155111,
        balance: '0',
      }
      setWallet(walletState)
      setNotification({ type: 'success', message: '钱包导入成功！' })
    } else if (validateMnemonic(importKey)) {
      setNotification({ type: 'info', message: '助记词格式正确，正在导入...' })
      try {
        const { HDNodeWallet } = require('ethers')
        const w = HDNodeWallet.fromMnemonic({ phrase: importKey })
        const walletState: WalletState = {
          address: w.address,
          publicKey: w.publicKey,
          mnemonic: importKey,
          createdAt: Date.now(),
          authType: 'import',
          chainId: 11155111,
          balance: '0',
        }
        setWallet(walletState)
        setNotification({ type: 'success', message: '助记词钱包导入成功！' })
      } catch {
        setNotification({ type: 'error', message: '助记词导入失败' })
      }
    } else {
      setNotification({ type: 'error', message: '无效的私钥或助记词' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo & Title */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 mb-6 animate-pulse-glow">
            <span className="text-3xl">🏛️</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gradient mb-3">主权枢纽</h1>
          <p className="text-lg text-gray-400">Sovereign Hub</p>
          <p className="text-sm text-gray-500 mt-2">自托管意图枢纽 · AI Agent + Passkey + 多链场景</p>
          <div className="mt-3 inline-flex items-center gap-2 badge-info">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Sepolia 测试网
          </div>
        </div>

        {mode === 'select' && (
          <div className="space-y-4 animate-slide-up">
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-4">创建 / 导入钱包</h2>
              <div className="space-y-3">
                {isPasskeySupported() && (
                  <button
                    onClick={() => setMode('passkey')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-primary-600/10 border border-primary-500/30 hover:bg-primary-600/20 transition-all"
                  >
                    <span className="text-2xl">🔑</span>
                    <div className="text-left">
                      <div className="font-semibold text-primary-300">Passkey 创建</div>
                      <div className="text-xs text-gray-400">使用生物识别，最安全的方式</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => setMode('mnemonic')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-purple-600/10 border border-purple-500/30 hover:bg-purple-600/20 transition-all"
                >
                  <span className="text-2xl">📝</span>
                  <div className="text-left">
                    <div className="font-semibold text-purple-300">助记词创建</div>
                    <div className="text-xs text-gray-400">生成 12 词助记词，完全自托管</div>
                  </div>
                </button>

                <button
                  onClick={() => setMode('import')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-emerald-600/10 border border-emerald-500/30 hover:bg-emerald-600/20 transition-all"
                >
                  <span className="text-2xl">📥</span>
                  <div className="text-left">
                    <div className="font-semibold text-emerald-300">导入钱包</div>
                    <div className="text-xs text-gray-400">使用私钥或助记词导入已有钱包</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="text-amber-400 text-sm">⚠</span>
              <p className="text-xs text-amber-300/80">
                演示项目，仅供 Sepolia 测试网使用。所有密钥在本地生成和存储，不会上传至任何服务器。
                参考 Token UI Security 材料进行安全防护。
              </p>
            </div>
          </div>
        )}

        {mode === 'passkey' && (
          <div className="glass-card p-6 animate-slide-up">
            <button onClick={() => setMode('select')} className="text-gray-400 hover:text-white mb-4 text-sm">
              ← 返回
            </button>
            <h2 className="text-lg font-bold text-white mb-4">🔑 Passkey 创建钱包</h2>
            <p className="text-sm text-gray-400 mb-6">
              使用设备生物识别（指纹/Face ID）创建 Passkey，钱包密钥完全本地自托管。
            </p>
            <input
              type="text"
              placeholder="输入用户名"
              value={passkeyUsername}
              onChange={(e) => setPasskeyUsername(e.target.value)}
              className="input-field mb-4"
            />
            <div className="flex items-start gap-2 mb-4">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 accent-primary-500"
              />
              <p className="text-xs text-gray-400">
                我理解 Passkey 存储在设备本地，丢失设备可能导致无法恢复。建议同时备份助记词。
              </p>
            </div>
            <button
              onClick={handlePasskeyCreate}
              disabled={!agreed || isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? '创建中...' : '使用 Passkey 创建'}
            </button>
          </div>
        )}

        {mode === 'mnemonic' && (
          <div className="glass-card p-6 animate-slide-up">
            <button onClick={() => setMode('select')} className="text-gray-400 hover:text-white mb-4 text-sm">
              ← 返回
            </button>
            <h2 className="text-lg font-bold text-white mb-4">📝 助记词创建钱包</h2>
            <p className="text-sm text-gray-400 mb-6">
              生成 12 词助记词，请务必安全备份。密钥完全本地生成，参考 Token Core 安全标准。
            </p>
            <button onClick={handleMnemonicCreate} className="btn-primary w-full">
              生成新钱包
            </button>
          </div>
        )}

        {mode === 'import' && (
          <div className="glass-card p-6 animate-slide-up">
            <button onClick={() => setMode('select')} className="text-gray-400 hover:text-white mb-4 text-sm">
              ← 返回
            </button>
            <h2 className="text-lg font-bold text-white mb-4">📥 导入钱包</h2>
            <p className="text-sm text-gray-400 mb-4">
              输入私钥或 12/24 词助记词导入已有钱包。参考 Token UI Security - Private Key Leakage 防护。
            </p>
            <textarea
              placeholder="输入私钥或助记词（用空格分隔）"
              value={importKey}
              onChange={(e) => setImportKey(e.target.value)}
              className="input-field h-24 resize-none mb-4 font-mono text-sm"
            />
            <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <span className="text-red-400 text-sm">🔒</span>
              <p className="text-xs text-red-300/80">
                私钥仅在本地使用，不会传输至任何服务器。导入后请清除剪贴板。
              </p>
            </div>
            <button onClick={handleImport} className="btn-primary w-full">
              导入钱包
            </button>
          </div>
        )}

        {/* Mnemonic Backup Display */}
        {mnemonicDisplay && (
          <div className="glass-card p-6 mt-4 animate-slide-up glow-border">
            <h3 className="text-lg font-bold text-amber-400 mb-3">⚠ 请安全备份助记词</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {mnemonicDisplay.split(' ').map((word, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-sovereign-bg rounded-lg">
                  <span className="text-xs text-gray-500 w-5">{i + 1}.</span>
                  <span className="text-sm font-mono text-white">{word}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mb-3">
              请将助记词抄写在安全的地方，切勿截图或在线存储。丢失助记词将无法恢复钱包。
            </p>
            <button
              onClick={() => setMnemonicDisplay('')}
              className="btn-secondary w-full text-sm"
            >
              我已安全备份
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-600 mt-6">
          imToken 10周年 AI共创 · Sovereign Hub · Sepolia Testnet Only
        </p>
      </div>
    </div>
  )
}
