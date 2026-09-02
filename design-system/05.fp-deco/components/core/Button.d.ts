/**
 * Brand button — navy primary, royal-blue secondary, outline and ghost variants.
 * @startingPoint section="Components" subtitle="Primary action button" viewport="700x220"
 */
export interface ButtonProps {
  /** Visual style */
  variant?: "primary" | "secondary" | "outline" | "ghost";
  /** Control height */
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** Optional leading icon node (16px Lucide SVG) */
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
