import { Outlet } from 'react-router-dom'
import { LayoutPage } from './features/layout/pages/layout-page'
import { Urls } from './routes/urls'
import { evalTemplates } from './routes/templated-route'
import { TransactionPage, transactionPageTitle } from './features/transactions/pages/transaction-page'
import { ExplorePage, explorePageTitle } from './features/explore/pages/explore-page'
import { GroupPage } from './features/transactions/pages/group-page'
import { ErrorPage } from './features/common/pages/error-page'
import { BlockPage, blockPageTitle } from './features/blocks/pages/block-page'

export const routes = evalTemplates([
  {
    template: Urls.Index,
    element: (
      <LayoutPage>
        <Outlet />
      </LayoutPage>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        template: Urls.Index,
        element: (
          <div>
            <h1 className="font-bold">Home</h1>
          </div>
        ),
      },
      {
        template: Urls.Explore,
        errorElement: <ErrorPage />,
        children: [
          {
            template: Urls.Explore,
            element: <ExplorePage />,
            errorElement: <ErrorPage title={explorePageTitle} />,
          },
          {
            template: Urls.Explore.Transaction.ById,
            element: <TransactionPage />,
            errorElement: <ErrorPage title={transactionPageTitle} />,
          },
          {
            template: Urls.Explore.Group.ById,
            element: <GroupPage />,
          },
          {
            template: Urls.Explore.Block.ById,
            element: <BlockPage />,
            errorElement: <ErrorPage title={blockPageTitle} />,
          },
        ],
      },
      {
        template: Urls.AppStudio,
        element: <div>App Studio</div>,
      },
    ],
  },
])
