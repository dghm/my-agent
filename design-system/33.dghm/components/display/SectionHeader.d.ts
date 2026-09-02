/** DGHM section heading (orange eyebrow + navy title + slate lede). Also exports PhaseStep (numbered process card). */
export interface SectionHeaderProps {
  /** Small uppercase label above the title, e.g. "Service Process" */
  eyebrow?: string;
  title: string;
  lede?: string;
  align?: 'left' | 'center';
  /** White text for navy/dark backgrounds */
  onDark?: boolean;
  style?: React.CSSProperties;
}
