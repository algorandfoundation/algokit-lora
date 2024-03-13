import { ReactNode } from 'react'

export interface LayoutPageProps {
  children?: ReactNode
}

export function LayoutPage({ children }: LayoutPageProps) {
  return (
    <div>
      <div className="drawer">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          {/* Page content here */}
          <label htmlFor="my-drawer" className="btn btn-primary drawer-button">
            Open drawer
          </label>
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
            <li>
              <a href="/feature-1">Sidebar Item 1</a>
            </li>
            <li>
              <a href="/feature-2">Sidebar Item 2</a>
            </li>
          </ul>
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}
