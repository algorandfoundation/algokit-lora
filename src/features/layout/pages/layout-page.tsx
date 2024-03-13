import { ReactNode } from 'react'
import { TemplatedNavLink } from '../../routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '../../../routes/urls'

export interface LayoutPageProps {
  children?: ReactNode
}

export function LayoutPage({ children }: LayoutPageProps) {
  return (
    <div className="drawer md:drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content p-4">
        {children}
        <label htmlFor="my-drawer" className="btn btn-primary drawer-button md:hidden">
          Open drawer
        </label>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
          <li>
            <TemplatedNavLink urlTemplate={Urls.Feature1}>Feature 1</TemplatedNavLink>
          </li>
          <li>
            <TemplatedNavLink urlTemplate={Urls.Transaction.ById} urlParams={{ transactionId: '42' }}>
              View transaction
            </TemplatedNavLink>
          </li>
        </ul>
      </div>
    </div>
  )
}
