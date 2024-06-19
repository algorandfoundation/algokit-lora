import { cn } from '@/features/common/utils'
import { useCallback, useMemo, useState } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'
import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { parseArc2 } from '../mappers/arc-2'
import { parseJson } from '@/utils/parse-json'
import { useResolvedTheme } from '@/features/settings/data'
import { styleDark, styleLight } from '@/features/common/components/json-view-styles'
import { JsonView as ReactJsonView } from 'react-json-view-lite'
import { Button } from '@/features/common/components/button'
import { asJson } from '@/utils/as-json'
import { toast } from 'react-toastify'

type TransactionNoteProps = {
  note: string
}

const base64NoteTabId = 'base64'
const textNoteTabId = 'text'
const jsonNoteTabId = 'json'
const arc2NoteTabId = 'arc2'
type TabId = typeof base64NoteTabId | typeof textNoteTabId | typeof jsonNoteTabId | typeof arc2NoteTabId
export const noteLabel = 'View Note Details'
export const base64NoteTabLabel = 'Base64'
export const textNoteTabLabel = 'UTF-8'
export const jsonNoteTabLabel = 'JSON'
export const arc2NoteTabLabel = 'ARC-2'
const arc2FormatLabels = {
  m: 'MsgPack',
  b: 'bytes',
  u: textNoteTabLabel,
  j: jsonNoteTabLabel,
}

export function TransactionNote({ note }: TransactionNoteProps) {
  const [text, json, arc2, defaultTabId] = useMemo(() => {
    const text = base64ToUtf8(note)
    const maybeJson = parseJson(text)
    const maybeArc2 = parseArc2(text)
    const activeTabId = maybeArc2 ? arc2NoteTabId : maybeJson ? jsonNoteTabId : base64NoteTabId
    return [text, maybeJson, maybeArc2, activeTabId satisfies TabId] as const
  }, [note])

  const theme = useResolvedTheme()
  const currentStyle = theme === 'dark' ? styleDark : styleLight
  const [activeTabId, setActiveTabId] = useState<TabId>(defaultTabId)

  const copyToClipboard = useCallback(() => {
    let contentToCopy = ''

    if (activeTabId === base64NoteTabId) {
      contentToCopy = note
    } else if (activeTabId === textNoteTabId) {
      contentToCopy = text
    } else if (activeTabId === jsonNoteTabId && json) {
      contentToCopy = asJson(json)
    } else if (activeTabId === arc2NoteTabId && arc2) {
      contentToCopy = arc2.format === 'j' && parseJson(arc2.data) ? JSON.stringify(parseJson(arc2.data), null, 4) : arc2.data
    }

    navigator.clipboard.writeText(contentToCopy)
    toast.success('Content copied to clipboard')
  }, [activeTabId, note, text, json, arc2])
  return (
    <div className={cn('space-y-2')}>
      <h3>Note</h3>
      <Tabs defaultValue={defaultTabId} onValueChange={(value) => setActiveTabId(value as TabId)}>
        <div className={cn('grid grid-cols-[1fr_max-content]')}>
          <TabsList aria-label={noteLabel}>
            <TabsTrigger className="w-32" value={base64NoteTabId}>
              {base64NoteTabLabel}
            </TabsTrigger>
            <TabsTrigger className="w-32" value={textNoteTabId}>
              {textNoteTabLabel}
            </TabsTrigger>
            {json && (
              <TabsTrigger className="w-32" value={jsonNoteTabId}>
                {jsonNoteTabLabel}
              </TabsTrigger>
            )}
            {arc2 && (
              <TabsTrigger className="w-32" value={arc2NoteTabId}>
                {arc2NoteTabLabel}
              </TabsTrigger>
            )}
          </TabsList>
          <Button className={cn('ml-auto')} variant="outline" onClick={copyToClipboard}>
            copy
          </Button>
        </div>
        <OverflowAutoTabsContent value={base64NoteTabId}>{note}</OverflowAutoTabsContent>
        <OverflowAutoTabsContent value={textNoteTabId}>{text}</OverflowAutoTabsContent>
        {json && (
          <OverflowAutoTabsContent value={jsonNoteTabId}>
            <ReactJsonView data={json} style={currentStyle} />
          </OverflowAutoTabsContent>
        )}
        {arc2 && (
          <OverflowAutoTabsContent value={arc2NoteTabId}>
            <DescriptionList
              items={[
                { dt: 'DApp Name', dd: arc2.dAppName },
                { dt: 'Format', dd: arc2FormatLabels[arc2.format] },
              ]}
            />
            {arc2.format === 'j' && parseJson(arc2.data) ? (
              <pre>{JSON.stringify(parseJson(arc2.data), null, 2)}</pre>
            ) : (
              <pre>{arc2.data}</pre>
            )}
          </OverflowAutoTabsContent>
        )}
      </Tabs>
    </div>
  )
}
