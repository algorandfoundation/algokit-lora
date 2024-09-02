import { useState } from 'react'
import { Button } from '@/features/common/components/button'
import { Dialog, DialogContent, DialogTrigger, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { Application } from '../models'
import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { useProgramTeal } from '../data/program-teal'
import { RenderLoadable } from '@/features/common/components/render-loadable'

type Props = {
  application: Application
}

const approvalBase64ProgramTabId = 'approval-base64'
const approvalTealProgramTabId = 'approval-teal'
const clearStateBase64ProgramTabId = 'clear-state-base64'
const clearStateTealProgramTabId = 'clear-state-teal'

export function ApplicationProgramsButton({ application }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const [approvalTealLoadable, fetchApprovalTeal] = useProgramTeal(application.approvalProgram)
  const [clearStateTealLoadable, fetchClearStateTeal] = useProgramTeal(application.clearStateProgram)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">View Programs</Button>
      </DialogTrigger>
      <DialogContent>
        <MediumSizeDialogBody>
          <h2>Programs</h2>
          <Tabs
            defaultValue={approvalBase64ProgramTabId}
            onValueChange={(activeTab) => {
              if (activeTab === approvalTealProgramTabId) {
                fetchApprovalTeal()
              }
              if (activeTab === clearStateTealProgramTabId) {
                fetchClearStateTeal()
              }
            }}
          >
            <TabsList>
              <TabsTrigger className="w-fit px-4" value={approvalBase64ProgramTabId}>
                Approval (Base64)
              </TabsTrigger>
              <TabsTrigger className="w-fit px-4" value={approvalTealProgramTabId}>
                Approval (Teal)
              </TabsTrigger>
              <TabsTrigger className="w-fit px-4" value={clearStateBase64ProgramTabId}>
                Clear State (Base64)
              </TabsTrigger>
              <TabsTrigger className="w-fit px-4" value={clearStateTealProgramTabId}>
                Clear State (Teal)
              </TabsTrigger>
            </TabsList>
            <OverflowAutoTabsContent value={approvalBase64ProgramTabId}>
              <pre className="h-96 overflow-y-auto text-wrap break-all">{application.approvalProgram ?? 'No program available.'}</pre>
            </OverflowAutoTabsContent>
            <OverflowAutoTabsContent value={approvalTealProgramTabId}>
              <div className="h-96 overflow-y-auto">
                <RenderLoadable loadable={approvalTealLoadable}>{(teal) => <pre>{teal ?? 'No program available.'}</pre>}</RenderLoadable>
              </div>
            </OverflowAutoTabsContent>
            <OverflowAutoTabsContent value={clearStateBase64ProgramTabId}>
              <pre className="h-96  overflow-y-auto text-wrap break-all">{application.clearStateProgram ?? 'No program available.'}</pre>
            </OverflowAutoTabsContent>
            <OverflowAutoTabsContent value={clearStateTealProgramTabId}>
              <div className="h-96 overflow-y-auto">
                <RenderLoadable loadable={clearStateTealLoadable}>{(teal) => <pre>{teal ?? 'No program available.'}</pre>}</RenderLoadable>
              </div>
            </OverflowAutoTabsContent>
          </Tabs>
        </MediumSizeDialogBody>
      </DialogContent>
    </Dialog>
  )
}
