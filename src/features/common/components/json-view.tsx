import { JsonView as ReactJsonView } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import styles from './json-view.module.css'
import { cn } from '../utils'
import { Button } from './button'
import { useCallback, useState } from 'react'
import { asJson } from '@/utils/as-json'
import { toast } from 'react-toastify'
import { Dialog, DialogContent, DialogHeader } from '@/features/common/components/dialog'

export function JsonView({ json }: { json: object }) {
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
      <Button className={cn('mb-2 ml-2 rounded')} onClick={openJsonView}>
        View JSON
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        <DialogContent className="w-[900px] bg-card">
          <DialogHeader>
            <h4 className={cn('text-xl text-primary font-bold')}>Json</h4>
          </DialogHeader>
          <div className={cn('border-solid border-2 border-border h-96 grid')}>
            <Button variant="default" className={cn('absolute top-20 right-9')} onClick={copyJsonToClipboard}>
              Copy
            </Button>
            <ReactJsonView data={json} shouldExpandNode={shouldExpandNode} style={style} />
          </div>
        </DialogContent>
      </Dialog>
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
