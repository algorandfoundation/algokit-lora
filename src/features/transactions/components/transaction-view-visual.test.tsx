import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { describe, expect, it, vi } from 'vitest'
import { TransactionViewVisual } from './transaction-view-visual'
import { executeComponentTest } from '@/tests/test-component'
import { render, prettyDOM } from '@/tests/testing-library'
import { asAppCallTransaction, asAssetTransferTransaction, asPaymentTransaction } from '../mappers'
import { AssetResult, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { assetResultMother } from '@/tests/object-mother/asset-result'
import { useParams } from 'react-router-dom'
import { asAsset } from '@/features/assets/mappers'

// This file maintain the snapshot test for the TransactionViewVisual component
// To add new test case:
//   - Add a new object to the object mother
//   - Add the new object into the list of items of describe.each
// To update a snapshot:
//   - Make the code changes in TransactionViewVisual
//   - The snapshot tests will fail
//   - Visually inspect (by viewing in the browser) each transactions in the describe.each list and make sure that they are rendered correctly with the new code changes
//   - Update the snapshot files by running `vitest -u`. Or if the test runner is running, press `u` to update the snapshots.

const prettyDomMaxLength = 200000

describe('payment-transaction-view-visual', () => {
  describe.each([
    transactionResultMother['mainnet-FBORGSDC4ULLWHWZUMUFIYQLSDC26HGLTFD7EATQDY37FHCIYBBQ']().build(),
    transactionResultMother['mainnet-ILDCD5Z64CYSLEZIHBG5DVME2ITJI2DIVZAPDPEWPCYMTRA5SVGA']().build(),
  ])('when rendering transaction $id', (transactionResult: TransactionResult) => {
    it('should match snapshot', () => {
      const model = asPaymentTransaction(transactionResult)

      return executeComponentTest(
        () => render(<TransactionViewVisual transaction={model} />),
        async (component) => {
          expect(prettyDOM(component.container, prettyDomMaxLength, { highlight: false })).toMatchFileSnapshot(
            `__snapshots__/payment-transaction-view-visual.${transactionResult.id}.html`
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
    {
      transactionResult: transactionResultMother['mainnet-563MNGEL2OF4IBA7CFLIJNMBETT5QNKZURSLIONJBTJFALGYOAUA']().build(),
      assetResult: assetResultMother['mainnet-312769']().build(),
    },
  ])(
    'when rendering transaction $transactionResult.id',
    ({ transactionResult, assetResult }: { transactionResult: TransactionResult; assetResult: AssetResult }) => {
      it('should match snapshot', () => {
        const transaction = asAssetTransferTransaction(transactionResult, asAsset(assetResult))

        return executeComponentTest(
          () => render(<TransactionViewVisual transaction={transaction} />),
          async (component) => {
            expect(prettyDOM(component.container, prettyDomMaxLength, { highlight: false })).toMatchFileSnapshot(
              `__snapshots__/asset-transfer-view-visual.${transaction.id}.html`
            )
          }
        )
      })
    }
  )
})

describe('application-call-view-visual', () => {
  describe.each([
    {
      transactionResult: transactionResultMother['mainnet-KMNBSQ4ZFX252G7S4VYR4ZDZ3RXIET5CNYQVJUO5OXXPMHAMJCCQ']().build(),
      assetResults: [],
    },
    {
      transactionResult: transactionResultMother['mainnet-INDQXWQXHF22SO45EZY7V6FFNI6WUD5FHRVDV6NCU6HD424BJGGA']().build(),
      assetResults: [
        assetResultMother['mainnet-31566704']().build(),
        assetResultMother['mainnet-386195940']().build(),
        assetResultMother['mainnet-408898501']().build(),
      ],
    },
  ])(
    'when rendering transaction $transactionResult.id',
    ({ transactionResult, assetResults }: { transactionResult: TransactionResult; assetResults: AssetResult[] }) => {
      it('should match snapshot', () => {
        vi.mocked(useParams).mockImplementation(() => ({ transactionId: transactionResult.id }))

        const model = asAppCallTransaction(transactionResult, assetResults.map(asAsset))

        return executeComponentTest(
          () => render(<TransactionViewVisual transaction={model} />),
          async (component) => {
            expect(prettyDOM(component.container, prettyDomMaxLength, { highlight: false })).toMatchFileSnapshot(
              `__snapshots__/application-transaction-view-visual.${transactionResult.id}.html`
            )
          }
        )
      })
    }
  )
})
