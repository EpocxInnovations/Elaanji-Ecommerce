export function AdminComingSoon({ title, phase }) {
  return (
    <div>
      <p className="label-eyebrow mb-2">{phase}</p>
      <h1 className="font-display text-3xl mb-4">{title}</h1>
      <p className="text-stone text-sm max-w-md">
        This section is routed and protected by admin auth, and will be built out with real
        data and actions in {phase}.
      </p>
    </div>
  )
}
