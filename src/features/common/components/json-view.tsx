import { JsonView as ReactJsonView, allExpanded } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import styles from './json-view.module.css'
import { cn } from '../utils'

export function JsonView({ json }: { json: object }) {
  // TODO: one we have the design, we need to support light/dard mode and custom themes
  const style: StyleProps = {
    container: cn('overflow-auto'),
    basicChildStyle: styles['basic-element-style'],
    collapseIcon: styles['collapse-icon'],
    expandIcon: styles['expand-icon'],
    collapsedContent: styles['collapsed-content'],
    label: styles['label'],
    clickableLabel: styles['clickable-label'],
    nullValue: '',
    undefinedValue: '',
    stringValue: '',
    booleanValue: '',
    numberValue: '',
    otherValue: '',
    punctuation: styles['punctuation'],
    noQuotesForStringValues: false,
  }

  return <ReactJsonView data={json} shouldExpandNode={allExpanded} style={style} />
}

export interface StyleProps {
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
