import { useState, useCallback, useRef, useEffect } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export function useChat() {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)

  // Auto-scroll ref
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = useCallback(async (content, confirmAction = null) => {
    if (!content.trim() && !confirmAction) return

    // Add user message to UI optimistically
    const userMsgId = crypto.randomUUID()
    if (content) {
      setMessages(prev => [...prev, {
        id: userMsgId,
        role: 'user',
        content,
        created_at: new Date().toISOString()
      }])
    }

    setIsLoading(true)

    try {
      const payload = {
        message: content || "Action", // The backend requires a message, we send "Action" for confirmations
        session_id: sessionId,
        confirm_action: confirmAction
      }

      const { data } = await api.post('/chat', payload)
      
      // Update session ID if this was the first message
      if (data.session_id && !sessionId) {
        setSessionId(data.session_id)
      }

      // Add assistant response
      setMessages(prev => [...prev, {
        ...data.message,
        requiresConfirmation: data.requires_confirmation,
        pendingAction: data.pending_action
      }])
      
    } catch (err) {
      console.error("Chat API error:", err)
      showToast(err.response?.data?.detail || "Failed to send message", 'error')
      
      // Remove optimistic user message on failure
      if (content) {
         setMessages(prev => prev.filter(m => m.id !== userMsgId))
      }
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, showToast])

  const clearChat = useCallback(() => {
    setMessages([])
    setSessionId(null)
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    messagesEndRef,
    isAuthenticated
  }
}
