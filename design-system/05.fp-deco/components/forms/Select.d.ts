/** Native select styled to match Input. */
export interface SelectProps {
  label?: string;
  /** Strings or {value,label} pairs */
  options?: Array<string | { value: string; label: string }>;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  style?: React.CSSProperties;
}
export declare function Select(props: SelectProps): JSX.Element;
