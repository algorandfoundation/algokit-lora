import { assetResultMother } from '@/tests/object-mother/asset-result'
import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor } from '@/tests/testing-library'
import axios from 'axios'
import { describe, it, vi } from 'vitest'
import { AssetPage } from './asset-page'
import { descriptionListAssertion } from '@/tests/assertions/description-list-assertion'
import {
  assetAddressesLabel,
  assetCreatorLabel,
  assetDecimalsLabel,
  assetDefaultFrozenLabel,
  assetIdLabel,
  assetManagerLabel,
  assetMetadataLabel,
  assetNameLabel,
  assetReserveLabel,
  assetTotalSupplyLabel,
  assetUrlLabel,
} from '../components/labels'
import { useParams } from 'react-router-dom'
import { createStore } from 'jotai'
import { assetResultsAtom } from '../data/core'
import { indexer } from '@/features/common/data'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { transactionResultsAtom } from '@/features/transactions/data'
import { assetUnitLabel } from '@/features/transactions/components/asset-config-transaction-info'

describe('asset-page', () => {
  describe('when rendering an ARC-3 asset', () => {
    const assetResult = assetResultMother['mainnet-1284444444']().build()
    const transactionResult = transactionResultMother.assetConfig().build()

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transactionResult.id, transactionResult]]))
      myStore.set(assetResultsAtom, new Map([[assetResult.index, assetResult]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
      vi.mocked(axios.get).mockImplementation(() => {
        return Promise.resolve({
          data: {
            name: 'Orange',
            decimals: 8,
            description:
              "John Alan Woods 01/Dec/2023 You know, I can pull metrics out of the air too, whatever, 8 million transactions over the last week, I don't know, my mom has four oranges.",
            image: 'ipfs://QmaEGBYWLQWDqMMR9cwpX3t4xoRuJpz5kzCwwdQmWaxHXv',
            image_integrity: 'sha256-hizgBlZvh1teH9kzMnkocf2q9L7zpjLQZghQfKThVRg=',
            image_mimetype: 'image/png',
          },
        })
      })
      vi.mocked(indexer.searchForTransactions().assetID(assetResult.index).txType('acfg').do).mockImplementation(() =>
        Promise.resolve({
          transactions: [transactionResult],
        })
      )

      return executeComponentTest(
        () => {
          return render(<AssetPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() => {
            descriptionListAssertion({
              container: component.container,
              items: [
                { term: assetIdLabel, description: assetResult.index.toString() },
                { term: assetNameLabel, description: 'OrangeARC-3Fungible' },
                { term: assetUnitLabel, description: 'ORA' },
                { term: assetTotalSupplyLabel, description: '4000000 ORA' },
                { term: assetDecimalsLabel, description: '8' },
                { term: assetDefaultFrozenLabel, description: 'No' },
                { term: assetUrlLabel, description: 'ipfs://QmUitxJuPJJrcuAdAiVdEEpuzGmsELGgAvhLd5FiXRShEu#arc3' },
              ],
            })

            const assetAddressesCard = component.getByText(assetAddressesLabel).parentElement!
            descriptionListAssertion({
              container: assetAddressesCard,
              items: [
                { term: assetCreatorLabel, description: 'JP3ENKDQC2BOYRMLFGKBS7RB2IVNF7VNHCFHVTRNHOENRQ6R4UN7MCNXPI' },
                { term: assetManagerLabel, description: 'JP3ENKDQC2BOYRMLFGKBS7RB2IVNF7VNHCFHVTRNHOENRQ6R4UN7MCNXPI' },
                { term: assetReserveLabel, description: 'JP3ENKDQC2BOYRMLFGKBS7RB2IVNF7VNHCFHVTRNHOENRQ6R4UN7MCNXPI' },
              ],
            })

            const assetMetadataCard = component.getByText(assetMetadataLabel).parentElement!
            descriptionListAssertion({
              container: assetMetadataCard,
              items: [{ term: 'Image', description: 'https://ipfs.algonode.xyz/ipfs/QmaEGBYWLQWDqMMR9cwpX3t4xoRuJpz5kzCwwdQmWaxHXv' }],
            })
          })
        }
      )
    })
  })
})
