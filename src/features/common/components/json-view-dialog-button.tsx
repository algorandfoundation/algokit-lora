import { JsonView as ReactJsonView } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'

import { cn } from '../utils'
import { Button } from './button'
import { useCallback, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/features/common/components/dialog'
import { useResolvedTheme } from '@/features/settings/data/theme'
import { JsonViewStylesDark, JsonViewStylesLight } from './json-view-styles'
import { CopyButton } from './copy-button'
import { Description } from '@radix-ui/react-dialog'

type Props = {
  json: string
  expandJsonLevel?: (level: number) => boolean
}

export function OpenJsonViewDialogButton({ json, expandJsonLevel = defaultExpandLevel }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const openJsonViewDialog = useCallback(() => {
    setDialogOpen(true)
  }, [setDialogOpen])

  const theme = useResolvedTheme()
  const currentStyle = theme === 'dark' ? JsonViewStylesDark : JsonViewStylesLight

  return (
    <>
      <Button className="ml-auto hidden w-28 md:flex" variant="outline" onClick={openJsonViewDialog}>
        View JSON
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        {dialogOpen && (
          <DialogContent className="bg-card">
            <Description hidden={true}>JSON information</Description>
            <DialogHeader className="flex-row items-center space-y-0">
              <DialogTitle asChild>
                <h2>JSON</h2>
              </DialogTitle>
              <CopyButton value={json} />
            </DialogHeader>
            <div className={cn('grid w-auto min-w-[450px] h-[450px] overflow-auto px-4 pb-4')}>
              <div className="[&>div>div]:m-0">
                <ReactJsonView data={JSON.parse(json)} shouldExpandNode={expandJsonLevel} style={currentStyle} />
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

// By default only render the top level because sometimes the object has too many children, which result in the UI thread being blocked on mount.
const defaultExpandLevel = (level: number) => {
  return level < 1
}
