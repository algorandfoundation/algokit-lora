import { Outlet } from 'react-router-dom'
import { LayoutPage } from './features/layout/pages/layout-page'
import { Urls } from './routes/urls'
import { evalTemplates } from './routes/templated-route'
import { TransactionPage } from './features/transactions/components/transaction'

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
        template: Urls.Feature1,
        element: <div>Feature 1</div>,
      },
      {
        template: Urls.Transaction.ById,
        element: <TransactionPage />,
      },
    ],
  },
])
