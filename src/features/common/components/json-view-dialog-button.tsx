import { JsonView as ReactJsonView } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'

import { cn } from '../utils'
import { Button } from './button'
import { useCallback, useState } from 'react'
import { asJson } from '@/utils/as-json'
import { toast } from 'react-toastify'
import { Dialog, DialogContent, DialogHeader } from '@/features/common/components/dialog'
import { useResolvedTheme } from '@/features/settings/data/theme'
import { JsonViewStylesDark, JsonViewStylesLight } from './json-view-styles'
import { CopyButton } from './copy-button'

type Props = {
  json: object
  expandJsonLevel?: (level: number) => boolean
}

export function OpenJsonViewDialogButton({ json, expandJsonLevel: exapandJsonLevel = defaultExpandLevel }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const openJsonViewDialog = useCallback(() => {
    setDialogOpen(true)
  }, [setDialogOpen])

  const theme = useResolvedTheme()
  const currentStyle = theme === 'dark' ? JsonViewStylesDark : JsonViewStylesLight

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
        <DialogContent className="gap-0 bg-card">
          <DialogHeader className="flex-row gap-1">
            <h2>JSON</h2>
            <CopyButton className={cn('size-5')} onClick={copyJsonToClipboard} />
          </DialogHeader>
          <div className={cn('border grid w-auto min-w-[450px] max-w-[700px] h-[450px] relative')}>
            <div className="overflow-auto">
              <ReactJsonView data={json} shouldExpandNode={exapandJsonLevel} style={currentStyle} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
// By default only render the top level because sometimes the object has too many children, which result in the UI thread being blocked on mount.
const defaultExpandLevel = (level: number) => {
  return level < 1
}
