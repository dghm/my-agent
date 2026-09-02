/** Modal dialog with scrim; the one place the system casts a shadow. */
export interface DialogProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  /** @default 440 */
  width?: number;
}
export declare function Dialog(props: DialogProps): JSX.Element;
