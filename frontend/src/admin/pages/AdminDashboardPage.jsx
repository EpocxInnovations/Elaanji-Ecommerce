import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

export function AdminDashboardPage() {
  const { user } = useAuth()
  const [pingStatus, setPingStatus] = useState('checking')

  useEffect(() => {
    api
      .get('/admin/ping')
      .then(() => setPingStatus('connected'))
      .catch(() => setPingStatus('error'))
  }, [])

  return (
    <div>
      <p className="label-eyebrow mb-2">Phase 4</p>
      <h1 className="font-display text-3xl mb-2">Dashboard</h1>
      <p className="text-stone text-sm mb-8">
        Welcome back, {user?.name}. KPI cards, charts, recent orders, and low-stock alerts land
        in Phase 4 once product and order data exists to report on.
      </p>

      <div className="border border-stone/20 p-6 max-w-md">
        <p className="text-xs tracking-widest2 uppercase text-stone mb-2">Backend admin route</p>
        <p className="text-sm">
          {pingStatus === 'checking' && 'Checking connection…'}
          {pingStatus === 'connected' && (
            <span className="text-emerald-700">✓ Connected — admin auth is protecting this route correctly.</span>
          )}
          {pingStatus === 'error' && (
            <span className="text-oxblood">✗ Could not reach /api/admin/ping</span>
          )}
        </p>
      </div>
    </div>
  )
}
