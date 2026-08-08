import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div>
      <section className="relative bg-beige">
        <div className="mx-auto max-w-7xl px-6 py-28 md:py-40 text-center">
          <p className="label-eyebrow mb-4">The House of Saree</p>
          <h1 className="font-display text-5xl md:text-7xl leading-tight max-w-3xl mx-auto">
            DRAPE YOUR ELEGANCE
          </h1>
          <p className="mt-6 text-stone max-w-lg mx-auto">
            Discover exquisite sarees — handpicked for every occasion, crafted with timeless artistry.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link to="/shop" className="btn-primary">
              Shop Now
            </Link>
            <Link to="/shop?filter=new-arrivals" className="btn-secondary">
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="label-eyebrow mb-3">Just In</p>
        <h2 className="font-display text-3xl mb-8">New Arrivals</h2>
        <p className="text-stone text-sm">
          Product data connects to the catalog API in Phase 2 — this section will pull live
          new-arrival sarees from the backend.
        </p>
      </section>
    </div>
  )
}
