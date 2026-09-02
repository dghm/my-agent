/** Single-line text field with label, hint and error states. */
export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  /** @default "text" */
  type?: string;
  hint?: string;
  /** Error message; also switches border to danger */
  error?: string;
  disabled?: boolean;
  /** @default "md" */
  size?: "sm" | "md";
}
export declare function Input(props: InputProps): JSX.Element;
