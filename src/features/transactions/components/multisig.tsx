import { MultisigModel } from '../models'
import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'
import { multisigConstants } from '@/features/theme/constant'

export type MultisigProps = {
  multisig: MultisigModel
}

export function Multisig({ multisig: multisig }: MultisigProps) {
  const multisigItems = useMemo(
    () => [
      {
        dt: multisigConstants.labels.version,
        dd: multisig.version,
      },
      {
        dt: multisigConstants.labels.threshold,
        dd: multisig.threshold,
      },
      {
        dt: multisigConstants.labels.subsigners,
        dd: multisig.subsigners.map((address, index) => <div key={index}>{address}</div>),
      },
    ],
    [multisig.subsigners, multisig.version, multisig.threshold]
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
