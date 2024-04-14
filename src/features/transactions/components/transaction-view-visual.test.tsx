import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { describe, expect, it } from 'vitest'
import { TransactionViewVisual } from './transaction-view-visual'
import { executeComponentTest } from '@/tests/test-component'
import { render, prettyDOM } from '@/tests/testing-library'
import { asAssetTransferTransaction, asPaymentTransaction } from '../mappers/transaction-mappers'
import { AssetResult, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { assetResultMother } from '@/tests/object-mother/asset-result'

// This file maintain the snapshot test for the TransactionViewVisual component
// To add new test case:
//   - Add a new object to the object mother
//   - Add the new object into the list of items of describe.each
// To update a snapshot:
//   - Make the code changes in TransactionViewVisual
//   - The snapshot tests will fail
//   - Visually inspect (by viewing in the browser) each transactions in the describe.each list and make sure that they are rendered correctly with the new code changes
//   - Update the snapshot files by running `vitest -u`. Or if the test runner is running, press `u` to update the snapshots.

describe('payment-transaction-view-visual', () => {
  describe.each([
    transactionResultMother['mainnet-FBORGSDC4ULLWHWZUMUFIYQLSDC26HGLTFD7EATQDY37FHCIYBBQ']().build(),
    transactionResultMother['mainnet-ILDCD5Z64CYSLEZIHBG5DVME2ITJI2DIVZAPDPEWPCYMTRA5SVGA']().build(),
  ])('when rendering transaction $id', (transaction: TransactionResult) => {
    it('should match snapshot', () => {
      const model = asPaymentTransaction(transaction)

      return executeComponentTest(
        () => render(<TransactionViewVisual transaction={model} />),
        async (component) => {
          expect(prettyDOM(component.container, undefined, { highlight: false })).toMatchFileSnapshot(
            `__snapshots__/payment-transaction-view-visual.${transaction.id}.html`
          )
        }
      )
    })
  })
})

describe('asset-transfer-transaction-view-visual', () => {
  describe.each([
    {
      transactionResult: transactionResultMother['mainnet-JBDSQEI37W5KWPQICT2IGCG2FWMUGJEUYYK3KFKNSYRNAXU2ARUA']().build(),
      assetResult: assetResultMother['mainnet-523683256']().build(),
    },
  ])(
    'when rendering transaction $id',
    ({ transactionResult, assetResult }: { transactionResult: TransactionResult; assetResult: AssetResult }) => {
      it('should match snapshot', () => {
        const transaction = asAssetTransferTransaction(transactionResult, assetResult)

        return executeComponentTest(
          () => render(<TransactionViewVisual transaction={transaction} />),
          async (component) => {
            expect(prettyDOM(component.container, undefined, { highlight: false })).toMatchFileSnapshot(
              `__snapshots__/asset-transfer-view-visual.${transaction.id}.html`
            )
          }
        )
      })
    }
  )
})
