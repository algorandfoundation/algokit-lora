import { Pqsig } from '../models'
import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'

type PqsigProps = {
  signature: Pqsig
}

export const pqsigSchemeLabel = 'Scheme'
export const pqsigSaltLabel = 'Salt'
export const pqsigPublicKeyLabel = 'Public Key'

export function PqsigDetails({ signature }: PqsigProps) {
  const pqsigItems = useMemo(
    () => [
      {
        dt: pqsigSchemeLabel,
        dd: signature.scheme,
      },
      {
        dt: pqsigSaltLabel,
        dd: signature.salt,
      },
      {
        dt: pqsigPublicKeyLabel,
        dd: <span className="break-all">{signature.publicKey}</span>,
      },
    ],
    [signature.scheme, signature.salt, signature.publicKey]
  )

  return (
    <div className={cn('space-y-2')}>
      <h3>PQSig</h3>
      <Card>
        <CardContent className={cn('space-y-1')}>
          <DescriptionList items={pqsigItems} />
        </CardContent>
      </Card>
    </div>
  )
}
