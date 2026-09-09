import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Reusable luxury breadcrumb navigation using custom SVG icons & Elaanji design tokens.
 * @param {Array<{ label: string, href?: string }>} items - Array of breadcrumb items.
 * @param {string} [className] - Optional container class extensions.
 */
export function Breadcrumbs({ items = [], className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={`mb-6 ${className}`}>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-stone font-medium">
        {/* Home Button Icon */}
        <Link
          to="/"
          aria-label="Home"
          className="inline-flex items-center justify-center p-1 text-stone hover:text-gold transition-colors duration-200 rounded-md focus-visible:ring-2 focus-visible:ring-gold"
        >
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16 7.609c.352 0 .69.122.96.343l.111.1 6.25 6.25v.001a1.5 1.5 0 0 1 .445 1.071v7.5a.89.89 0 0 1-.891.891H9.125a.89.89 0 0 1-.89-.89v-7.5l.006-.149a1.5 1.5 0 0 1 .337-.813l.1-.11 6.25-6.25c.285-.285.67-.444 1.072-.444Zm5.984 7.876L16 9.5l-5.984 5.985v6.499h11.968z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth=".094"
            />
          </svg>
        </Link>

        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <React.Fragment key={index}>
              {/* Chevron Separator SVG */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-stone-light/60 shrink-0"
              >
                <path
                  d="m14.413 10.663-6.25 6.25a.939.939 0 1 1-1.328-1.328L12.42 10 6.836 4.413a.939.939 0 1 1 1.328-1.328l6.25 6.25a.94.94 0 0 1-.001 1.328"
                  fill="currentColor"
                />
              </svg>

              {/* Item Link or Active Text */}
              {isLast || !item.href ? (
                <span className="text-oxblood font-semibold line-clamp-1 max-w-[200px] sm:max-w-xs">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="hover:text-gold transition-colors duration-200 line-clamp-1"
                >
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </nav>
  )
}
