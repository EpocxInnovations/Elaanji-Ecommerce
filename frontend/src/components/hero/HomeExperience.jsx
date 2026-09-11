import { useState } from "react";
import FabricFlowIntro from "./FabricFlowIntro";
import Hero from "./Hero";
import ShopByColour from "./ShopByColour";

/**
 * HomeExperience
 * --------------
 * Drop this in place of whatever currently renders the homepage's top
 * section. Sequence: fabric-flow intro (once per session) -> hero fades
 * in on the same black field -> Shop by Colour below the fold.
 *
 * The rest of your homepage (curated HomepageSection blocks, product
 * grid, etc.) renders below this as before — this component only owns
 * the top-of-page moment.
 */
export default function HomeExperience() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      <FabricFlowIntro onComplete={() => setIntroDone(true)} />
      {introDone && (
        <>
          <Hero />
          <ShopByColour />
        </>
      )}
    </>
  );
}
