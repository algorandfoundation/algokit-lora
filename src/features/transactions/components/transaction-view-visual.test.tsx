import { transactionModelMother } from '@/tests/object-mother/transaction-model'
import { describe, expect, it } from 'vitest'
import { TransactionViewVisual } from './transaction-view-visual'
import { executeComponentTest } from '@/tests/test-component'
import { render, prettyDOM } from '@/tests/testing-library'
import { asPaymentTransaction } from '../mappers/transaction-mappers'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'

// This file maintain the snapshot test for the TransactionViewVisual component
// To add new test case:
//   - Add a new object to the object mother
//   - Add the new object into the list of items of describe.each
// To update a snapshot:
//   - Make the code changes in TransactionViewVisual
//   - The snapshot tests will fail
//   - Visually inspect (by viewing in the browser) each transactions in the describe.each list and make sure that they are rendered correctly with the new code changes
//   - Update the snapshot files by running `vitest -u`. Or if the test runner is running, press `u` to update the snapshots.
describe('transaction-view-visual', () => {
  describe.each([
    transactionModelMother['mainnet-FBORGSDC4ULLWHWZUMUFIYQLSDC26HGLTFD7EATQDY37FHCIYBBQ'](),
    transactionModelMother['mainnet-ILDCD5Z64CYSLEZIHBG5DVME2ITJI2DIVZAPDPEWPCYMTRA5SVGA'](),
  ])('when rendering transaction %d', (transaction: TransactionResult) => {
    it('should match snapshot', () => {
      const model = asPaymentTransaction(transaction)

      return executeComponentTest(
        () => render(<TransactionViewVisual transaction={model} />),
        async (component) => {
          expect(prettyDOM(component.container, undefined, { highlight: false })).toMatchFileSnapshot(
            `__snapshots__/transaction-view-visual.${transaction.id}.html`
          )
        }
      )
    })
  })
})
