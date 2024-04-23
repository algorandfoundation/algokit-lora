import { cn } from '@/features/common/utils'
import { Arc2TransactionNote } from '@algorandfoundation/algokit-utils/types/transaction'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'

type TransactionNoteProps = {
  note: string
}

function parseJson(maybeJson: string) {
  try {
    const json = JSON.parse(maybeJson)
    if (json && typeof json === 'object') {
      return json
    }
  } catch (e) {
    // ignore
  }
}

// Based on the ARC-2 spec https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0002.md#specification
const arc2Regex = /^([a-zA-Z0-9][a-zA-Z0-9_/@.-]{4,31}):([mjbu]{1})(.*)$/
function parseArc2(maybeArc2: string) {
  const result = maybeArc2.match(arc2Regex)
  if (result && result.length === 4) {
    return {
      dAppName: result[1],
      format: result[2] as 'm' | 'b' | 'u' | 'j',
      data: result[3],
    } satisfies Arc2TransactionNote
  }
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
  const [text, json, arc2, activeTabId] = useMemo(() => {
    const text = base64ToUtf8(note)
    const maybeJson = parseJson(text)
    const maybeArc2 = parseArc2(text)
    const activeTabId = maybeArc2 ? arc2NoteTabId : maybeJson ? jsonNoteTabId : base64NoteTabId
    return [text, maybeJson, maybeArc2, activeTabId satisfies TabId] as const
  }, [note])

  return (
    <div className={cn('space-y-2')}>
      <h2 className={cn('text-xl font-bold')}>Note</h2>
      <Tabs defaultValue={activeTabId}>
        <TabsList aria-label={noteLabel}>
          <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value={base64NoteTabId}>
            {base64NoteTabLabel}
          </TabsTrigger>
          <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value={textNoteTabId}>
            {textNoteTabLabel}
          </TabsTrigger>
          {json && (
            <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value={jsonNoteTabId}>
              {jsonNoteTabLabel}
            </TabsTrigger>
          )}
          {arc2 && (
            <TabsTrigger className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-32')} value={arc2NoteTabId}>
              {arc2NoteTabLabel}
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value={base64NoteTabId} className={cn('border-solid border-2 border-border h-60 p-4')}>
          {note}
        </TabsContent>
        <TabsContent value={textNoteTabId} className={cn('border-solid border-2 border-border h-60 p-4')}>
          {text}
        </TabsContent>
        {json && (
          <TabsContent value={jsonNoteTabId} className={cn('border-solid border-2 border-border h-60 p-4')}>
            <pre>{JSON.stringify(json, null, 2)}</pre>
          </TabsContent>
        )}
        {arc2 && (
          <TabsContent value={arc2NoteTabId} className={cn('border-solid border-2 border-border h-60 p-4')}>
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
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
