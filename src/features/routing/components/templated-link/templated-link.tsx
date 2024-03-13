import type { AriaAttributes, ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { UrlTemplateObj } from '../../../../routes/url-template'

export interface TemplatedLinkProps<TTemplateParams> extends AriaAttributes {
  className?: string
  urlTemplate: UrlTemplateObj<TTemplateParams>
  urlParams?: Partial<TTemplateParams>
  children?: ReactNode
}

export function TemplatedLink<TTemplateArgs>({
  className,
  children,
  urlTemplate,
  urlParams,
  ...linkProps
}: TemplatedLinkProps<TTemplateArgs>) {
  const existingParams = useParams()
  return (
    <Link to={urlTemplate.build({ ...existingParams, ...urlParams } as TTemplateArgs)} {...linkProps}>
      {children}
    </Link>
  )
}
