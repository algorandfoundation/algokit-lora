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
import { TxPage } from './features/transactions/pages/tx-page'
import { NetworkPage } from '@/features/network/pages/network-page'

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
        template: Urls.Network,
        children: [
          {
            template: Urls.Network,
            element: <NetworkPage />,
          },
          {
            template: Urls.Network.Transaction.ById,
            errorElement: <ErrorPage title={transactionPageTitle} />,
            children: [
              {
                template: Urls.Network.Transaction.ById,
                element: <TransactionPage />,
              },
              {
                template: Urls.Network.Transaction.ById.Inner.ById,
                element: <InnerTransactionPage />,
              },
            ],
          },
          {
            template: Urls.Network.Block.ByRound,
            children: [
              {
                template: Urls.Network.Block.ByRound,
                errorElement: <ErrorPage title={blockPageTitle} />,
                element: <BlockPage />,
              },
              {
                template: Urls.Network.Block.ByRound.Group.ById,
                errorElement: <ErrorPage title={groupPageTitle} />,
                element: <GroupPage />,
              },
            ],
          },
          {
            template: Urls.Network.Account.ByAddress,
            element: <AccountPage />,
            errorElement: <ErrorPage title={accountPageTitle} />,
          },
          {
            template: Urls.Network.Asset.ById,
            element: <AssetPage />,
            errorElement: <ErrorPage title={assetPageTitle} />,
          },
          {
            template: Urls.Network.Application.ById,
            errorElement: <ErrorPage title={applicationPageTitle} />,
            element: <ApplicationPage />,
          },
          {
            template: Urls.Network.Tx,
            element: <TxPage />,
          },
        ],
      },
      {
        template: Urls.AppStudio,
        element: <div>App Studio</div>,
      },
      {
        template: Urls.Settings,
        element: <SettingsPage />,
      },
    ],
  },
])
