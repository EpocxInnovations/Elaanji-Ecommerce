import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Bot, User, Check, XCircle, ShoppingBag } from 'lucide-react'
import { useChat } from '../hooks/useChat'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const { messages, isLoading, sendMessage, messagesEndRef, isAuthenticated } = useChat()
  const { user } = useAuth()

  // Do not render if not logged in (since chat is authenticated only)
  if (!isAuthenticated) return null

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    sendMessage(inputValue)
    setInputValue('')
  }

  const handleConfirmation = (action) => {
    sendMessage("Confirmation", action) // sends confirmAction="yes" or "no"
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-ink text-paper rounded-full flex items-center justify-center shadow-luxury hover:bg-ink-deep transition-colors"
            aria-label="Open support chat"
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[85vh] bg-paper rounded-2xl shadow-luxury flex flex-col overflow-hidden border border-beige-deep"
          >
            {/* Header */}
            <div className="bg-ink text-paper px-4 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-oxblood flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-display font-medium text-lg leading-none">Elaanji Support</h3>
                  <p className="text-xs text-paper-warm/80 mt-1">We typically reply instantly</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-paper/80 hover:text-paper transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-paper-warm/50">
              {/* Welcome message */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-card text-sm text-ink-deep">
                  <p>Hi {user?.name?.split(' ')[0] || 'there'}! 👋</p>
                  <p className="mt-1">I can help you with product questions, our policies, or checking on your orders. How can I assist you today?</p>
                </div>
              </div>

              {messages.map((msg, i) => (
                <div key={msg.id || i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center shrink-0">
                      <Bot size={16} />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm shadow-card ${
                      msg.role === 'user' 
                        ? 'bg-beige-deep text-ink-deep rounded-tr-sm' 
                        : 'bg-white text-ink-deep rounded-tl-sm'
                    }`}>
                      {/* Render text content (handle markdown optionally, but simple text for now) */}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      
                      {/* Render Confirmation UI if required */}
                      {msg.requiresConfirmation && msg.pendingAction && (
                        <div className="mt-4 p-3 bg-paper-warm border border-beige rounded-lg">
                          <p className="font-medium text-ink mb-2">Please confirm:</p>
                          <p className="text-xs text-stone mb-3">{msg.pendingAction.description}</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleConfirmation('yes')}
                              disabled={isLoading}
                              className="flex-1 flex items-center justify-center gap-1 bg-ink text-paper py-1.5 rounded text-xs hover:bg-ink-deep disabled:opacity-50 transition-colors"
                            >
                              <Check size={14} /> Yes, proceed
                            </button>
                            <button 
                              onClick={() => handleConfirmation('no')}
                              disabled={isLoading}
                              className="flex-1 flex items-center justify-center gap-1 bg-white border border-stone-light text-ink py-1.5 rounded text-xs hover:bg-paper-warm disabled:opacity-50 transition-colors"
                            >
                              <XCircle size={14} /> Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-stone mt-1 px-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white px-4 py-4 rounded-2xl rounded-tl-sm shadow-card flex gap-1">
                    <motion.div className="w-1.5 h-1.5 bg-stone-light rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-stone-light rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-stone-light rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 1 && !isLoading && (
              <div className="px-4 pb-2 bg-paper-warm/50 flex flex-wrap gap-2">
                {[
                  "What is your return policy?",
                  "How much is shipping?",
                  "Where is my order?",
                  "How do I care for silk?"
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sendMessage(q)
                    }}
                    className="text-xs bg-white border border-beige-deep text-ink px-3 py-1.5 rounded-full shadow-sm hover:bg-beige hover:border-stone-light transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-beige">
              <form onSubmit={handleSend} className="relative flex items-end">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend(e)
                    }
                  }}
                  placeholder="Ask a question..."
                  className="w-full bg-paper-warm border border-beige-deep rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-stone-light resize-none h-[46px] max-h-[120px]"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 bottom-2 w-8 h-8 flex items-center justify-center bg-ink text-paper rounded-lg disabled:opacity-50 disabled:bg-stone hover:bg-ink-deep transition-colors"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </form>
              <div className="flex justify-center mt-3">
                  <p className="text-[10px] text-stone">AI assistant — responses may occasionally be inaccurate</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
