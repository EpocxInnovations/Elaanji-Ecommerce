import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Instagram, Facebook, Mail } from 'lucide-react'
import { useState } from 'react'

export function Footer() {
  const [subscribed, setSubscribed] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 4000)
    }
  }

  return (
    <footer className="bg-ink text-paper mt-24 border-t border-paper/15 relative overflow-hidden">
      {/* Subtle Ambient Heritage Graphic */}
      <div className="absolute right-0 bottom-0 text-[180px] font-display text-paper/[0.02] select-none pointer-events-none leading-none leading-[0.8]">
        ए
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-12 pb-16 border-b border-paper/15">
          {/* Brand */}
          <div className="col-span-2">
            <h3 className="font-display text-2xl tracking-widest uppercase mb-4 text-paper">ELAANJI</h3>
            <p className="text-sm text-paper/70 leading-relaxed max-w-xs font-light">
              The House of Indian Saree Heritage. Handwoven Kanjivaram, Banarasi brocades &amp; contemporary couture weaves.
            </p>
            <div className="flex items-center gap-5 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-full border border-paper/20 text-paper/60 hover:text-paper hover:border-paper transition-all duration-300"
              >
                <Instagram size={16} strokeWidth={1.5} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2 rounded-full border border-paper/20 text-paper/60 hover:text-paper hover:border-paper transition-all duration-300"
              >
                <Facebook size={16} strokeWidth={1.5} />
              </a>
              <a
                href="mailto:hello@elaanji.com"
                aria-label="Email"
                className="p-2 rounded-full border border-paper/20 text-paper/60 hover:text-paper hover:border-paper transition-all duration-300"
              >
                <Mail size={16} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[10px] tracking-widest2 uppercase text-gold-light mb-5 font-medium">Collections</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/shop?filter=new-arrivals" className="text-xs text-paper/70 hover:text-paper transition-colors font-light">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=best_selling" className="text-xs text-paper/70 hover:text-paper transition-colors font-light">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/shop?saree_type=kanjivaram" className="text-xs text-paper/70 hover:text-paper transition-colors font-light">
                  Kanjivaram Silk
                </Link>
              </li>
              <li>
                <Link to="/shop?saree_type=banarasi" className="text-xs text-paper/70 hover:text-paper transition-colors font-light">
                  Banarasi Brocade
                </Link>
              </li>
              <li>
                <Link to="/shop?filter=sale" className="text-xs text-paper/70 hover:text-paper transition-colors font-light">
                  Special Edit
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge */}
          <div>
            <h4 className="text-[10px] tracking-widest2 uppercase text-gold-light mb-5 font-medium">Concierge</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/orders" className="text-xs text-paper/70 hover:text-paper transition-colors font-light">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-xs text-paper/70 hover:text-paper transition-colors font-light">
                  Complimentary Returns
                </Link>
              </li>
              <li>
                <a href="mailto:hello@elaanji.com" className="text-xs text-paper/70 hover:text-paper transition-colors font-light">
                  Bespoke Consultations
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-[10px] tracking-widest2 uppercase text-gold-light mb-5 font-medium">Private Journal</h4>
            <p className="text-xs text-paper/60 mb-4 font-light leading-relaxed">
              Subscribe to receive private invitations to new weave unveilings.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full bg-transparent border border-paper/20 px-3.5 py-2.5 text-xs text-paper
                             placeholder:text-paper/30 focus:border-gold-light focus:outline-none transition-colors"
                  required
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full bg-paper text-ink px-4 py-2.5 text-[10px] tracking-widest2 uppercase font-medium hover:bg-gold-light transition-colors"
              >
                {subscribed ? 'Invited ✓' : 'Subscribe'}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-paper/40 tracking-wider">
          <p>© {new Date().getFullYear()} ELAANJI. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Handcrafted with Heritage in Kanchipuram &amp; Varanasi</p>
        </div>
      </div>
    </footer>
  )
}
