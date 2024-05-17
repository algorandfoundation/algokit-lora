import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { PropsWithChildren } from 'react'
import { ApplicationId } from '../data/types'

type Props = PropsWithChildren<{
  applicationId: ApplicationId
  boxName: string
  className?: string
}>

export function ApplicationBoxLink({ applicationId, boxName, className, children }: Props) {
  return (
    <TemplatedNavLink
      className={cn(!children && 'text-primary underline', className)}
      urlTemplate={Urls.Explore.Application.ById.Box.ById}
      urlParams={{ applicationId: applicationId.toString(), boxName }}
    >
      {children ? children : boxName}
    </TemplatedNavLink>
  )
}
