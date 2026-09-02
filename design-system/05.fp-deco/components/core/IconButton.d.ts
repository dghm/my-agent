/** Square icon-only button; requires an accessible label. */
export interface IconButtonProps {
  /** Accessible name (aria-label + title) */
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline" | "solid";
  disabled?: boolean;
  /** The icon node (Lucide SVG, currentColor) */
  children?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
