import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { PropsWithChildren } from 'react'
import { ApplicationId } from '../data/types'

type Props = PropsWithChildren<{
  applicationId: ApplicationId
  className?: string
}>

export function ApplicationLink({ applicationId, className, children }: Props) {
  return (
    <TemplatedNavLink
      className={cn(!children && 'text-primary underline', className)}
      urlTemplate={Urls.Application.ById}
      urlParams={{ applicationId: applicationId.toString() }}
    >
      {children ? children : applicationId}
    </TemplatedNavLink>
  )
}
