import { MultisigModel } from '../models'
import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'

type MultisigProps = {
  signature: MultisigModel
}

export const multisigVersionLabel = 'Version'
export const multisigThresholdLabel = 'Threshold'
export const multisigSubsignersLabel = 'Subsigners'

export function Multisig({ signature }: MultisigProps) {
  const multisigItems = useMemo(
    () => [
      {
        dt: multisigVersionLabel,
        dd: signature.version,
      },
      {
        dt: multisigThresholdLabel,
        dd: signature.threshold,
      },
      {
        dt: multisigSubsignersLabel,
        dd: signature.subsigners.map((address, index) => <div key={index}>{address}</div>),
      },
    ],
    [signature.subsigners, signature.version, signature.threshold]
  )

  return (
    <Card className={cn('p-4')}>
      <CardContent className={cn('text-sm space-y-4')}>
        <div className={cn('space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>Multisig</h1>
          <DescriptionList items={multisigItems} />
        </div>
      </CardContent>
    </Card>
  )
}
