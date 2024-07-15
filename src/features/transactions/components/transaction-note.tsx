import { cn } from '@/features/common/utils'
import { useCallback, useMemo, useState } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'
import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { parseArc2 } from '../mappers/arc-2'
import { parseJson } from '@/utils/parse-json'
import { useResolvedTheme } from '@/features/settings/data'
import { JsonViewStylesDark, JsonViewStylesLight } from '@/features/common/components/json-view-styles'
import { JsonView as ReactJsonView } from 'react-json-view-lite'
import { asJson } from '@/utils/as-json'
import { CopyButton } from '@/features/common/components/copy-button'

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
  const currentStyle = theme === 'dark' ? JsonViewStylesDark : JsonViewStylesLight
  const [activeTabId, setActiveTabId] = useState<TabId>(defaultTabId)

  const valueToCopy = useCallback(() => {
    if (activeTabId === textNoteTabId) {
      return text
    } else if (activeTabId === jsonNoteTabId && json) {
      return asJson(json)
    } else if (activeTabId === arc2NoteTabId && arc2) {
      return text
    }
    return note
  }, [activeTabId, note, text, json, arc2])

  return (
    <div className={cn('space-y-2')}>
      <div className="flex items-center">
        <h3>Note</h3>
        <CopyButton value={valueToCopy} />
      </div>

      <Tabs defaultValue={defaultTabId} onValueChange={(value) => setActiveTabId(value as TabId)}>
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

        <OverflowAutoTabsContent value={base64NoteTabId} overflowContainerClassName="max-h-96">
          <span className="text-wrap break-all">{note}</span>
        </OverflowAutoTabsContent>
        <OverflowAutoTabsContent value={textNoteTabId} overflowContainerClassName="max-h-96">
          <span className="text-wrap break-all">{text}</span>
        </OverflowAutoTabsContent>
        {json && (
          <OverflowAutoTabsContent value={jsonNoteTabId} overflowContainerClassName="max-h-96">
            <div className="[&>div>div]:m-0">
              <ReactJsonView data={json} style={currentStyle} />
            </div>
          </OverflowAutoTabsContent>
        )}
        {arc2 && (
          <OverflowAutoTabsContent value={arc2NoteTabId} overflowContainerClassName="max-h-96">
            <div className="overflow-auto">
              <DescriptionList
                items={[
                  { dt: 'DApp Name', dd: arc2.dAppName },
                  { dt: 'Format', dd: arc2FormatLabels[arc2.format] },
                ]}
              />
              {arc2.format === 'j' && parseJson(arc2.data) ? (
                <div className="[&>div>div]:m-0">
                  <ReactJsonView data={parseJson(arc2.data)} style={currentStyle} />
                </div>
              ) : (
                <pre>{arc2.data}</pre>
              )}
            </div>
          </OverflowAutoTabsContent>
        )}
      </Tabs>
    </div>
  )
}
