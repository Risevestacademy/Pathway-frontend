import pathwaysArt from "../../../assets/images/dashboard-art-pathways.png";
import topicsArt from "../../../assets/images/dashboard-art-topics.png";

/**
 * Line art in the bottom-right corner of a card, cropped by its edges. The
 * pictures are exported at twice their size, so they are shown at half the
 * width of the file (`width` is that, in px) and keep their proportions.
 */
function Art({ src, width }: { src: string; width: number }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      style={{ width }}
      className="pointer-events-none absolute right-0 bottom-0 h-auto max-w-none select-none"
    />
  );
}

/** The amber line art on the Pathways card (465 px wide file). */
export const PathwaysArt = () => <Art src={pathwaysArt} width={232} />;

/** The pink line art on the Topics Completed card (420 px wide file). */
export const TopicsArt = () => <Art src={topicsArt} width={210} />;
