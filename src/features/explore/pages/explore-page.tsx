import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'

export function ExplorePage() {
  return (
    <div>
      <TemplatedNavLink
        urlTemplate={Urls.Explore.Transaction.ById}
        urlParams={{ transactionId: 'QOOBRVQMX4HW5QZ2EGLQDQCQTKRF3UP3JKDGKYPCXMI6AVV35KQA' }}
      >
        View sample transaction
      </TemplatedNavLink>
    </div>
  )
}
