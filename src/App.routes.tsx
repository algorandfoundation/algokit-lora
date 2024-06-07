import { Outlet } from 'react-router-dom'
import { LayoutPage } from './features/layout/pages/layout-page'
import { Urls } from './routes/urls'
import { evalTemplates } from './routes/templated-route'
import { TransactionPage, transactionPageTitle } from './features/transactions/pages/transaction-page'
import { ExplorePage, explorePageTitle } from './features/explore/pages/explore-page'
import { GroupPage, groupPageTitle } from './features/groups/pages/group-page'
import { ErrorPage } from './features/common/pages/error-page'
import { BlockPage, blockPageTitle } from './features/blocks/pages/block-page'
import { InnerTransactionPage } from './features/transactions/pages/inner-transaction-page'
import { AccountPage, accountPageTitle } from './features/accounts/pages/account-page'
import { AssetPage, assetPageTitle } from './features/assets/pages/asset-page'
import { ApplicationPage, applicationPageTitle } from './features/applications/pages/application-page'
import { SettingsPage } from './features/settings/pages/settings-page'
import { LandingPage } from './features/landing/pages/landing-pages'
import { TxPage } from './features/transactions/pages/tx-page'

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
        element: <ExplorePage />,
        errorElement: <ErrorPage title={explorePageTitle} />,
      },
      {
        template: Urls.Transaction.ById,
        errorElement: <ErrorPage title={transactionPageTitle} />,
        children: [
          {
            template: Urls.Transaction.ById,
            element: <TransactionPage />,
          },
          {
            template: Urls.Transaction.ById.Inner.ById,
            element: <InnerTransactionPage />,
          },
        ],
      },
      {
        template: Urls.Block.ByRound,
        children: [
          {
            template: Urls.Block.ByRound,
            errorElement: <ErrorPage title={blockPageTitle} />,
            element: <BlockPage />,
          },
          {
            template: Urls.Block.ByRound.Group.ById,
            errorElement: <ErrorPage title={groupPageTitle} />,
            element: <GroupPage />,
          },
        ],
      },
      {
        template: Urls.Account.ByAddress,
        element: <AccountPage />,
        errorElement: <ErrorPage title={accountPageTitle} />,
      },
      {
        template: Urls.Asset.ById,
        element: <AssetPage />,
        errorElement: <ErrorPage title={assetPageTitle} />,
      },
      {
        template: Urls.Application.ById,
        errorElement: <ErrorPage title={applicationPageTitle} />,
        element: <ApplicationPage />,
      },
      {
        template: Urls.AppStudio,
        element: <div>App Studio</div>,
      },
      {
        template: Urls.Settings,
        element: <SettingsPage />,
      },
      {
        template: Urls.Tx,
        element: <TxPage />,
      },
      {
        template: Urls.Network,
        element: <LandingPage />,
      },
    ],
  },
])
