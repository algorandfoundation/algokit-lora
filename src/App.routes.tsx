import { Outlet, createBrowserRouter } from 'react-router-dom'
import { LayoutPage } from './features/layout/pages/layout-page'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <LayoutPage>
        <Outlet />
      </LayoutPage>
    ),
    children: [
      {
        path: '/feature-1',
        element: <div>Feature 1</div>,
      },
    ],
  },
])

export default router
