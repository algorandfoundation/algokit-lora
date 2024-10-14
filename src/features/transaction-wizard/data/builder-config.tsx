import algosdk from 'algosdk'
import { BuildableTransactionType } from '@/features/transaction-wizard/models'
import { PaymentTransactionBuilder } from '@/features/transaction-wizard/components/payment-transaction-builder'
import { AccountCloseTransactionBuilder } from '@/features/transaction-wizard/components/account-close-transaction-builder'
import { AppCallTransactionBuilder } from '@/features/transaction-wizard/components/app-call-transaction-builder'
import { MethodCallTransactionBuilder } from '@/features/transaction-wizard/components/method-call-transaction-builder'
import { AssetTransferTransactionBuilder } from '@/features/transaction-wizard/components/asset-transfer-transaction-builder'
import { AssetOptInTransactionBuilder } from '@/features/transaction-wizard/components/asset-opt-in-transaction-builder'
import { AssetOptOutTransactionBuilder } from '@/features/transaction-wizard/components/asset-opt-out-transaction-builder'
import { AssetClawbackTransactionBuilder } from '@/features/transaction-wizard/components/asset-clawback-transaction-builder'
import { AssetCreateTransactionBuilder } from '@/features/transaction-wizard/components/asset-create-transaction-builder'
import { AssetReconfigureTransactionBuilder } from '@/features/transaction-wizard/components/asset-reconfigure-transaction-builder'
import { AssetDestroyTransactionBuilder } from '@/features/transaction-wizard/components/asset-destroy-transaction-builder'

// TODO: PD - may not need to be in a file
export const builderConfigs = [
  {
    transactionType: algosdk.TransactionType.pay,
    type: BuildableTransactionType.Payment,
    label: 'Payment (pay)',
    component: PaymentTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.pay,
    type: BuildableTransactionType.AccountClose,
    label: 'Account Close (pay)',
    component: AccountCloseTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.appl,
    type: BuildableTransactionType.AppCall,
    label: 'Application Call (appl)',
    component: AppCallTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.appl,
    type: BuildableTransactionType.MethodCall,
    label: 'ABI Method Call (appl)',
    component: MethodCallTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.axfer,
    type: BuildableTransactionType.AssetTransfer,
    label: 'Asset Transfer (axfer)',
    component: AssetTransferTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.axfer,
    type: BuildableTransactionType.AssetOptIn,
    label: 'Asset opt-in (axfer)',
    component: AssetOptInTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.axfer,
    type: BuildableTransactionType.AssetOptOut,
    label: 'Asset opt-out (axfer)',
    component: AssetOptOutTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.axfer,
    type: BuildableTransactionType.AssetClawback,
    label: 'Asset clawback (axfer)',
    component: AssetClawbackTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.acfg,
    type: BuildableTransactionType.AssetCreate,
    label: 'Asset create (acfg)',
    component: AssetCreateTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.acfg,
    type: BuildableTransactionType.AssetReconfigure,
    label: 'Asset reconfigure (acfg)',
    component: AssetReconfigureTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.acfg,
    type: BuildableTransactionType.AssetDestroy,
    label: 'Asset destroy (acfg)',
    component: AssetDestroyTransactionBuilder,
  },
]
