import { type ReactNode } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { UrlTemplateObj } from '../../../../routes/url-template'
import { fixedForwardRef } from '@/utils/fixed-forward-ref'

export interface TemplatedNavLinkProps<TTemplateParams> {
  className?: string
  title?: string
  urlTemplate: UrlTemplateObj<TTemplateParams>
  urlParams?: Partial<TTemplateParams>
  children?: ReactNode
  ref?: React.LegacyRef<HTMLAnchorElement>
  style?: React.CSSProperties
}

export const TemplatedNavLink = fixedForwardRef(
  <TTemplateArgs,>(
    { className, title, urlTemplate, urlParams, children, style, ...rest }: TemplatedNavLinkProps<TTemplateArgs>,
    ref: React.LegacyRef<HTMLAnchorElement>
  ) => {
    const existingParams = useParams()

    return (
      <NavLink
        ref={ref}
        title={title}
        to={urlTemplate.build({ ...existingParams, ...urlParams } as TTemplateArgs)}
        className={className}
        style={style}
        {...rest}
      >
        {children}
      </NavLink>
    )
  }
)
