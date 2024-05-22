import { JsonView, allExpanded, darkStyles } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import { cn } from '../utils'

export function JsonViewer({ json }: { json: object }) {
  // TODO: switch theme
  const style: StyleProps = {
    container: cn('overflow-auto'),
    basicChildStyle: '',
    collapseIcon: '',
    expandIcon: '',
    collapsedContent: '...',
    label: '',
    clickableLabel: '',
    nullValue: '',
    undefinedValue: '',
    numberValue: '',
    stringValue: '',
    booleanValue: '',
    otherValue: '',
    punctuation: '',
    noQuotesForStringValues: false,
  }

  return (
    <div className={cn('overflow-auto')}>
      <JsonView data={json} shouldExpandNode={allExpanded} style={darkStyles} />
    </div>
  )
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
