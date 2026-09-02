/**
 * Primary action control. Monochrome variants only.
 * @startingPoint section="Actions" subtitle="Primary, secondary, ghost and inverse buttons" viewport="700x180"
 */
export interface ButtonProps {
  children: React.ReactNode;
  /** @default "primary" */
  variant?: "primary" | "secondary" | "ghost" | "inverse";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}
export declare function Button(props: ButtonProps): JSX.Element;
