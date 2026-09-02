/** Native select styled to the system; string or {value,label} options. */
export interface SelectProps {
  label?: string;
  options: Array<string | { value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}
export declare function Select(props: SelectProps): JSX.Element;
