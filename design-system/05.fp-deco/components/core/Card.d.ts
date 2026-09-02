/** Content card — hairline border by default, soft navy shadow when elevated. */
export interface CardProps {
  /** Shadow instead of border; lifts one step on hover */
  elevated?: boolean;
  /** Navy surface with light text */
  dark?: boolean;
  /** Inner padding in px */
  padding?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Card(props: CardProps): JSX.Element;
