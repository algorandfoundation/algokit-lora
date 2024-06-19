import { JsonView as ReactJsonView } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'

import { cn } from '../utils'
import { Button } from './button'
import { useCallback, useState } from 'react'
import { asJson } from '@/utils/as-json'
import { toast } from 'react-toastify'
import { Dialog, DialogContent, DialogHeader } from '@/features/common/components/dialog'
import { useResolvedTheme } from '@/features/settings/data/theme'
import { styleDark, styleLight } from './json-view-styles'

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
            <div className={cn('grid grid-cols-[1fr_max-content]')}>
              <h2>JSON</h2>
              <Button variant="default" size="sm" className="mt-2" onClick={copyJsonToClipboard}>
                Copy
              </Button>
            </div>
          </DialogHeader>
          <div className={cn('border-solid border-2 border-border grid w-[900px] min-h-[200px] max-h-[500px] overflow-auto relative')}>
            <ReactJsonView data={json} shouldExpandNode={exapandJsonLevel} style={currentStyle} />
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
