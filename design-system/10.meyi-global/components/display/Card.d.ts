/** Flat bordered container; optional eyebrow + title header. */
export interface CardProps {
  children: React.ReactNode;
  /** @default "lg" (32px) */
  padding?: "sm" | "md" | "lg";
  /** Ink background with white text */
  inverse?: boolean;
  title?: string;
  /** Uppercase tracked label above the title */
  eyebrow?: string;
}
export declare function Card(props: CardProps): JSX.Element;
