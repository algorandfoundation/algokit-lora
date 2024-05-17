import { Outlet } from 'react-router-dom'
import { LayoutPage } from './features/layout/pages/layout-page'
import { Urls } from './routes/urls'
import { evalTemplates } from './routes/templated-route'
import { TransactionPage, transactionPageTitle } from './features/transactions/pages/transaction-page'
import { ExplorePage, explorePageTitle } from './features/explore/pages/explore-page'
import { GroupPage } from './features/groups/pages/group-page'
import { ErrorPage } from './features/common/pages/error-page'
import { BlockPage, blockPageTitle } from './features/blocks/pages/block-page'
import { InnerTransactionPage } from './features/transactions/pages/inner-transaction-page'
import { AccountPage, accountPageTitle } from './features/accounts/pages/account-page'
import { AssetPage, assetPageTitle } from './features/assets/pages/asset-page'
import { ApplicationPage, applicationPageTitle } from './features/applications/pages/application-page'
import { ApplicationBoxPage } from './features/applications/pages/application-box-page'

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
            errorElement: <ErrorPage title={transactionPageTitle} />,
            children: [
              {
                template: Urls.Explore.Transaction.ById,
                element: <TransactionPage />,
              },
              {
                template: Urls.Explore.Transaction.ById.Inner.ById,
                element: <InnerTransactionPage />,
              },
            ],
          },
          {
            template: Urls.Explore.Block.ById,
            errorElement: <ErrorPage title={blockPageTitle} />,
            children: [
              {
                template: Urls.Explore.Block.ById,
                element: <BlockPage />,
              },
              {
                template: Urls.Explore.Block.ById.Group.ById,
                element: <GroupPage />,
              },
            ],
          },
          {
            template: Urls.Explore.Account.ById,
            element: <AccountPage />,
            errorElement: <ErrorPage title={accountPageTitle} />,
          },
          {
            template: Urls.Explore.Asset.ById,
            element: <AssetPage />,
            errorElement: <ErrorPage title={assetPageTitle} />,
          },
          {
            template: Urls.Explore.Application.ById,
            errorElement: <ErrorPage title={applicationPageTitle} />,
            children: [
              {
                template: Urls.Explore.Application.ById,
                element: <ApplicationPage />,
              },
              {
                template: Urls.Explore.Application.ById.Box.ById,
                element: <ApplicationBoxPage />,
              },
            ],
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
