import styles from './json-view-styles.module.css'

interface JsonViewStyles {
  container: string
  basicChildStyle: string
  label: string
  clickableLabel: string
  nullValue: string
  undefinedValue: string
  numberValue: string
  stringValue: string
  booleanValue: string
  otherValue: string
  punctuation: string
  expandIcon: string
  collapseIcon: string
  collapsedContent: string
  noQuotesForStringValues: boolean
}
export const JsonViewStylesDark: JsonViewStyles = {
  container: styles['key-dark'],
  basicChildStyle: styles['basic-element-style'],
  collapseIcon: styles['collapse-icon'],
  expandIcon: styles['expand-icon'],
  collapsedContent: styles['collapsed-content'],
  label: styles['label'],
  clickableLabel: styles['clickable-label'],
  nullValue: '',
  undefinedValue: '',
  stringValue: styles['value-string-dark'],
  booleanValue: styles['value-boolean-dark'],
  numberValue: styles['value-number-dark'],
  otherValue: '',
  punctuation: styles['punctuation-dark'],
  noQuotesForStringValues: false,
}
export const JsonViewStylesLight: JsonViewStyles = {
  container: styles['key-light'],
  basicChildStyle: styles['basic-element-style'],
  collapseIcon: styles['collapse-icon'],
  expandIcon: styles['expand-icon'],
  collapsedContent: styles['collapsed-content'],
  label: styles['label'],
  clickableLabel: styles['clickable-label'],
  nullValue: '',
  undefinedValue: '',
  stringValue: styles['value-string-light'],
  booleanValue: styles['value-boolean-light'],
  numberValue: styles['value-number-light'],
  otherValue: '',
  punctuation: styles['punctuation-light'],
  noQuotesForStringValues: false,
}
