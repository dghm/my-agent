/** DGHM labelled text input. Navy focus ring; deep-orange error state. */
export interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  /** Error message shown below the field */
  error?: string;
  style?: React.CSSProperties;
}
