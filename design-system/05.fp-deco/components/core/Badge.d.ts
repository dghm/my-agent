/** Small status label. */
export interface BadgeProps {
  tone?: "neutral" | "brand" | "accent" | "success" | "warning" | "danger";
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): JSX.Element;
