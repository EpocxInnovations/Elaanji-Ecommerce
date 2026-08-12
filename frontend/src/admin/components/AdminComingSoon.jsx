export function AdminComingSoon({ title }) {
  return (
    <div>
      <p className="label-eyebrow mb-2">Coming Soon</p>
      <h1 className="font-display text-3xl mb-4">{title}</h1>
      <p className="text-stone text-sm max-w-md">
        This section is coming soon and will be available in an upcoming update.
      </p>
    </div>
  )
}
