/** Underline tab bar; controlled or uncontrolled. */
export interface TabsProps {
  tabs: Array<string | { value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
}
export declare function Tabs(props: TabsProps): JSX.Element;
