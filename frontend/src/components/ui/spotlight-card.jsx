import React, { useEffect, useRef } from 'react'

export const glowColorMap = {
  gold: { base: 42, spread: 35 },
  oxblood: { base: 350, spread: 30 },
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
}

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96',
}

const GLOBAL_STYLES_ID = 'glow-card-styles'

const beforeAfterStyles = `
  [data-glow]::before,
  [data-glow]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: calc(var(--radius) * 1px);
    background-attachment: fixed;
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-repeat: no-repeat;
    background-position: 50% 50%;
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask-clip: padding-box, border-box;
    mask-composite: intersect;
    -webkit-mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    -webkit-mask-clip: padding-box, border-box;
    -webkit-mask-composite: source-out, destination-over;
    opacity: var(--spotlight-opacity, 0);
    transition: opacity 0.3s ease;
    z-index: 1;
  }
  
  [data-glow]::before {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
      calc(var(--x, -1000) * 1px)
      calc(var(--y, -1000) * 1px),
      hsl(var(--hue, 42) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 0.95)), transparent 100%
    );
    filter: brightness(1.7);
  }
  
  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
      calc(var(--x, -1000) * 1px)
      calc(var(--y, -1000) * 1px),
      hsl(45 100% 95% / var(--border-light-opacity, 0.85)), transparent 100%
    );
  }
  
  [data-glow] > [data-glow-inner] {
    position: absolute;
    inset: 0;
    will-change: filter;
    opacity: calc(var(--outer, 0.6) * var(--spotlight-opacity, 0));
    border-radius: calc(var(--radius) * 1px);
    overflow: hidden;
    pointer-events: none;
    transition: opacity 0.3s ease;
    z-index: 0;
  }

  [data-glow] > [data-glow-inner]::before {
    content: "";
    position: absolute;
    inset: -6px;
    border-radius: calc(var(--radius) * 1px);
    background-attachment: fixed;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-image: radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, -1000) * 1px)
      calc(var(--y, -1000) * 1px),
      hsl(var(--hue, 42) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / 0.16), transparent 100%
    );
    filter: blur(12px);
  }
`

export const GlowCard = ({
  children,
  className = '',
  glowColor = 'gold',
  size = 'md',
  width,
  height,
  customSize = false,
  spotlightSize = 300,
  borderWidth = 1.5,
  borderRadius = 16,
  as: Component = 'div',
  ...rest
}) => {
  const cardRef = useRef(null)

  // Ensure CSS is injected once globally
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const existing = document.getElementById(GLOBAL_STYLES_ID)
      if (existing) {
        existing.innerHTML = beforeAfterStyles
      } else {
        const styleEl = document.createElement('style')
        styleEl.id = GLOBAL_STYLES_ID
        styleEl.innerHTML = beforeAfterStyles
        document.head.appendChild(styleEl)
      }
    }
  }, [])

  // Sync cursor coordinates across viewport
  useEffect(() => {
    let rafId = null

    const syncPointer = (e) => {
      const { clientX: x, clientY: y } = e
      if (rafId) cancelAnimationFrame(rafId)

      rafId = requestAnimationFrame(() => {
        if (cardRef.current) {
          cardRef.current.style.setProperty('--x', x.toFixed(2))
          cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2))
          cardRef.current.style.setProperty('--y', y.toFixed(2))
          cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2))
          cardRef.current.style.setProperty('--spotlight-opacity', '1')
        }
      })
    }

    const handlePointerLeave = () => {
      if (cardRef.current) {
        cardRef.current.style.setProperty('--spotlight-opacity', '0')
      }
    }

    window.addEventListener('pointermove', syncPointer, { passive: true })
    document.addEventListener('mouseleave', handlePointerLeave)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', syncPointer)
      document.removeEventListener('mouseleave', handlePointerLeave)
    }
  }, [])

  const colorConfig = glowColorMap[glowColor] || glowColorMap.gold
  const { base, spread } = colorConfig

  // Determine sizing
  const getSizeClasses = () => {
    if (customSize) {
      return ''
    }
    return sizeMap[size] || sizeMap.md
  }

  const getInlineStyles = () => {
    const baseStyles = {
      '--base': base,
      '--spread': spread,
      '--radius': String(borderRadius),
      '--border': String(borderWidth),
      '--backdrop': 'transparent',
      '--backup-border': 'rgba(197, 160, 89, 0.2)',
      '--size': String(spotlightSize),
      '--outer': '0.6',
      '--border-size': 'calc(var(--border, 1.5) * 1px)',
      '--spotlight-size': 'calc(var(--size, 300) * 1px)',
      '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
      '--saturation': '95',
      '--lightness': '52',
      '--border-spot-opacity': '1',
      '--border-light-opacity': '0.85',
      '--bg-spot-opacity': '0.08',
      '--spotlight-opacity': '0',
      '--x': '-1000',
      '--y': '-1000',
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, -1000) * 1px)
        calc(var(--y, -1000) * 1px),
        hsl(var(--hue, 42) calc(var(--saturation, 95) * 1%) calc(var(--lightness, 52) * 1%) / var(--bg-spot-opacity, 0.08)), transparent
      )`,
      backgroundColor: 'var(--backdrop, transparent)',
      backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
      backgroundPosition: '50% 50%',
      backgroundAttachment: 'fixed',
      border: 'var(--border-size) solid var(--backup-border)',
      position: 'relative',
    }

    if (width !== undefined) {
      baseStyles.width = typeof width === 'number' ? `${width}px` : width
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === 'number' ? `${height}px` : height
    }

    return baseStyles
  }

  return (
    <Component
      ref={cardRef}
      data-glow
      style={getInlineStyles()}
      className={`
        ${getSizeClasses()}
        ${!customSize ? 'aspect-[3/4] p-4 gap-4 grid grid-rows-[1fr_auto]' : ''}
        relative 
        rounded-2xl 
        shadow-[0_0.75rem_2rem_-1rem_rgba(0,0,0,0.12)] 
        transition-shadow
        duration-300
        ${className}
      `}
      {...rest}
    >
      <div data-glow-inner />
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </Component>
  )
}

export default GlowCard
