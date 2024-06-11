import { ApplicationSwimlane, colors } from '@/features/transactions/components/transactions-graph/models'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'
import { useMemo } from 'react'
import { AccountLink } from '@/features/accounts/components/account-link'
import { applicationIdLabel } from '@/features/applications/components/labels'
import { ApplicationLink } from '@/features/applications/components/application-link'

export function ApplicationSwimlaneTooltipContent({ application }: { application: ApplicationSwimlane }) {
  const items = useMemo(
    () => [
      {
        dt: applicationIdLabel,
        dd: <ApplicationLink applicationId={application.id} />,
      },
      ...application.addresses.map((address, index) => ({
        dt: 'Address',
        dd: <AccountLink address={address} style={{ color: colors[index] }} />,
      })),
    ],
    [application.addresses, application.id]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}
