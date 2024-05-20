import { cn } from '@/features/common/utils'
import { applicationBoxNameLabel, applicationBoxValueLabel } from './labels'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'
import { ApplicationBox } from '../models'
import { ApplicationId } from '../data/types'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { useLoadableApplicationBox } from '../data/application-boxes'
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/features/common/components/dialog'

type Props = { applicationId: ApplicationId; boxName: string }

export function ApplicationBoxDetailsDialog({ applicationId, boxName }: Props) {
  return (
    <Dialog>
      <DialogTrigger>
        <label className={cn('text-primary underline')}>{boxName}</label>
      </DialogTrigger>
      <DialogContent className="w-[800px]">
        <DialogHeader>
          <h1 className={cn('text-2xl text-primary font-bold')}>Application Box</h1>
        </DialogHeader>
        <InternalDialogContent applicationId={applicationId} boxName={boxName} />
      </DialogContent>
    </Dialog>
  )
}

function InternalDialogContent({ applicationId, boxName }: Props) {
  const loadableApplicationBox = useLoadableApplicationBox(applicationId, boxName)

  return (
    <RenderLoadable loadable={loadableApplicationBox}>
      {(applicationBox) => <ApplicationBoxDetails applicationBox={applicationBox} />}
    </RenderLoadable>
  )
}

function ApplicationBoxDetails({ applicationBox }: { applicationBox: ApplicationBox }) {
  const items = useMemo(
    () => [
      {
        dt: applicationBoxNameLabel,
        dd: applicationBox.name,
      },
      {
        dt: applicationBoxValueLabel,
        dd: (
          <div className="grid">
            <div className="overflow-y-auto break-words"> {applicationBox.value}</div>
          </div>
        ),
      },
    ],
    [applicationBox.name, applicationBox.value]
  )

  return <DescriptionList items={items} />
}
