/**
 * ShopByColour
 * ------------
 * Each colour is a teardrop/petal-shaped cutout of a real fabric photo in
 * that colourway, not a flat swatch dot — this is the genuinely novel piece
 * from the reference design.
 *
 * Data shape per item:
 *   { label: "Red", slug: "red", image: "/assets/colours/red.jpg" }
 *
 * `image` should be a close crop of an actual saree in that colour (same
 * treatment as your product photography) — the petal mask does the rest.
 */
export default function ShopByColour({ colours = DEFAULT_COLOURS }) {
  return (
    <section className="bg-[#f7ede1] px-6 py-16 sm:px-10">
      {/* Petal mask, defined once, referenced by every swatch below.
          objectBoundingBox units (0-1) mean it scales with the element,
          so it holds its shape across the sm: breakpoint change. */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="petal-mask" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0 C0.77,0 1,0.19 1,0.4 C1,0.65 0.77,0.8 0.5,1 C0.23,0.8 0,0.65 0,0.4 C0,0.19 0.23,0 0.5,0 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="mx-auto max-w-6xl">
        <h2 className="font-serif text-3xl text-[#3d0f0f] sm:text-4xl">
          Shop by colour
        </h2>
        <p className="mt-2 max-w-md text-sm text-[#3d0f0f]/60">
          Every shade drawn from the loom, not a colour chart.
        </p>

        <div className="mt-10 flex gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {colours.map((c) => (
            <a
              key={c.slug}
              href={`/collections/colour/${c.slug}`}
              className="group flex shrink-0 flex-col items-center gap-3"
            >
              <span
                className="block h-32 w-24 overflow-hidden bg-[#e7c88f] transition-transform duration-300 ease-out [clip-path:url(#petal-mask)] group-hover:-translate-y-1 sm:h-40 sm:w-28"
                style={{
                  backgroundImage: `url(${c.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                role="img"
                aria-label={`${c.label} sarees`}
              />
              <span className="text-sm tracking-wide text-[#3d0f0f]">
                {c.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

const DEFAULT_COLOURS = [
  { label: "Red", slug: "red", image: "/assets/colours/red.jpg" },
  { label: "Green", slug: "green", image: "/assets/colours/green.jpg" },
  { label: "Yellow", slug: "yellow", image: "/assets/colours/yellow.jpg" },
  { label: "Pink", slug: "pink", image: "/assets/colours/pink.jpg" },
  { label: "Blue", slug: "blue", image: "/assets/colours/blue.jpg" },
  { label: "Maroon", slug: "maroon", image: "/assets/colours/maroon.jpg" },
];
