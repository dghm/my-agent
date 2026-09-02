/** DGHM Card surface. Also exports Tag (pill label) and Stat (data highlight). */
export interface CardProps {
  /** default = white+shadow; section = pale; brand = navy; accent = orange */
  tone?: 'default' | 'section' | 'brand' | 'accent';
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
