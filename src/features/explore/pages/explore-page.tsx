import { LatestBlocks } from '@/features/blocks/components/latest-blocks'
import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { TransactionIdLink } from '@/features/transactions/components/transaction-id-link'
import { Urls } from '@/routes/urls'

export function ExplorePage() {
  return (
    <div className={cn('grid')}>
      <TransactionIdLink transactionId="ILDCD5Z64CYSLEZIHBG5DVME2ITJI2DIVZAPDPEWPCYMTRA5SVGA">View sample transaction</TransactionIdLink>
      <TemplatedNavLink urlTemplate={Urls.Explore.Group.ById} urlParams={{ groupId: 'foo' }}>
        View sample group
      </TemplatedNavLink>
      <LatestBlocks />
    </div>
  )
}
