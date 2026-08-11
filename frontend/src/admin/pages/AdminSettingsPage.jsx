import { useEffect, useState } from 'react'
import { useAdminSettings } from '../../hooks/admin/useAdminSettings'
import { useAuth } from '../../context/AuthContext'

const TABS = ['Store Info', 'Shipping', 'Tax', 'Payment', 'Notifications', 'Account']

export function AdminSettingsPage() {
  const { settings, isLoading, updateStoreInfo, updateShipping, updateTax, updatePayment, updateNotifications, changePassword } = useAdminSettings()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Store Info')

  const [storeInfo, setStoreInfo] = useState(null)
  const [shipping, setShipping] = useState(null)
  const [tax, setTax] = useState(null)
  const [payment, setPayment] = useState(null)
  const [notifications, setNotifications] = useState(null)
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (settings) {
      setStoreInfo(settings.store_info)
      setShipping(settings.shipping)
      setTax(settings.tax)
      setPayment(settings.payment)
      setNotifications(settings.notifications)
    }
  }, [settings])

  if (isLoading || !storeInfo) return <p className="text-stone text-sm">Loading…</p>

  const saveAndNotify = async (mutation, payload) => {
    setMessage('')
    await mutation.mutateAsync(payload)
    setMessage('Saved.')
    setTimeout(() => setMessage(''), 2000)
  }

  return (
    <div className="max-w-2xl">
      <p className="label-eyebrow mb-2">Phase 6</p>
      <h1 className="font-display text-3xl mb-6">Settings</h1>

      <div className="flex gap-1 mb-8 border-b border-stone/20 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs tracking-widest2 uppercase whitespace-nowrap ${
              activeTab === tab ? 'border-b-2 border-ink text-ink' : 'text-stone'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {message && <p className="text-sm text-emerald-700 mb-4">{message}</p>}

      {activeTab === 'Store Info' && (
        <div className="space-y-3">
          <Field label="Store Name"><input className="input" value={storeInfo.store_name} onChange={(e) => setStoreInfo({ ...storeInfo, store_name: e.target.value })} /></Field>
          <Field label="Support Email"><input className="input" value={storeInfo.support_email || ''} onChange={(e) => setStoreInfo({ ...storeInfo, support_email: e.target.value })} /></Field>
          <Field label="Support Phone"><input className="input" value={storeInfo.support_phone || ''} onChange={(e) => setStoreInfo({ ...storeInfo, support_phone: e.target.value })} /></Field>
          <Field label="Address"><textarea className="input" rows={2} value={storeInfo.address || ''} onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })} /></Field>
          <Field label="GST Number"><input className="input" value={storeInfo.gst_number || ''} onChange={(e) => setStoreInfo({ ...storeInfo, gst_number: e.target.value })} /></Field>
          <button onClick={() => saveAndNotify(updateStoreInfo, storeInfo)} className="btn-primary">Save</button>
        </div>
      )}

      {activeTab === 'Shipping' && (
        <div className="space-y-3">
          <Field label="Standard Shipping Fee (₹)"><input type="number" className="input" value={shipping.default_shipping_fee} onChange={(e) => setShipping({ ...shipping, default_shipping_fee: Number(e.target.value) })} /></Field>
          <Field label="Express Shipping Fee (₹)"><input type="number" className="input" value={shipping.express_shipping_fee} onChange={(e) => setShipping({ ...shipping, express_shipping_fee: Number(e.target.value) })} /></Field>
          <Field label="Free Shipping Threshold (₹)"><input type="number" className="input" value={shipping.free_shipping_threshold} onChange={(e) => setShipping({ ...shipping, free_shipping_threshold: Number(e.target.value) })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Standard Delivery (days)"><input type="number" className="input" value={shipping.estimated_delivery_days_standard} onChange={(e) => setShipping({ ...shipping, estimated_delivery_days_standard: Number(e.target.value) })} /></Field>
            <Field label="Express Delivery (days)"><input type="number" className="input" value={shipping.estimated_delivery_days_express} onChange={(e) => setShipping({ ...shipping, estimated_delivery_days_express: Number(e.target.value) })} /></Field>
          </div>
          <button onClick={() => saveAndNotify(updateShipping, shipping)} className="btn-primary">Save</button>
          <p className="text-xs text-stone">Changes apply to checkout immediately — no redeploy needed.</p>
        </div>
      )}

      {activeTab === 'Tax' && (
        <div className="space-y-3">
          <Field label="Default Tax %"><input type="number" className="input" value={tax.default_tax_percent} onChange={(e) => setTax({ ...tax, default_tax_percent: Number(e.target.value) })} /></Field>
          <button onClick={() => saveAndNotify(updateTax, tax)} className="btn-primary">Save</button>
        </div>
      )}

      {activeTab === 'Payment' && (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={payment.cod_enabled} onChange={(e) => setPayment({ ...payment, cod_enabled: e.target.checked })} className="accent-oxblood" />
            Cash on Delivery enabled
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={payment.online_payments_enabled} onChange={(e) => setPayment({ ...payment, online_payments_enabled: e.target.checked })} className="accent-oxblood" />
            Online payments enabled
          </label>
          <button onClick={() => saveAndNotify(updatePayment, payment)} className="btn-primary">Save</button>
        </div>
      )}

      {activeTab === 'Notifications' && (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={notifications.email_notifications_enabled} onChange={(e) => setNotifications({ ...notifications, email_notifications_enabled: e.target.checked })} className="accent-oxblood" />
            Email notifications
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={notifications.order_notifications_enabled} onChange={(e) => setNotifications({ ...notifications, order_notifications_enabled: e.target.checked })} className="accent-oxblood" />
            Order notifications
          </label>
          <button onClick={() => saveAndNotify(updateNotifications, notifications)} className="btn-primary">Save</button>
        </div>
      )}

      {activeTab === 'Account' && (
        <div className="space-y-6">
          <div>
            <p className="label-eyebrow mb-1">Name</p>
            <p className="text-sm mb-4">{user?.name}</p>
            <p className="label-eyebrow mb-1">Email</p>
            <p className="text-sm">{user?.email}</p>
          </div>

          <div>
            <h3 className="text-sm tracking-widest2 uppercase text-stone mb-3">Change Password</h3>
            <div className="space-y-3">
              <input type="password" placeholder="Current password" value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} className="input" />
              <input type="password" placeholder="New password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} className="input" />
              <button
                onClick={async () => {
                  setMessage('')
                  try {
                    await changePassword.mutateAsync(passwordForm)
                    setMessage('Password updated.')
                    setPasswordForm({ current_password: '', new_password: '' })
                  } catch (err) {
                    setMessage(err.response?.data?.detail || 'Could not update password.')
                  }
                }}
                className="btn-primary"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs tracking-widest2 uppercase text-stone mb-1.5">{label}</label>
      {children}
    </div>
  )
}
