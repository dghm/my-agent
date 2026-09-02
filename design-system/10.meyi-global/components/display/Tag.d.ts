/** Removable / selectable filter chip. */
export interface TagProps {
  children: React.ReactNode;
  /** Shows an × affordance */
  onRemove?: () => void;
  /** Selected state (inverts to near-black) */
  active?: boolean;
  onClick?: () => void;
}
export declare function Tag(props: TagProps): JSX.Element;
