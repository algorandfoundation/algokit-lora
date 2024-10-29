import { type ReactNode } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { UrlTemplateObj } from '../../../../routes/url-template'
import { fixedForwardRef } from '@/utils/fixed-forward-ref'

export interface TemplatedNavLinkProps<TTemplateParams> {
  className?: string
  title?: string
  urlTemplate: UrlTemplateObj<TTemplateParams>
  urlParams?: Partial<TTemplateParams>
  queryParams?: Record<string, string | number | boolean>
  children?: ReactNode
  ref?: React.LegacyRef<HTMLAnchorElement>
}

const buildQueryString = (queryParams?: Record<string, string | number | boolean>) => {
  if (!queryParams) return ''
  const queryString = new URLSearchParams(queryParams as Record<string, string>).toString()
  return queryString ? `?${queryString}` : ''
}

export const TemplatedNavLink = fixedForwardRef(
  <TTemplateArgs,>(
    { className, title, urlTemplate, urlParams, queryParams, children, ...rest }: TemplatedNavLinkProps<TTemplateArgs>,
    ref: React.LegacyRef<HTMLAnchorElement>
  ) => {
    const existingParams = useParams()

    const baseUrl = urlTemplate.build({ ...existingParams, ...urlParams } as TTemplateArgs)
    const queryString = buildQueryString(queryParams)
    const fullUrl = `${baseUrl}${queryString}`

    return (
      <NavLink ref={ref} title={title} to={fullUrl} className={className} {...rest}>
        {children}
      </NavLink>
    )
  }
)
