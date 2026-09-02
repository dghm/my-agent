/** Small uppercase status pill. */
export interface BadgeProps {
  children: React.ReactNode;
  /** @default "neutral" */
  tone?: "neutral" | "inverse" | "outline" | "success" | "warning" | "danger";
}
export declare function Badge(props: BadgeProps): JSX.Element;
