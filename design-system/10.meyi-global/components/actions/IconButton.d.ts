/** Square icon-only button; requires an accessible label. */
export interface IconButtonProps {
  /** The icon element (16–24px, stroke 1.5, currentColor) */
  children: React.ReactNode;
  /** Accessible name — required */
  label: string;
  /** @default "ghost" */
  variant?: "primary" | "secondary" | "ghost";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
