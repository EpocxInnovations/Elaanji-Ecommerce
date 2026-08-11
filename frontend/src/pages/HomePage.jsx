import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { ProductCard } from '../components/ProductCard'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

export function HomePage() {
  const { data, isLoading } = useProducts({ filter: 'new-arrivals', page_size: 8 })

  useDocumentMeta({
    title: 'Elaanji — The House of Saree',
    description: 'Handpicked Kanjivaram, Banarasi, and designer sarees for every occasion, with premium finishing and pan-India delivery.',
  })

  return (
    <div>
      <section className="relative bg-beige">
        <div className="mx-auto max-w-7xl px-6 py-28 md:py-40 text-center">
          <p className="label-eyebrow mb-4">Handloom &amp; Designer Collection</p>
          <h1 className="font-display text-5xl md:text-7xl leading-tight max-w-3xl mx-auto">
            THE HOUSE OF SAREE
          </h1>
          <p className="mt-6 text-stone max-w-lg mx-auto">
            Handpicked Kanjivaram, Banarasi, and designer weaves for every occasion.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link to="/shop" className="btn-primary">
              Shop Now
            </Link>
            <Link to="/shop?filter=new-arrivals" className="btn-secondary">
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="label-eyebrow mb-3">Just In</p>
        <h2 className="font-display text-3xl mb-8">New Arrivals</h2>

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-beige mb-3" />
                <div className="h-3 bg-beige w-2/3 mb-2" />
                <div className="h-3 bg-beige w-1/3" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && data?.items?.length === 0 && (
          <p className="text-stone text-sm">New arrivals will appear here as soon as they're added.</p>
        )}

        {!isLoading && data?.items?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {data.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
