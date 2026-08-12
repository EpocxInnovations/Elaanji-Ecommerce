import { createContext, useContext, useState, useCallback } from 'react'
import { Check, X, AlertCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

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
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }) {
  const isError = toast.type === 'error'
  const Icon = isError ? AlertCircle : Check

  return (
    <motion.div
      initial={{ opacity: 0, x: 24, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role="status"
      className="flex items-center gap-3 bg-ink text-paper px-4 py-3 shadow-luxury min-w-[240px] max-w-sm"
    >
      <span className={`shrink-0 w-5 h-5 flex items-center justify-center ${isError ? 'bg-oxblood' : 'bg-emerald-700'}`}>
        <Icon size={12} strokeWidth={2} />
      </span>
      <p className="text-sm flex-1">{toast.message}</p>
      <button onClick={onDismiss} aria-label="Dismiss" className="text-paper/50 hover:text-paper shrink-0 p-0.5 transition-colors">
        <X size={14} strokeWidth={1.5} />
      </button>
    </motion.div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
