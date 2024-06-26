import { RenderLoadable } from '@/features/common/components/render-loadable'
import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { useProgramTeal } from '../data/program-teal'

const base64ProgramTabId = 'base64'
const tealProgramTabId = 'teal'
export const base64ProgramTabLabel = 'Base64'
export const tealProgramTabLabel = 'Teal'

type Props = {
  tabsListAriaLabel: string
  base64Program: string
}
export function ApplicationProgram({ tabsListAriaLabel, base64Program }: Props) {
  const [tealLoadable, fetchTeal] = useProgramTeal(base64Program)

  return (
    <Tabs
      defaultValue={base64ProgramTabId}
      onValueChange={(activeTab) => {
        if (activeTab === tealProgramTabId) {
          fetchTeal()
        }
      }}
    >
      <TabsList aria-label={tabsListAriaLabel}>
        <TabsTrigger className="w-32" value={base64ProgramTabId}>
          {base64ProgramTabLabel}
        </TabsTrigger>
        <TabsTrigger className="w-32" value={tealProgramTabId}>
          {tealProgramTabLabel}
        </TabsTrigger>
      </TabsList>
      <OverflowAutoTabsContent value={base64ProgramTabId} overflowContainerClassName="max-h-96">
        <pre className="text-wrap break-all">{base64Program ?? 'No program available.'}</pre>
      </OverflowAutoTabsContent>
      <OverflowAutoTabsContent value={tealProgramTabId} overflowContainerClassName="max-h-96">
        <RenderLoadable loadable={tealLoadable}>{(teal) => <pre>{teal ?? 'No program available.'}</pre>}</RenderLoadable>
      </OverflowAutoTabsContent>
    </Tabs>
  )
}
