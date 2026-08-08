export function AnnouncementBar({ message = 'Free shipping on orders above ₹999' }) {
  return (
    <div className="bg-ink text-paper text-center text-xs tracking-widest2 uppercase py-2 px-4">
      {message}
    </div>
  )
}
