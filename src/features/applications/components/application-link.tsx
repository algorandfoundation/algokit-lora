import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { PropsWithChildren } from 'react'
import { ApplicationId } from '../data/types'
import { useSelectedNetwork } from '@/features/settings/data'

type Props = PropsWithChildren<{
  applicationId: ApplicationId
  className?: string
}>

export function ApplicationLink({ applicationId, className, children }: Props) {
  const [selectedNetwork] = useSelectedNetwork()
  return (
    <TemplatedNavLink
      className={cn(!children && 'text-primary underline', className)}
      urlTemplate={Urls.Explore.Application.ById}
      urlParams={{ applicationId: applicationId.toString(), networkId: selectedNetwork }}
    >
      {children ? children : applicationId}
    </TemplatedNavLink>
  )
}
