import { useEffect } from "react";
import StickerPeel from "./StickerPeel";

// The hero photo as a peelable sticker (React Bits Sticker Peel). Mounted with
// client:visible over the real <img> in Hero.astro. Once it's up, the
// fallback image is hidden so only one copy of the photo shows.
export default function HeroSticker() {
  useEffect(() => {
    document.documentElement.classList.add("sticker-live");
    return () => document.documentElement.classList.remove("sticker-live");
  }, []);

  return (
    <div data-cursor="drag" className="h-full w-full">
      <StickerPeel
        imageSrc="/assets/claire-headshot.jpg"
        width={320}
        rotate={-2}
        peelBackHoverPct={20}
        peelBackActivePct={40}
        lightingIntensity={0.15}
        shadowIntensity={0.35}
        draggable
        intro={false}
        initialPosition="center"
      />
    </div>
  );
}
