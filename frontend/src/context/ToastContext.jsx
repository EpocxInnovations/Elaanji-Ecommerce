import { createContext, useContext, useState, useCallback } from 'react'
import { Check, X, AlertCircle } from 'lucide-react'

const ToastContext = createContext(null)

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = ++idCounter
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2800)
  }, [])

  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }) {
  const Icon = toast.type === 'error' ? AlertCircle : Check

  return (
    <div
      role="status"
      className="flex items-center gap-3 bg-ink text-paper px-4 py-3 shadow-lg min-w-[240px] max-w-sm animate-[toast-in_0.2s_ease-out]"
    >
      <span className={`shrink-0 rounded-full p-1 ${toast.type === 'error' ? 'bg-oxblood' : 'bg-emerald-700'}`}>
        <Icon size={12} />
      </span>
      <p className="text-sm flex-1">{toast.message}</p>
      <button onClick={onDismiss} aria-label="Dismiss" className="text-paper/60 hover:text-paper shrink-0">
        <X size={14} />
      </button>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
