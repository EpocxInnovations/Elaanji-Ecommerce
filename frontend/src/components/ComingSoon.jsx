export function ComingSoon({ title, phase }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="label-eyebrow mb-3">{phase}</p>
      <h1 className="font-display text-4xl mb-4">{title}</h1>
      <p className="text-stone text-sm max-w-md mx-auto">
        This page is scaffolded and routed, and will be wired to real backend data in {phase} of the build.
      </p>
    </div>
  )
}
