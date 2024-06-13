import { JsonView as ReactJsonView } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import styles from './json-view.module.css'
import { cn } from '../utils'
import { Button } from './button'
import { useCallback, useState } from 'react'
import { asJson } from '@/utils/as-json'
import { toast } from 'react-toastify'
import { Dialog, DialogContent, DialogHeader } from '@/features/common/components/dialog'
import { useResolvedTheme } from '@/features/settings/data/theme'

type Props = {
  json: object
  exapandJsonLevel?: (level: number) => boolean
}
export function OpenJsonViewDialogButton({ json, exapandJsonLevel = defaultExpandLevel }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const openJsonViewDialog = useCallback(() => {
    setDialogOpen(true)
  }, [setDialogOpen])

  const styleDark: StyleProps = {
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
  const styleLight: StyleProps = {
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

  const theme = useResolvedTheme()
  const currentStyle = theme === 'dark' ? styleDark : styleLight

  const copyJsonToClipboard = useCallback(() => {
    const jsonString = asJson(json)
    navigator.clipboard.writeText(jsonString)

    toast.success('JSON copied to clipboard')
  }, [json])

  return (
    <>
      <Button variant="outline" onClick={openJsonViewDialog}>
        View JSON
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <h4 className={cn('text-xl text-primary font-bold')}>JSON</h4>
          </DialogHeader>
          <div className={cn('border-solid border-2 border-border grid w-[900px] min-h-[200px] max-h-[500px] overflow-auto relative')}>
            <Button variant="default" className={cn('absolute top-2 right-2')} onClick={copyJsonToClipboard}>
              Copy
            </Button>
            <ReactJsonView data={json} shouldExpandNode={exapandJsonLevel} style={currentStyle} />
          </div>
        </DialogContent>
      </Dialog>
    </>
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
