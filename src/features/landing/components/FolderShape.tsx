/**
 * Folder tab strips from the export (`Vector 19` to `Vector 22`, 1360 x 507).
 * Only the top 170px (tab + outer rounded corner) is drawn as SVG; the body
 * below is a plain div so the folder can be any height. The strip stretches
 * horizontally with the folder; strokes keep 1px via vector-effect.
 */
export const FOLDER_TAB_HEIGHT = 170;

const TABS = [
  {
    fill: "#feeee7",
    stroke: undefined,
    d: "M1360 507V169.497C1360 136.36 1333.14 109.497 1300 109.497H691.908C675.837 109.497 660.832 101.454 651.935 88.0706L607.631 21.4267C598.734 8.04297 583.729 0 567.658 0H334.311C319.164 0 304.906 7.14946 295.846 19.2877L242.907 90.2096C233.846 102.348 219.588 109.497 204.441 109.497H0V507H1360Z",
  },
  {
    fill: "#ffffff",
    stroke: "#e4e4e4",
    d: "M1360.5 507.5V109.997H1127.31C1111.24 109.997 1096.24 101.954 1087.34 88.5706L1043.04 21.9267C1034.14 8.54297 1019.13 0.5 1003.06 0.5H686.79C671.643 0.5 657.384 7.64946 648.324 19.7877L595.385 90.7096C586.324 102.848 572.066 109.997 556.919 109.997H60.5C27.3629 109.997 0.5 136.86 0.5 169.997V507.5H1360.5Z",
  },
  {
    fill: "#f4faeb",
    stroke: "#d8ecb6",
    d: "M0 507.5V109.997H233.187C249.258 109.997 264.263 101.954 273.16 88.5706L317.463 21.9267C326.361 8.54297 341.365 0.5 357.437 0.5H673.71C688.857 0.5 703.116 7.64946 712.176 19.7877L765.115 90.7096C774.176 102.848 788.434 109.997 803.581 109.997H1300C1333.14 109.997 1360 136.86 1360 169.997V507.5H0Z",
  },
  {
    fill: "#f5f0fe",
    stroke: "#e4e4e4",
    d: "M0.5 507.5V169.997C0.5 136.86 27.3629 109.997 60.5 109.997H668.592C684.663 109.997 699.668 101.954 708.565 88.5706L752.869 21.9267C761.766 8.54297 776.771 0.5 792.842 0.5H1026.19C1041.34 0.5 1055.59 7.64946 1064.65 19.7877L1117.59 90.7096C1126.65 102.848 1140.91 109.997 1156.06 109.997H1360.5V507.5H0.5Z",
  },
] as const;

export function FolderTab({ variant }: { variant: 0 | 1 | 2 | 3 | number }) {
  const tab = TABS[variant % TABS.length];
  return (
    <svg
      aria-hidden
      viewBox={`0 0 1360 ${FOLDER_TAB_HEIGHT}`}
      preserveAspectRatio="none"
      className="block w-full"
      style={{ height: FOLDER_TAB_HEIGHT }}
    >
      <path d={tab.d} fill={tab.fill} stroke={tab.stroke} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
