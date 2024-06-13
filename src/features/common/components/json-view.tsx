import { JsonView as ReactJsonView } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import styles from './json-view.module.css'
import { cn } from '../utils'
import { Button } from './button'
import { useCallback, useState } from 'react'
import { asJson } from '@/utils/as-json'
import { toast } from 'react-toastify'
import { Dialog, DialogContent, DialogHeader } from '@/features/common/components/dialog'

type Props = {
  json: object
  exapandJsonLevel?: (level: number) => boolean
}
export function JsonView({ json, exapandJsonLevel = defaultExpandLevel }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const openJsonView = useCallback(() => {
    setDialogOpen(true)
  }, [setDialogOpen])

  // TODO: once we have the design, we need to support light/dark mode and custom themes
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
    <div>
      <Button variant="outline" className={cn('mb-2 ml-1 rounded w-32')} onClick={openJsonView}>
        View JSON
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <h4 className={cn('text-xl text-primary font-bold')}>Json</h4>
          </DialogHeader>
          <div className={cn('border-solid border-2 border-border grid w-[900px] min-h-[200px] max-h-[500px] overflow-auto')}>
            <Button variant="default" className={cn('absolute top-20 right-12')} onClick={copyJsonToClipboard}>
              Copy
            </Button>
            <ReactJsonView data={json} shouldExpandNode={exapandJsonLevel} style={style} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
// Only render the top level because sometimes the object has too many children to render
const defaultExpandLevel = (level: number) => {
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
