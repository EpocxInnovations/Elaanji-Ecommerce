import { useEffect } from 'react'

function setMetaTag(name, content, isProperty = false) {
  if (!content) return
  const attr = isProperty ? 'property' : 'name'
  let tag = document.querySelector(`meta[${attr}="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

/**
 * Sets document title + meta description/OG tags for the current page.
 * Restores nothing on unmount — the next page's own call overwrites these,
 * which is fine since there's always exactly one "current" page.
 */
export function useDocumentMeta({ title, description, image }) {
  useEffect(() => {
    if (title) document.title = title
    setMetaTag('description', description)
    setMetaTag('og:title', title, true)
    setMetaTag('og:description', description, true)
    if (image) setMetaTag('og:image', image, true)
  }, [title, description, image])
}

/**
 * Injects a JSON-LD <script> tag for product structured data. Removes the
 * previous one on cleanup so navigating between products doesn't stack tags.
 */
export function useProductStructuredData(product) {
  useEffect(() => {
    if (!product) return

    const price = product.discount_price || product.price
    const data = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      sku: product.sku,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price,
        availability: 'https://schema.org/InStock',
      },
      ...(product.average_rating > 0
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: product.average_rating,
              reviewCount: product.review_count,
            },
          }
        : {}),
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(data)
    script.id = 'product-structured-data'
    document.head.appendChild(script)

    return () => script.remove()
  }, [product])
}
