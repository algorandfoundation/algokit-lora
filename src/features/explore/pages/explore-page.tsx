import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'

export function ExplorePage() {
  return (
    <div className={cn('grid')}>
      <TemplatedNavLink
        urlTemplate={Urls.Explore.Transaction.ById}
        urlParams={{ transactionId: 'QOOBRVQMX4HW5QZ2EGLQDQCQTKRF3UP3JKDGKYPCXMI6AVV35KQA' }}
      >
        View sample transaction
      </TemplatedNavLink>
      <TemplatedNavLink urlTemplate={Urls.Explore.Group.ById} urlParams={{ groupId: 'foo' }}>
        View sample group
      </TemplatedNavLink>
    </div>
  )
}
