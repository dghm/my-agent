/** Transient ink-colored notification; render fixed at a screen corner. */
export interface ToastProps {
  message: string;
  /** @default "neutral" */
  tone?: "neutral" | "success" | "warning" | "danger";
  action?: { label: string; onClick: () => void };
  visible?: boolean;
}
export declare function Toast(props: ToastProps): JSX.Element;
