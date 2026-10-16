type TagChipPaletteSlot = {
  light: string;
  dark: string;
  hoverLight: string;
  hoverDark: string;
};

/** Coordinated pastel chips; same tag name always maps to the same slot. */
const TAG_CHIP_PALETTE: TagChipPaletteSlot[] = [
  {
    light: "bg-sky-100 text-sky-900",
    dark: "dark:bg-sky-950 dark:text-sky-200",
    hoverLight: "hover:bg-sky-200",
    hoverDark: "dark:hover:bg-sky-900",
  },
  {
    light: "bg-teal-100 text-teal-900",
    dark: "dark:bg-teal-950 dark:text-teal-200",
    hoverLight: "hover:bg-teal-200",
    hoverDark: "dark:hover:bg-teal-900",
  },
  {
    light: "bg-emerald-100 text-emerald-900",
    dark: "dark:bg-emerald-950 dark:text-emerald-200",
    hoverLight: "hover:bg-emerald-200",
    hoverDark: "dark:hover:bg-emerald-900",
  },
  {
    light: "bg-amber-100 text-amber-900",
    dark: "dark:bg-amber-950 dark:text-amber-200",
    hoverLight: "hover:bg-amber-200",
    hoverDark: "dark:hover:bg-amber-900",
  },
  {
    light: "bg-rose-100 text-rose-900",
    dark: "dark:bg-rose-950 dark:text-rose-200",
    hoverLight: "hover:bg-rose-200",
    hoverDark: "dark:hover:bg-rose-900",
  },
  {
    light: "bg-violet-100 text-violet-900",
    dark: "dark:bg-violet-950 dark:text-violet-200",
    hoverLight: "hover:bg-violet-200",
    hoverDark: "dark:hover:bg-violet-900",
  },
  {
    light: "bg-indigo-100 text-indigo-900",
    dark: "dark:bg-indigo-950 dark:text-indigo-200",
    hoverLight: "hover:bg-indigo-200",
    hoverDark: "dark:hover:bg-indigo-900",
  },
  {
    light: "bg-orange-100 text-orange-900",
    dark: "dark:bg-orange-950 dark:text-orange-200",
    hoverLight: "hover:bg-orange-200",
    hoverDark: "dark:hover:bg-orange-900",
  },
  {
    light: "bg-cyan-100 text-cyan-900",
    dark: "dark:bg-cyan-950 dark:text-cyan-200",
    hoverLight: "hover:bg-cyan-200",
    hoverDark: "dark:hover:bg-cyan-900",
  },
  {
    light: "bg-fuchsia-100 text-fuchsia-900",
    dark: "dark:bg-fuchsia-950 dark:text-fuchsia-200",
    hoverLight: "hover:bg-fuchsia-200",
    hoverDark: "dark:hover:bg-fuchsia-900",
  },
  {
    light: "bg-lime-100 text-lime-900",
    dark: "dark:bg-lime-950 dark:text-lime-200",
    hoverLight: "hover:bg-lime-200",
    hoverDark: "dark:hover:bg-lime-900",
  },
  {
    light: "bg-pink-100 text-pink-900",
    dark: "dark:bg-pink-950 dark:text-pink-200",
    hoverLight: "hover:bg-pink-200",
    hoverDark: "dark:hover:bg-pink-900",
  },
];

export function hashTagName(name: string): number {
  let hash = 5381;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 33) ^ name.charCodeAt(i);
  }
  return Math.abs(hash);
}

export function getTagChipClasses(tag: string): string {
  const index = hashTagName(tag) % TAG_CHIP_PALETTE.length;
  const slot = TAG_CHIP_PALETTE[index];
  return `${slot.light} ${slot.dark} ${slot.hoverLight} ${slot.hoverDark}`;
}
