import { JsonView as ReactJsonView } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import styles from './json-view.module.css'
import { cn } from '../utils'
import { Button } from './button'
import { useCallback } from 'react'
import { asJson } from '@/utils/as-json'
import { toast } from 'react-toastify'

export function JsonView({ json }: { json: object }) {
  // TODO: one we have the design, we need to support light/dard mode and custom themes
  const style: StyleProps = {
    container: '',
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

  const copyJsonToClipboard = useCallback(() => {
    const jsonString = asJson(json)
    navigator.clipboard.writeText(jsonString)

    toast.success('JSON copied to clipboard')
  }, [json])

  return (
    <div className={cn('overflow-auto relative p-2')}>
      <Button className={cn('absolute top-4 right-4')} onClick={copyJsonToClipboard}>
        Copy
      </Button>
      <ReactJsonView data={json} shouldExpandNode={shouldExpandNode} style={style} />
    </div>
  )
}
// Only render the top level because sometimes the object has too many children to render
const shouldExpandNode = (level: number) => {
  return level < 1
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
