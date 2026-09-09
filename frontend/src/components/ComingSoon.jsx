export function ComingSoon({ title }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="label-eyebrow mb-4">Coming Soon</p>
      <h1 className="font-display text-4xl mb-5">{title}</h1>
      <p className="text-stone text-sm max-w-md mx-auto">
        This section is coming soon and will be available shortly.
      </p>
    </div>
  )
}
