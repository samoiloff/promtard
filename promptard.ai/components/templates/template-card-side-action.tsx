import type { ReactNode } from "react";

const sideActionClass =
  "flex shrink-0 flex-col items-center justify-center gap-1 border-l border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900";

type TemplateCardSideActionProps = {
  label: string;
  onClick: () => void;
  ariaLabel?: string;
  icon?: ReactNode;
};

export function TemplateCardSideAction({
  label,
  onClick,
  ariaLabel,
  icon,
}: TemplateCardSideActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={sideActionClass}
      aria-label={ariaLabel ?? label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
