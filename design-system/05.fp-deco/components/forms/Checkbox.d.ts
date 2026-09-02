/** Checkbox with label; controlled or uncontrolled. */
export interface CheckboxProps {
  label?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
