import { Outlet } from 'react-router-dom'
import { LayoutPage } from './features/layout/pages/layout-page'
import { Urls } from './routes/urls'
import { evalTemplates } from './routes/templated-route'

export const routes = evalTemplates([
  {
    template: Urls.Index,
    element: (
      <LayoutPage>
        <Outlet />
      </LayoutPage>
    ),
    children: [
      {
        template: Urls.Index,
        element: <div>Home</div>,
      },
      {
        template: Urls.Explore,
        element: <div>Explore</div>,
      },
      {
        template: Urls.AppStudio,
        element: <div>App Studio</div>,
      },
    ],
  },
])
