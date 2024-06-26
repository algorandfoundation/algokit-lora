import { Multisig } from '../models'
import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'

type MultisigProps = {
  signature: Multisig
}

export const multisigVersionLabel = 'Version'
export const multisigThresholdLabel = 'Threshold'
export const multisigSubsignersLabel = 'Subsigners'

export function MultisigDetails({ signature }: MultisigProps) {
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
    <div className={cn('space-y-2')}>
      <h3>Multisig</h3>
      <Card>
        <CardContent className={cn('space-y-1')}>
          <DescriptionList items={multisigItems} />
        </CardContent>
      </Card>
    </div>
  )
}
