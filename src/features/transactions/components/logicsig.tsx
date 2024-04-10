import { LogicsigModel } from '../models'
import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'
import { transactionPageConstants } from '@/features/theme/constant'

export type LogicsigProps = {
  logicsig: LogicsigModel
}

export function Logicsig({ logicsig: logicsig }: LogicsigProps) {
  const logicsigItems = useMemo(
    () => [
      {
        dt: transactionPageConstants.labels.signature.logicsig,
        dd: logicsig.logic,
      },
    ],
    [logicsig.logic]
  )
  return (
    <Card className={cn('p-4')}>
      <CardContent className={cn('text-sm space-y-4')}>
        <div className={cn('space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>Logicsig</h1>
          <DescriptionList items={logicsigItems} />
        </div>
      </CardContent>
    </Card>
  )
}
