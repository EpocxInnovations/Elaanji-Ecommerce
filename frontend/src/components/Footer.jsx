export function Footer() {
  return (
    <footer className="bg-ink text-paper mt-24">
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-display text-xl mb-4">Elaanji</h3>
          <p className="text-sm text-paper/70">The House of Saree.</p>
        </div>
        <div>
          <h4 className="text-xs tracking-widest2 uppercase text-paper/50 mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-paper/80">
            <li>New Arrivals</li>
            <li>Best Sellers</li>
            <li>Sale</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-widest2 uppercase text-paper/50 mb-4">Support</h4>
          <ul className="space-y-2 text-sm text-paper/80">
            <li>Track Order</li>
            <li>Returns</li>
            <li>Contact Us</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-widest2 uppercase text-paper/50 mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-paper/80">
            <li>About</li>
            <li>Careers</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10 py-6 text-center text-xs text-paper/50">
        © {new Date().getFullYear()} Elaanji — The House of Saree. All rights reserved.
      </div>
    </footer>
  )
}
