/** Radio option; manage group state in the parent. */
export interface RadioProps {
  label?: string;
  checked?: boolean;
  /** Called with true when selected */
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
}
export declare function Radio(props: RadioProps): JSX.Element;
