import { useAppStore } from '@/store'
import { WelcomeScreen } from '@/components/layout/WelcomeScreen'
import { MainLayout } from '@/components/layout/MainLayout'
import { Notification } from '@/components/common/Notification'

export default function App() {
  const wallet = useAppStore((s) => s.wallet)
  const notification = useAppStore((s) => s.notification)

  return (
    <div className="min-h-screen bg-sovereign-bg">
      {notification && <Notification {...notification} />}
      {wallet ? <MainLayout /> : <WelcomeScreen />}
    </div>
  )
}
