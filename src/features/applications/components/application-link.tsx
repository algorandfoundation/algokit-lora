import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { PropsWithChildren } from 'react'
import { ApplicationId } from '../data/types'
import { useSelectedNetwork } from '@/features/network/data'
import { CopyButton } from '@/features/common/components/copy-button'

type Props = PropsWithChildren<{
  applicationId: ApplicationId
  className?: string
  showCopyButton?: boolean
}>

export function ApplicationLink({ applicationId, className, showCopyButton, children }: Props) {
  const [selectedNetwork] = useSelectedNetwork()

  const link = (
    <TemplatedNavLink
      className={cn(!children && 'text-primary underline truncate', className)}
      urlTemplate={Urls.Explore.Application.ById}
      urlParams={{ applicationId: applicationId.toString(), networkId: selectedNetwork }}
    >
      {children ? children : applicationId}
    </TemplatedNavLink>
  )

  return children ? (
    link
  ) : (
    <div className="flex items-center">
      {link}
      {showCopyButton && <CopyButton value={applicationId.toString()} />}
    </div>
  )
}
