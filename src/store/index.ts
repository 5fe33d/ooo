import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WalletState, IntentResult, TransactionRecord, PasskeyCredential } from '@/types'

interface AppState {
  // Wallet
  wallet: WalletState | null
  setWallet: (wallet: WalletState | null) => void

  // Passkey
  passkeyCredential: PasskeyCredential | null
  setPasskeyCredential: (cred: PasskeyCredential | null) => void

  // Intents
  intents: IntentResult[]
  addIntent: (intent: IntentResult) => void
  updateIntent: (id: string, updates: Partial<IntentResult>) => void

  // Transactions
  transactions: TransactionRecord[]
  addTransaction: (tx: TransactionRecord) => void
  updateTransaction: (id: string, updates: Partial<TransactionRecord>) => void

  // UI State
  currentView: 'welcome' | 'dashboard' | 'intent' | 'operations' | 'security' | 'history'
  setCurrentView: (view: AppState['currentView']) => void
  isLoading: boolean
  setLoading: (loading: boolean) => void
  notification: { type: 'success' | 'error' | 'warning' | 'info'; message: string } | null
  setNotification: (n: { type: 'success' | 'error' | 'warning' | 'info'; message: string } | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      wallet: null,
      setWallet: (wallet) => set({ wallet }),

      passkeyCredential: null,
      setPasskeyCredential: (cred) => set({ passkeyCredential: cred }),

      intents: [],
      addIntent: (intent) => set((s) => ({ intents: [intent, ...s.intents] })),
      updateIntent: (id, updates) =>
        set((s) => ({
          intents: s.intents.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),

      transactions: [],
      addTransaction: (tx) => set((s) => ({ transactions: [tx, ...s.transactions] })),
      updateTransaction: (id, updates) =>
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      currentView: 'welcome',
      setCurrentView: (currentView) => set({ currentView }),
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),
      notification: null,
      setNotification: (notification) => set({ notification }),
    }),
    {
      name: 'sovereign-hub-storage',
      partialize: (state) => ({
        wallet: state.wallet,
        passkeyCredential: state.passkeyCredential,
        intents: state.intents,
        transactions: state.transactions,
      }),
    }
  )
)
