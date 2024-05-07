import { assetResultMother } from '@/tests/object-mother/asset-result'
import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor } from '@/tests/testing-library'
import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'
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
  assetTraitsLabel,
  assetUrlLabel,
} from '../components/labels'
import { useParams } from 'react-router-dom'
import { createStore } from 'jotai'
import { assetResultsAtom } from '../data/core'
import { indexer } from '@/features/common/data'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { assetUnitLabel } from '@/features/transactions/components/asset-config-transaction-info'

describe('asset-page', () => {
  describe('when rendering an ARC-3 asset', () => {
    const assetResult = assetResultMother['mainnet-1284444444']().build()
    const transactionResult = transactionResultMother.assetConfig().build()

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
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
            expect(
              component.container.querySelector('img[src="https://ipfs.algonode.xyz/ipfs/QmaEGBYWLQWDqMMR9cwpX3t4xoRuJpz5kzCwwdQmWaxHXv"]')
            ).toBeTruthy()

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

  describe('when rendering an ARC-3 + ARC-19 asset', () => {
    const assetResult = assetResultMother['mainnet-1494117806']().build()
    const transactionResult = transactionResultMother.assetConfig().build()

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(assetResultsAtom, new Map([[assetResult.index, assetResult]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
      vi.mocked(axios.get).mockImplementation(() => {
        return Promise.resolve({
          data: {
            name: 'Zappy #1620',
            standard: 'arc3',
            decimals: 0,
            image: 'ipfs://bafkreicfzgycn6zwhmegqjfnsj4q4qkff2luu3tzfrxtv5qpra5buf7d74',
            image_mimetype: 'image/png',
            properties: {
              Background: 'Orange',
              Body: 'Turtleneck Sweater',
              Earring: 'Right Helix',
              Eyes: 'Wet',
              Eyewear: 'Nerd Glasses',
              Head: 'Wrap',
              Mouth: 'Party Horn',
              Skin: 'Sienna',
            },
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
                { term: assetNameLabel, description: 'Zappy #1620ARC-3ARC-19Pure Non-Tungible' },
                { term: assetUnitLabel, description: 'ZAPP1620' },
                { term: assetTotalSupplyLabel, description: '1 ZAPP1620' },
                { term: assetDecimalsLabel, description: '0' },
                { term: assetDefaultFrozenLabel, description: 'No' },
                { term: assetUrlLabel, description: 'template-ipfs://{ipfscid:1:raw:reserve:sha2-256}#arc3' },
              ],
            })
            expect(
              component.container.querySelector(
                'img[src="https://ipfs.algonode.xyz/ipfs/bafkreicfzgycn6zwhmegqjfnsj4q4qkff2luu3tzfrxtv5qpra5buf7d74"]'
              )
            ).toBeTruthy()

            const assetAddressesCard = component.getByText(assetAddressesLabel).parentElement!
            descriptionListAssertion({
              container: assetAddressesCard,
              items: [
                { term: assetCreatorLabel, description: 'UF5DSSCT3GO62CSTSFB4QN5GNKFIMO7HCF2OIY6D57Z37IETEXRKUUNOPU' },
                { term: assetManagerLabel, description: 'UF5DSSCT3GO62CSTSFB4QN5GNKFIMO7HCF2OIY6D57Z37IETEXRKUUNOPU' },
                { term: assetReserveLabel, description: 'OPL3M2ZOKLSPVIM32MRK45O6IQMHTJPVWOWPVTEGXVHC3GHFLJK2YC5OWE' },
              ],
            })

            const assetMetadataCard = component.getByText(assetMetadataLabel).parentElement!
            descriptionListAssertion({
              container: assetMetadataCard,
              items: [
                {
                  term: 'Image',
                  description: 'https://ipfs.algonode.xyz/ipfs/bafkreicfzgycn6zwhmegqjfnsj4q4qkff2luu3tzfrxtv5qpra5buf7d74',
                },
              ],
            })

            const assetTraitsCard = component.getByText(assetTraitsLabel).parentElement!
            descriptionListAssertion({
              container: assetTraitsCard,
              items: [
                { term: 'Background', description: 'Orange' },
                { term: 'Body', description: 'Turtleneck Sweater' },
                { term: 'Earring', description: 'Right Helix' },
                { term: 'Eyes', description: 'Wet' },
                { term: 'Eyewear', description: 'Nerd Glasses' },
                { term: 'Head', description: 'Wrap' },
                { term: 'Mouth', description: 'Party Horn' },
                { term: 'Skin', description: 'Sienna' },
              ],
            })
          })
        }
      )
    })
  })

  describe('when rendering an ARC-69 asset', () => {
    const assetResult = assetResultMother['mainnet-1800979729']().build()
    const transactionResult = transactionResultMother['mainnet-4BFQTYKSJNRF52LXCMBXKDWLODRDVGSUCW36ND3B7C3ZQKPMLUJA']().build()

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(assetResultsAtom, new Map([[assetResult.index, assetResult]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
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
                { term: assetNameLabel, description: 'DHMα: M1 Solar Flare SCQCSOARC-69Pure Non-Tungible' },
                { term: assetUnitLabel, description: 'SOLFLARE' },
                { term: assetTotalSupplyLabel, description: '1 SOLFLARE' },
                { term: assetDecimalsLabel, description: '0' },
                { term: assetDefaultFrozenLabel, description: 'No' },
                { term: assetUrlLabel, description: 'https://assets.datahistory.org/solar/SCQCSO.mp4#v' },
              ],
            })
            expect(component.container.querySelector('video>source[src="https://assets.datahistory.org/solar/SCQCSO.mp4#v"]')).toBeTruthy()

            const assetAddressesCard = component.getByText(assetAddressesLabel).parentElement!
            descriptionListAssertion({
              container: assetAddressesCard,
              items: [
                { term: assetCreatorLabel, description: 'EHYQCYHUC6CIWZLBX5TDTLVJ4SSVE4RRTMKFDCG4Z4Q7QSQ2XWIQPMKBPU' },
                { term: assetManagerLabel, description: 'EHYQCYHUC6CIWZLBX5TDTLVJ4SSVE4RRTMKFDCG4Z4Q7QSQ2XWIQPMKBPU' },
                { term: assetReserveLabel, description: 'ESK3ZHVALWTRWTEQVRO4ZGZGGOFCKCJNVE5ODFMPWICXVSJVJZYINHHYHE' },
              ],
            })

            const assetMetadataCard = component.getByText(assetMetadataLabel).parentElement!
            descriptionListAssertion({
              container: assetMetadataCard,
              items: [
                {
                  term: 'Description',
                  description:
                    'This is an alpha data artifact minted by The Data History Museum. It represents a Class M1.6 solar flare. The verified source of this data artifact was the National Oceanic and Atmospheric Administration (NOAA). For more information visit https://datahistory.org/.',
                },
              ],
            })

            const assetTraitsCard = component.getByText(assetTraitsLabel).parentElement!
            descriptionListAssertion({
              container: assetTraitsCard,
              items: [
                { term: 'satellite', description: 'GOES-16' },
                { term: 'source', description: 'NOAA' },
                { term: 'beginTime', description: '2024-04-30T00:46:00Z' },
                { term: 'beginClass', description: 'C1.1' },
                { term: 'peakClass', description: 'M1.6' },
                { term: 'peakTime', description: '2024-04-30T01:14:00Z' },
                { term: 'peakXrayFlux', description: '1.64110e-5 Wm⁻²' },
                { term: 'endTime', description: '2024-04-30T01:31:00Z' },
                { term: 'endClass', description: 'C8.3' },
                { term: 'type', description: 'solar' },
                { term: 'subType', description: 'flare' },
              ],
            })
          })
        }
      )
    })
  })

  describe('when rendering an ARC-19 + ARC-69 asset', () => {
    const assetResult = assetResultMother['mainnet-854081201']().build()
    const transactionResult = transactionResultMother['mainnet-P4IX7SYWTTFRQGYTCLFOZSTYSJ5FJKNR3MEIVRR4OA2JJXTQZHTQ']().build()

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(assetResultsAtom, new Map([[assetResult.index, assetResult]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
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
                { term: assetNameLabel, description: 'Bad Bunny Society #587ARC-19ARC-69Pure Non-Tungible' },
                { term: assetUnitLabel, description: 'bbs587' },
                { term: assetTotalSupplyLabel, description: '1 bbs587' },
                { term: assetDecimalsLabel, description: '0' },
                { term: assetDefaultFrozenLabel, description: 'No' },
                { term: assetUrlLabel, description: 'template-ipfs://{ipfscid:1:raw:reserve:sha2-256}' },
              ],
            })
            expect(
              component.container.querySelector(
                'img[src="https://ipfs.algonode.xyz/ipfs/bafkreifpfaqwwfyj2zcy76hr6eswkhbqak5bxjzhryeeg7tqnzjgmx5xfi"]'
              )
            ).toBeTruthy()

            const assetAddressesCard = component.getByText(assetAddressesLabel).parentElement!
            descriptionListAssertion({
              container: assetAddressesCard,
              items: [
                { term: assetCreatorLabel, description: 'JUT54SRAQLZ34MZ7I45KZJG63H3VLJ65VLLOLVVXPIBE3B2C7GFKBF5QAE' },
                { term: assetManagerLabel, description: 'JUT54SRAQLZ34MZ7I45KZJG63H3VLJ65VLLOLVVXPIBE3B2C7GFKBF5QAE' },
                { term: assetReserveLabel, description: 'V4UCC2YXBHLELD7Y6HYSKZI4GABLUG5HE6HAQQ36OBXFEZS7W4VMWB6DUQ' },
              ],
            })

            const assetMetadataCard = component.getByText(assetMetadataLabel).parentElement!
            descriptionListAssertion({
              container: assetMetadataCard,
              items: [
                {
                  term: 'Description',
                  description: 'Bad Bunny Society #587',
                },
              ],
            })

            const assetTraitsCard = component.getByText(assetTraitsLabel).parentElement!
            descriptionListAssertion({
              container: assetTraitsCard,
              items: [
                { term: 'Background', description: 'Red' },
                { term: 'Skin', description: 'Pink' },
                { term: 'Ear', description: 'Multicolor' },
                { term: 'Body', description: 'Orange Jacket' },
                { term: 'Mouth', description: 'Joint' },
                { term: 'Nose', description: 'Acid' },
                { term: 'Eyes', description: 'Rave' },
                { term: 'Head', description: 'Ring' },
              ],
            })
          })
        }
      )
    })
  })
})
