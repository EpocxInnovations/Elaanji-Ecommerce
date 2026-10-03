import * as React from 'react'
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const MotionChevron = motion(ChevronRight)

const EFFECTS_KEY = 'sidebar-001-effects'

const EffectsContext = createContext({
  enabled: true,
  toggle: () => {},
})

export function EffectsProvider({ children, defaultEnabled = true }) {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return defaultEnabled
    const stored = localStorage.getItem(EFFECTS_KEY)
    return stored !== null ? stored === 'true' : defaultEnabled
  })

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      localStorage.setItem(EFFECTS_KEY, String(next))
      return next
    });
  }, [])

  const value = useMemo(() => ({ enabled, toggle }), [enabled, toggle])
  return (
    <EffectsContext.Provider value={value}>{children}</EffectsContext.Provider>
  )
}

export function useSidebar001Effects() {
  return useContext(EffectsContext)
}

// ─── Hover context ────────────────────────────────────────────────────────────

const HoverContext = createContext({
  hovered: null,
  hoverRect: null,
  containerRef: { current: null },
  setHovered: () => {},
})

export function HoverProvider({ children, containerRef }) {
  const [hovered, setHoveredId] = useState(null)
  const [hoverRect, setHoverRect] = useState(null)

  const setHovered = useCallback((id, rect) => {
    setHoveredId(id)
    setHoverRect(rect ?? null)
  }, [])

  const value = useMemo(
    () => ({ hovered, hoverRect, containerRef, setHovered }),
    [hovered, hoverRect, containerRef, setHovered]
  )

  return (
    <HoverContext.Provider value={value}>{children}</HoverContext.Provider>
  )
}

// ─── Scroll to active ─────────────────────────────────────────────────────────

function useScrollToActive(active) {
  const ref = useRef(null)
  const scrolled = useRef(false)

  useEffect(() => {
    if (!active || scrolled.current || !ref.current) return
    scrolled.current = true
    const el = ref.current
    const schedule =
      typeof requestIdleCallback !== 'undefined'
        ? (cb) => requestIdleCallback(cb)
        : (cb) => setTimeout(cb, 100)
    const cancel =
      typeof cancelIdleCallback !== 'undefined'
        ? cancelIdleCallback
        : clearTimeout
    const id = schedule(() => {
      const viewport = el.closest('[data-scroll-viewport]')
      if (!(viewport instanceof HTMLElement)) return
      const vpRect = viewport.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      const offset =
        elRect.top - vpRect.top - vpRect.height / 2 + elRect.height / 2
      if (Math.abs(offset) > 40)
        viewport.scrollBy({ top: offset, behavior: 'smooth' })
    })
    return () => cancel(id)
  }, [active])

  useEffect(() => {
    if (!active) scrolled.current = false
  }, [active])

  return ref
}

// ─── HoverHighlight ───────────────────────────────────────────────────────────

function HoverHighlight() {
  const { hoverRect, hovered } = useContext(HoverContext)
  const { enabled } = useContext(EffectsContext)

  return (
    <AnimatePresence>
      {enabled && hovered && hoverRect && (
        <motion.div
          key="sb001-hover-bg"
          className="pointer-events-none absolute z-0 rounded-md bg-stone/10"
          style={{ right: 0 }}
          initial={false}
          animate={{
            top: hoverRect.top + 2,
            height: hoverRect.height - 4,
            left: hoverRect.left,
            opacity: 1,
          }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </AnimatePresence>
  )
}

// ─── Sidebar001Item ───────────────────────────────────────────────────────────

export const Sidebar001Item = memo(function Sidebar001Item({
  href,
  to,
  label,
  icon,
  badge,
  isActive = false,
  isNew = false,
  className = '',
  onClick,
}) {
  const targetPath = to || href || '#'
  const { hovered, setHovered, containerRef } = useContext(HoverContext)
  const isHovered = hovered === targetPath
  const itemRef = useScrollToActive(isActive)

  const opacity = isActive
    ? 1
    : hovered !== null
      ? isHovered
        ? 1
        : 0.35
      : 0.65
  const x = isActive ? 8 : isHovered ? 6 : 0

  const isInternal = targetPath.startsWith('/') && !targetPath.startsWith('//')
  const LinkComponent = isInternal ? Link : 'a'
  const linkProps = isInternal
    ? { to: targetPath }
    : { href: targetPath, target: '_blank', rel: 'noreferrer' }

  return (
    <div className="relative">
      {isActive && (
        <motion.span
          layoutId="sb001-active-bar"
          className="pointer-events-none absolute z-10 left-[4px] top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-oxblood"
          animate={{ width: 23 }}
          transition={{ type: 'spring', stiffness: 800, damping: 40 }}
        />
      )}

      <motion.span
        className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-px bg-stone/40"
        animate={{ width: isActive ? 0 : isHovered ? 26 : 18 }}
        transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      />
      <motion.span className="pointer-events-none absolute w-[13px] left-0 top-1/4 h-px bg-stone/25" />
      <motion.span className="pointer-events-none absolute w-[16px] left-0 top-0 h-px bg-stone/25" />
      <motion.span className="pointer-events-none absolute w-[13px] left-0 top-3/4 h-px bg-stone/25" />

      <motion.div
        ref={itemRef}
        animate={{ opacity, x }}
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        style={{ transformOrigin: 'left center' }}
      >
        <LinkComponent
          {...linkProps}
          onClick={onClick}
          onMouseEnter={() => {
            const el = itemRef.current
            const container = containerRef.current
            if (el && container) {
              const elRect = el.getBoundingClientRect()
              const containerRect = container.getBoundingClientRect()
              setHovered(targetPath, {
                top: elRect.top - containerRect.top,
                height: elRect.height,
                left: 25,
              })
            } else {
              setHovered(targetPath)
            }
          }}
          onMouseLeave={() => setHovered(null)}
          className={cn(
            'relative flex items-center gap-2.5 ml-2 pl-4 py-2 text-xs sm:text-sm select-none transition-colors group text-ink hover:text-oxblood',
            isActive && 'font-medium text-oxblood',
            className
          )}
        >
          {icon && (
            <span className={cn('shrink-0 text-stone transition-colors group-hover:text-oxblood', isActive && 'text-oxblood')}>
              {icon}
            </span>
          )}
          <span className="relative z-1 truncate">{label}</span>
          {isNew && (
            <span className="size-1.5 rounded-full bg-gold shrink-0" />
          )}
          {badge && (
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-oxblood/10 text-oxblood font-semibold tracking-wider uppercase">
              {badge}
            </span>
          )}
        </LinkComponent>
      </motion.div>
    </div>
  )
})

// ─── Sidebar001Separator ──────────────────────────────────────────────────────

export function Sidebar001Separator({ children, className }) {
  return (
    <div
      className={cn(
        'px-2 py-2 mt-3 text-[11px] font-semibold uppercase tracking-wider text-stone/80 border-t border-stone/15',
        className
      )}
    >
      {children}
    </div>
  )
}

// ─── Sidebar001Group ──────────────────────────────────────────────────────────

export function Sidebar001Group({
  label,
  children,
  defaultOpen = false,
  icon,
  className,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const id = useId()
  const { setHovered, containerRef } = useContext(HoverContext)
  const buttonRef = useRef(null)

  const handleMouseEnter = useCallback(() => {
    const el = buttonRef.current
    const container = containerRef.current
    if (el && container) {
      const elRect = el.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      setHovered(id, {
        top: elRect.top - containerRect.top,
        height: elRect.height,
        left: 0,
      })
    } else {
      setHovered(id)
    }
  }, [id, setHovered, containerRef])

  const handleMouseLeave = useCallback(() => {
    setHovered(null)
  }, [setHovered])

  return (
    <div className={cn('flex flex-col', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative z-1 flex items-center gap-2 py-1.5 pr-2 select-none text-left w-full group cursor-pointer"
      >
        {icon ? (
          <>
            <span className="shrink-0 text-stone group-hover:text-oxblood transition-colors">
              {icon}
            </span>
            <span className="text-xs sm:text-sm text-stone group-hover:text-ink font-medium transition-colors duration-150 flex-1">
              {label}
            </span>
            <MotionChevron
              size={14}
              strokeWidth={2}
              className="shrink-0 text-stone/60 mr-1"
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </>
        ) : (
          <>
            <MotionChevron
              size={12}
              strokeWidth={2}
              className="shrink-0 text-stone/60"
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
            <span className="text-xs sm:text-sm text-stone group-hover:text-ink font-medium transition-colors duration-150">
              {label}
            </span>
          </>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="flex flex-col pl-3 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Sidebar001Section ────────────────────────────────────────────────────────

export function Sidebar001Section({ label, children, className }) {
  return (
    <div className={cn('flex flex-col space-y-0.5', className)}>
      {label && <Sidebar001Separator>{label}</Sidebar001Separator>}
      {children}
    </div>
  )
}

// ─── Sidebar001Content ────────────────────────────────────────────────────────

export function Sidebar001Content({ children, className }) {
  const containerRef = useContext(HoverContext).containerRef

  return (
    <div
      className={cn('flex-1 overflow-y-auto py-3 no-scrollbar', className)}
      data-scroll-viewport
    >
      <div ref={containerRef} className="relative px-2">
        <HoverHighlight />
        {children}
      </div>
    </div>
  )
}

// ─── Sidebar001 (with resize) ─────────────────────────────────────────────────

export function Sidebar001({
  children,
  className,
  defaultEffectsEnabled = true,
  defaultWidth = 260,
  minWidth = 180,
  maxWidth = 420,
}) {
  const containerRef = useRef(null)
  const [width, setWidth] = useState(defaultWidth)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startW = useRef(0)

  const onPointerDown = useCallback(
    (e) => {
      e.preventDefault()
      dragging.current = true
      startX.current = e.clientX
      startW.current = width
      e.target.setPointerCapture(e.pointerId)
    },
    [width]
  )

  const onPointerMove = useCallback(
    (e) => {
      if (!dragging.current) return
      const next = Math.min(
        maxWidth,
        Math.max(minWidth, startW.current + e.clientX - startX.current)
      )
      setWidth(next)
    },
    [minWidth, maxWidth]
  )

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  return (
    <EffectsProvider defaultEnabled={defaultEffectsEnabled}>
      <HoverProvider containerRef={containerRef}>
        <aside
          className={cn(
            'relative flex flex-col h-full shrink-0 bg-paper border-r border-stone/20 shadow-xs select-none',
            className
          )}
          style={{ width }}
        >
          {children}

          {/* Resize handle */}
          <div
            className="absolute top-0 right-0 h-full w-2 cursor-col-resize group/handle z-20"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <div className="absolute right-0 top-0 h-full w-px bg-stone/20 group-hover/handle:bg-oxblood group-hover/handle:w-[2px] transition-colors duration-150" />
          </div>
        </aside>
      </HoverProvider>
    </EffectsProvider>
  )
}

// ─── Sidebar001Header ─────────────────────────────────────────────────────────

export function Sidebar001Header({ children, className }) {
  return (
    <div className={cn('shrink-0 px-4 pt-5 pb-3 border-b border-stone/15', className)}>
      {children}
    </div>
  )
}

// ─── Sidebar001Footer ─────────────────────────────────────────────────────────

export function Sidebar001Footer({ children, className }) {
  return (
    <div className={cn('shrink-0 px-4 py-3 border-t border-stone/15 bg-stone/[0.02]', className)}>
      {children}
    </div>
  )
}

export default Sidebar001
