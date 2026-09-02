/** Modal dialog with scrim; closes on scrim click. */
export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  /** Action row, right-aligned */
  footer?: React.ReactNode;
  /** Panel width in px */
  width?: number;
  children?: React.ReactNode;
}
export declare function Dialog(props: DialogProps): JSX.Element | null;
