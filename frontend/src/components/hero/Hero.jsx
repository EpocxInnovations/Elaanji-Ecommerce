import { useEffect, useState } from "react";

/**
 * Hero
 * ----
 * The storytelling hero the fabric-flow intro cuts into. Deep maroon/gold
 * heritage palette, serif display headline, one CTA. Content sells the
 * craft before it sells product — the grid comes after this.
 *
 * Swap `backgroundImage` for the real campaign photo once you have one;
 * until then the gradient alone reads intentional rather than empty.
 */
export default function Hero({
  eyebrow = "Sarees woven with culture",
  headline = "Heirloom drapes for modern stories",
  subhead = "Handpicked weaves from six regions, brought to your wardrobe.",
  ctaLabel = "Explore the collection",
  ctaHref = "/collections/new-arrivals",
  backgroundImage,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <section
      className="relative flex min-h-[92vh] w-full items-end overflow-hidden bg-[#3d0f0f] text-[#f7ede1]"
      style={
        backgroundImage
          ? {
              backgroundImage: `linear-gradient(180deg, rgba(20,5,5,0.35) 0%, rgba(20,5,5,0.75) 100%), url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {
              backgroundImage:
                "radial-gradient(120% 90% at 20% 15%, #6b1c1c 0%, #3d0f0f 55%, #24080a 100%)",
            }
      }
    >
      {/* subtle warm vignette so text stays legible over any photo */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      <div
        className={`relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-32 transition-all duration-700 ease-out sm:px-10 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <p className="mb-4 text-sm tracking-[0.2em] text-[#e7c88f]">
          {eyebrow}
        </p>
        <h1 className="max-w-2xl font-serif text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
          {headline}
        </h1>
        <p className="mt-6 max-w-md text-base text-[#f7ede1]/80 sm:text-lg">
          {subhead}
        </p>
        <a
          href={ctaHref}
          className="mt-9 inline-flex items-center gap-3 border border-[#e7c88f]/70 px-7 py-3 text-sm tracking-wide text-[#f7ede1] transition hover:border-[#e7c88f] hover:bg-[#e7c88f]/10"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
