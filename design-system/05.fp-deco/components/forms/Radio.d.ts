/** Radio group; renders all options. */
export interface RadioProps {
  name?: string;
  /** Strings or {value,label} pairs */
  options?: Array<string | { value: string; label: string }>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  direction?: "row" | "column";
  style?: React.CSSProperties;
}
export declare function Radio(props: RadioProps): JSX.Element;
