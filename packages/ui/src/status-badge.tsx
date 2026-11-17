import type { ReactElement } from "react";

/** The four statuses of the design system (DSA-F-7). */
export const statusKinds = ["success", "warning", "danger", "info"] as const;

export type StatusKind = (typeof statusKinds)[number];

/** Per status: the classes that colour the mark, and the shape of its icon (24 x 24 grid). */
const marks: Record<
  StatusKind,
  { border: string; icon: string; shape: ReactElement }
> = {
  success: {
    border: "border-status-success",
    icon: "text-status-success",
    shape: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12.5 3 3 5-6" />
      </>
    ),
  },
  warning: {
    border: "border-status-warning",
    icon: "text-status-warning",
    shape: (
      <>
        <path d="M12 3.5 22 20.5H2z" />
        <path d="M12 10v5M12 17.5v.5" />
      </>
    ),
  },
  danger: {
    border: "border-status-danger",
    icon: "text-status-danger",
    shape: (
      <>
        <path d="M8 2.5h8L21.5 8v8L16 21.5H8L2.5 16V8z" />
        <path d="m9 9 6 6m0-6-6 6" />
      </>
    ),
  },
  info: {
    border: "border-status-info",
    icon: "text-status-info",
    shape: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M12 11v6M12 7.5v.5" />
      </>
    ),
  },
};

export interface StatusBadgeProps {
  status: StatusKind;
  /** What the status says, in words; the colour never says it alone. */
  label: string;
}

/**
 * A status as an icon and a text, marked by the status colour (DSA-F-7). The icon
 * differs per status and is hidden from screen readers, which read the text.
 */
export function StatusBadge({ status, label }: StatusBadgeProps): ReactElement {
  const mark = marks[status];
  return (
    <span
      className={`inline-flex items-center gap-snug rounded-md border bg-surface px-snug py-tight text-sm text-foreground ${mark.border}`}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`size-4 shrink-0 ${mark.icon}`}
      >
        {mark.shape}
      </svg>
      <span className="text-foreground">{label}</span>
    </span>
  );
}
