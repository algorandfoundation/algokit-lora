import { cn } from '@/features/common/utils'
import { applicationBoxNameLabel, applicationBoxValueLabel } from './labels'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'
import { ApplicationBox } from '../models'
import { ApplicationId } from '../data/types'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { useLoadableApplicationBox } from '../data/application-boxes'
import { Dialog, DialogContent, DialogHeader, DialogTrigger, MediumSizeDialogBody } from '@/features/common/components/dialog'

type Props = { applicationId: ApplicationId; boxName: string }

const dialogTitle = 'Application Box'
export function ApplicationBoxDetailsDialog({ applicationId, boxName }: Props) {
  return (
    <Dialog modal={true}>
      <DialogTrigger>
        <label className={cn('text-primary underline cursor-pointer')}>{boxName}</label>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <h2 className="pb-0">{dialogTitle}</h2>
        </DialogHeader>
        <MediumSizeDialogBody>
          <InternalDialogContent applicationId={applicationId} boxName={boxName} />
        </MediumSizeDialogBody>
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
