import { JsonView as ReactJsonView } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'

import { cn } from '../utils'
import { Button } from './button'
import { useCallback, useState } from 'react'
import { asJson } from '@/utils/as-json'
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

  return (
    <>
      <Button variant="outline" onClick={openJsonViewDialog}>
        View JSON
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        <DialogContent className="bg-card">
          <DialogHeader className="flex-row items-center">
            <h2>JSON</h2>
            <CopyButton value={asJson(json)} className="pb-3" />
          </DialogHeader>
          <div className={cn('border grid w-auto min-w-[300px] h-[450px]')}>
            <div className="overflow-auto px-1 py-3">
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
