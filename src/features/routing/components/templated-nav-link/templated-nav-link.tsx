import type { ReactNode } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { UrlTemplateObj } from '../../../../routes/url-template'

export interface TemplatedNavLinkProps<TTemplateParams> {
  className?: string
  title?: string
  urlTemplate: UrlTemplateObj<TTemplateParams>
  urlParams?: Partial<TTemplateParams>
  children?: ReactNode
}

export function TemplatedNavLink<TTemplateArgs>({ children, urlTemplate, title, urlParams }: TemplatedNavLinkProps<TTemplateArgs>) {
  const existingParams = useParams()

  return (
    <NavLink title={title} to={urlTemplate.build({ ...existingParams, ...urlParams } as TTemplateArgs)}>
      {children}
    </NavLink>
  )
}
