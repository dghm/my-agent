/** Single-line text input with label, hint, and error states. */
export interface InputProps {
  label?: string;
  /** Helper text under the field */
  hint?: string;
  /** Error message; overrides hint and turns the border red */
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  style?: React.CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
