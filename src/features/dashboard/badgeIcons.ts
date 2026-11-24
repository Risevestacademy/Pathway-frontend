import trophy from "../../assets/images/dashboard/trophy.png";
import cube from "../../assets/images/dashboard/badges/badge-cube.png";
import hexagon from "../../assets/images/dashboard/badges/badge-hexagon.png";
import sparkle from "../../assets/images/dashboard/badges/badge-sparkle.png";
import flame from "../../assets/images/dashboard/badges/badge-flame.png";
import locked from "../../assets/images/dashboard/badges/badge-locked.png";

export const LOCKED_BADGE_ICON = locked;

// Matched by position until the backend's iconKey values are known.
const BADGE_ICONS = [cube, hexagon, sparkle, flame];

/** The icon for the badge at `index` in the earned list; later badges get the plain trophy. */
export function badgeIconAt(index: number): string {
  return BADGE_ICONS[index] ?? trophy;
}
