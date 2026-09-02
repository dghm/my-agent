/** Pill-shaped filter/keyword tag; the one pill shape in the system. */
export interface TagProps {
  /** Show a remove (×) affordance */
  onRemove?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Tag(props: TagProps): JSX.Element;
