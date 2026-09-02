/**
 * DGHM Button. Primary = orange CTA (#E5622A + white); secondary = navy; outline/ghost for low emphasis.
 * @startingPoint section="Components" subtitle="CTA 與各層級按鈕" viewport="700x170"
 */
export interface ButtonProps {
  /** Visual style */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
