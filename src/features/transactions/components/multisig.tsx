import { MultiSigModel } from '../models'
import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'

export type MultiSigProps = {
  multiSig: MultiSigModel
}

export function MultiSig({ multiSig }: MultiSigProps) {
  const multiSigItems = useMemo(
    () => [
      {
        dt: 'Version',
        dd: <span>{multiSig.version}</span>,
      },
      {
        dt: 'Threshold',
        dd: <span>{multiSig.threshold}</span>,
      },
      {
        dt: 'Subsigners',
        dd: multiSig.subsigners.map((address, index) => <div key={index}>{address}</div>),
      },
    ],
    [multiSig.subsigners, multiSig.version, multiSig.threshold]
  )

  return (
    <Card className={cn('p-4')}>
      <CardContent className={cn('text-sm space-y-4')}>
        <div className={cn('space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>Multisig</h1>
          <DescriptionList items={multiSigItems} />
        </div>
      </CardContent>
    </Card>
  )
}
