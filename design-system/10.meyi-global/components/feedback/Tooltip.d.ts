/** Hover/focus label on pure black. */
export interface TooltipProps {
  label: string;
  children: React.ReactNode;
  /** @default "top" */
  side?: "top" | "bottom" | "left" | "right";
}
export declare function Tooltip(props: TooltipProps): JSX.Element;
