import { MultisigModel } from '../models'
import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'
import { transactionPageConstants } from '@/features/theme/constant'

export type MultisigProps = {
  multisig: MultisigModel
}

export function Multisig({ multisig: multisig }: MultisigProps) {
  const multisigItems = useMemo(
    () => [
      {
        dt: transactionPageConstants.labels.multisig.version,
        dd: multisig.version,
      },
      {
        dt: transactionPageConstants.labels.multisig.threshold,
        dd: multisig.threshold,
      },
      {
        dt: transactionPageConstants.labels.multisig.subsigners,
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
