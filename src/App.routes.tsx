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
import { SettingsPage, settingsPageTitle } from './features/settings/pages/settings-page'
import { IndexPage } from '@/index-page'
import { NetworkPage } from '@/features/network/pages/network-page'
import { FundPage } from './features/fund/fund-page'
import { FundAuthCallbackPage } from './features/fund/fund-auth-callback-page'
import { FundErrorPage } from './features/fund/fund-error-page'
import { AppLab, appLabPageTitle } from './features/app-lab/pages/app-lab'
import { TransactionWizardPage, transactionWizardPageTitle } from './features/transaction-wizard/transaction-wizard-page'
import { RedirectPage } from './features/common/pages/redirect-page'
import { CreateAppInterfacePage, createAppInterfacePageTitle } from './features/app-interfaces/pages/create-app-interface-page'
import { EditAppInterfacePage, editAppInterfacePageTitle } from './features/app-interfaces/pages/edit-app-interface-page'

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
        element: <IndexPage />,
        errorElement: <ErrorPage title={explorePageTitle} />,
      },
      {
        template: Urls.Network,
        errorElement: <ErrorPage />,
        element: (
          <NetworkPage>
            <Outlet />
          </NetworkPage>
        ),
        children: [
          {
            template: Urls.Network.Explore,
            element: <ExplorePage />,
            errorElement: <ErrorPage title={explorePageTitle} />,
          },
          {
            template: Urls.Network.Explore.Transaction.ById,
            errorElement: <ErrorPage title={transactionPageTitle} />,
            children: [
              {
                template: Urls.Network.Explore.Transaction.ById,
                element: <TransactionPage />,
              },
              {
                template: Urls.Network.Explore.Transaction.ById.Inner.ById,
                element: <InnerTransactionPage />,
              },
            ],
          },
          {
            template: Urls.Network.Explore.Block.ByRound,
            children: [
              {
                template: Urls.Network.Explore.Block.ByRound,
                errorElement: <ErrorPage title={blockPageTitle} />,
                element: <BlockPage />,
              },
              {
                template: Urls.Network.Explore.Block.ByRound.Group.ById,
                errorElement: <ErrorPage title={groupPageTitle} />,
                element: <GroupPage />,
              },
            ],
          },
          {
            template: Urls.Network.Explore.Account.ByAddress,
            element: <AccountPage />,
            errorElement: <ErrorPage title={accountPageTitle} />,
          },
          {
            template: Urls.Network.Explore.Asset.ById,
            element: <AssetPage />,
            errorElement: <ErrorPage title={assetPageTitle} />,
          },
          {
            template: Urls.Network.Explore.Application.ById,
            errorElement: <ErrorPage title={applicationPageTitle} />,
            element: <ApplicationPage />,
          },
          {
            template: Urls.Network.TransactionWizard,
            errorElement: <ErrorPage title={transactionWizardPageTitle} />,
            element: <TransactionWizardPage />,
          },
          {
            template: Urls.Network.AppLab,
            children: [
              {
                template: Urls.Network.AppLab,
                errorElement: <ErrorPage title={appLabPageTitle} />,
                element: <AppLab />,
              },
              {
                template: Urls.Network.AppLab.Create,
                errorElement: <ErrorPage title={createAppInterfacePageTitle} />,
                element: <CreateAppInterfacePage />,
              },
              {
                template: Urls.Network.AppLab.Edit.ById,
                errorElement: <ErrorPage title={editAppInterfacePageTitle} />,
                element: <EditAppInterfacePage />,
              },
            ],
          },
          {
            template: Urls.Network.Explore.Tx,
            element: <RedirectPage from={Urls.Network.Explore.Tx} to={Urls.Network.Explore.Transaction} />,
          },
          {
            template: Urls.Network.Explore.Txn,
            element: <RedirectPage from={Urls.Network.Explore.Txn} to={Urls.Network.Explore.Transaction} />,
          },
          {
            template: Urls.Network.TxWizard,
            element: <RedirectPage from={Urls.Network.TxWizard} to={Urls.Network.TransactionWizard} />,
          },
          {
            template: Urls.Network.TxnWizard,
            element: <RedirectPage from={Urls.Network.TxnWizard} to={Urls.Network.TransactionWizard} />,
          },
        ],
      },
      {
        template: Urls.Settings,
        errorElement: <ErrorPage title={settingsPageTitle} />,
        element: <SettingsPage />,
      },
      {
        template: Urls.Fund,
        errorElement: <FundErrorPage />,
        element: <FundPage />,
      },
      {
        template: Urls.FundAuthCallback,
        errorElement: <FundErrorPage />,
        element: <FundAuthCallbackPage />,
      },
      {
        template: Urls.TransactionWizard,
        element: <RedirectPage from={Urls.TransactionWizard} to={Urls.Network.TransactionWizard} />,
      },
      {
        template: Urls.TxWizard,
        element: <RedirectPage from={Urls.TxWizard} to={Urls.Network.TransactionWizard} />,
      },
      {
        template: Urls.TxnWizard,
        element: <RedirectPage from={Urls.TxnWizard} to={Urls.Network.TransactionWizard} />,
      },
      {
        template: Urls.AppLab,
        element: <RedirectPage from={Urls.AppLab} to={Urls.Network.AppLab} />,
      },
    ],
  },
])
