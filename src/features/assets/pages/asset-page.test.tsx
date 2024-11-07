import { assetResultMother } from '@/tests/object-mother/asset-result'
import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor } from '@/tests/testing-library'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { AssetPage, assetFailedToLoadMessage, assetInvalidIdMessage, assetNotFoundMessage } from './asset-page'
import { descriptionListAssertion } from '@/tests/assertions/description-list-assertion'
import {
  assetAddressesLabel,
  assetCreatorLabel,
  assetDecimalsLabel,
  assetDefaultFrozenLabel,
  assetDetailsLabel,
  assetIdLabel,
  assetManagerLabel,
  assetMetadataLabel,
  assetNameLabel,
  assetReserveLabel,
  assetTotalSupplyLabel,
  assetTraitsLabel,
  assetActivityLabel,
  assetUrlLabel,
  assetMediaLabel,
} from '../components/labels'
import { useParams } from 'react-router-dom'
import { createStore } from 'jotai'
import { algoAssetResult } from '../data'
import { createReadOnlyAtomAndTimestamp } from '@/features/common/data'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { assetUnitLabel } from '@/features/transactions/components/asset-config-transaction-info'
import { HttpError } from '@/tests/errors'
import { ipfsGatewayUrl } from '../utils/replace-ipfs-with-gateway-if-needed'
import { assetResultsAtom } from '../data'
import { refreshButtonLabel } from '@/features/common/components/refresh-button'
import { algod, indexer } from '@/features/common/data/algo-client'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { searchTransactionsMock } from '@/tests/setup/mocks'

const server = setupServer()

beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

vi.mock('@/features/common/data/algo-client', async () => {
  const original = await vi.importActual('@/features/common/data/algo-client')
  return {
    ...original,
    algod: {
      getAssetByID: vi.fn().mockReturnValue({
        do: vi.fn().mockReturnValue({ then: vi.fn() }),
      }),
    },
    indexer: {
      lookupAssetByID: vi.fn().mockReturnValue({
        includeAll: vi.fn().mockReturnValue({
          do: vi.fn().mockReturnValue({ then: vi.fn() }),
        }),
      }),
      searchForTransactions: vi.fn().mockImplementation(() => searchTransactionsMock),
    },
  }
})

describe('asset-page', () => {
  describe('when rendering an asset using an invalid asset Id', () => {
    it('should display invalid asset Id message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ assetId: 'invalid-id' }))

      return executeComponentTest(
        () => render(<AssetPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(assetInvalidIdMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering an asset with asset Id that does not exist', () => {
    it('should display not found message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ assetId: '123456' }))

      vi.mocked(algod.getAssetByID(0).do).mockImplementation(() => Promise.reject(new HttpError('boom', 404)))
      vi.mocked(indexer.lookupAssetByID(0).includeAll(true).do).mockImplementation(() => Promise.reject(new HttpError('boom', 404)))

      return executeComponentTest(
        () => render(<AssetPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(assetNotFoundMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering an asset that failed to load', () => {
    it('should display failed to load message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ assetId: '123456' }))
      vi.mocked(algod.getAssetByID(0).do).mockImplementation(() => Promise.reject({}))

      return executeComponentTest(
        () => render(<AssetPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(assetFailedToLoadMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering an ARC-3 asset', () => {
    const assetResult = assetResultMother['mainnet-1284444444']().build()
    const transactionResult = transactionResultMother.assetConfig().build()

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(assetResultsAtom, new Map([[assetResult.index, createReadOnlyAtomAndTimestamp(assetResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
      vi.mocked(
        indexer.searchForTransactions().assetID(assetResult.index).txType('acfg').address('').addressRole('sender').limit(2).do
      ).mockReturnValue(Promise.resolve({ transactions: [transactionResult] }))
      server.use(
        http.get('https://ipfs.algonode.xyz/ipfs/QmUitxJuPJJrcuAdAiVdEEpuzGmsELGgAvhLd5FiXRShEu', () => {
          return HttpResponse.json({
            name: 'Orange',
            decimals: 8,
            description:
              "John Alan Woods 01/Dec/2023 You know, I can pull metrics out of the air too, whatever, 8 million transactions over the last week, I don't know, my mom has four oranges.",
            image: 'ipfs://QmaEGBYWLQWDqMMR9cwpX3t4xoRuJpz5kzCwwdQmWaxHXv',
            image_integrity: 'sha256-hizgBlZvh1teH9kzMnkocf2q9L7zpjLQZghQfKThVRg=',
            image_mimetype: 'image/png',
          })
        })
      )

      return executeComponentTest(
        () => {
          return render(<AssetPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() => {
            const detailsCard = component.getByLabelText(assetDetailsLabel)
            descriptionListAssertion({
              container: detailsCard,
              items: [
                { term: assetIdLabel, description: '1284444444ARC-3Fungible' },
                { term: assetNameLabel, description: 'Orange' },
                { term: assetUnitLabel, description: 'ORA' },
                { term: assetTotalSupplyLabel, description: '4000000 ORA' },
                { term: assetDecimalsLabel, description: '8' },
                { term: assetDefaultFrozenLabel, description: 'No' },
                { term: assetUrlLabel, description: 'ipfs://QmUitxJuPJJrcuAdAiVdEEpuzGmsELGgAvhLd5FiXRShEu#arc3' },
              ],
            })

            const mediaCard = component.getByLabelText(assetMediaLabel)
            expect(mediaCard.querySelector(`img[src="${ipfsGatewayUrl}QmaEGBYWLQWDqMMR9cwpX3t4xoRuJpz5kzCwwdQmWaxHXv"]`)).toBeTruthy()

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
              items: [
                { term: 'Name', description: 'Orange' },
                { term: 'Decimals', description: '8' },
                {
                  term: 'Description',
                  description:
                    "John Alan Woods 01/Dec/2023 You know, I can pull metrics out of the air too, whatever, 8 million transactions over the last week, I don't know, my mom has four oranges.",
                },
                { term: 'Image', description: 'ipfs://QmaEGBYWLQWDqMMR9cwpX3t4xoRuJpz5kzCwwdQmWaxHXv' },
                { term: 'Image Integrity', description: 'sha256-hizgBlZvh1teH9kzMnkocf2q9L7zpjLQZghQfKThVRg=' },
                { term: 'Image Mimetype', description: 'image/png' },
              ],
            })

            const activityTabList = component.getByRole('tablist', { name: assetActivityLabel })
            expect(activityTabList).toBeTruthy()
            expect(activityTabList.children.length).toBe(2)
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
      myStore.set(assetResultsAtom, new Map([[assetResult.index, createReadOnlyAtomAndTimestamp(assetResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
      vi.mocked(
        indexer.searchForTransactions().assetID(assetResult.index).txType('acfg').address('').addressRole('sender').limit(2).do
      ).mockReturnValue(Promise.resolve({ transactions: [transactionResult] }))
      server.use(
        http.get('https://ipfs.algonode.xyz/ipfs/bafkreidt263gwlss4t5kdg6tekxhlxsedb42l5ntvt5mzbv5jywzrzk2ku', () => {
          return HttpResponse.json({
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
          })
        })
      )

      return executeComponentTest(
        () => {
          return render(<AssetPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() => {
            const detailsCard = component.getByLabelText(assetDetailsLabel)
            descriptionListAssertion({
              container: detailsCard,
              items: [
                { term: assetIdLabel, description: '1494117806ARC-3ARC-19Pure Non-Fungible' },
                { term: assetNameLabel, description: 'Zappy #1620' },
                { term: assetUnitLabel, description: 'ZAPP1620' },
                { term: assetTotalSupplyLabel, description: '1 ZAPP1620' },
                { term: assetDecimalsLabel, description: '0' },
                { term: assetDefaultFrozenLabel, description: 'No' },
                { term: assetUrlLabel, description: 'template-ipfs://{ipfscid:1:raw:reserve:sha2-256}#arc3' },
              ],
            })

            const mediaCard = component.getByLabelText(assetMediaLabel)
            expect(
              mediaCard.querySelector(`img[src="${ipfsGatewayUrl}bafkreicfzgycn6zwhmegqjfnsj4q4qkff2luu3tzfrxtv5qpra5buf7d74"]`)
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
                { term: 'Name', description: 'Zappy #1620' },
                { term: 'Standard', description: 'arc3' },
                { term: 'Decimals', description: '0' },
                { term: 'Image', description: 'ipfs://bafkreicfzgycn6zwhmegqjfnsj4q4qkff2luu3tzfrxtv5qpra5buf7d74' },
                { term: 'Image Mimetype', description: 'image/png' },
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
      myStore.set(assetResultsAtom, new Map([[assetResult.index, createReadOnlyAtomAndTimestamp(assetResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
      vi.mocked(
        indexer.searchForTransactions().assetID(assetResult.index).txType('acfg').address('').addressRole('sender').limit(2).do
      ).mockReturnValue(Promise.resolve({ transactions: [transactionResult] }))

      return executeComponentTest(
        () => {
          return render(<AssetPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() => {
            const detailsCard = component.getByLabelText(assetDetailsLabel)
            descriptionListAssertion({
              container: detailsCard,
              items: [
                { term: assetIdLabel, description: '1800979729ARC-69Pure Non-Fungible' },
                { term: assetNameLabel, description: 'DHMα: M1 Solar Flare SCQCSO' },
                { term: assetUnitLabel, description: 'SOLFLARE' },
                { term: assetTotalSupplyLabel, description: '1 SOLFLARE' },
                { term: assetDecimalsLabel, description: '0' },
                { term: assetDefaultFrozenLabel, description: 'No' },
                { term: assetUrlLabel, description: 'https://assets.datahistory.org/solar/SCQCSO.mp4#v' },
              ],
            })

            const mediaCard = component.getByLabelText(assetMediaLabel)
            expect(mediaCard.querySelector('video>source[src="https://assets.datahistory.org/solar/SCQCSO.mp4#v"]')).toBeTruthy()

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
                { term: 'Standard', description: 'arc69' },
                {
                  term: 'Description',
                  description:
                    'This is an alpha data artifact minted by The Data History Museum. It represents a Class M1.6 solar flare. The verified source of this data artifact was the National Oceanic and Atmospheric Administration (NOAA). For more information visit https://datahistory.org/.',
                },
                { term: 'External Url', description: 'https://museum.datahistory.org/event/SOLFLARE/SCQCSO' },
                { term: 'Mime Type', description: 'video/mp4' },
                { term: 'Id', description: 'SCQCSO' },
                { term: 'Title', description: 'Class M1.6 solar flare that peaked at Tue, 30 Apr 2024 01:14:00 GMT' },
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
      myStore.set(assetResultsAtom, new Map([[assetResult.index, createReadOnlyAtomAndTimestamp(assetResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
      vi.mocked(
        indexer.searchForTransactions().assetID(assetResult.index).txType('acfg').address('').addressRole('sender').limit(2).do
      ).mockReturnValue(Promise.resolve({ transactions: [transactionResult] }))
      server.use(
        http.get('https://ipfs.algonode.xyz/ipfs/bafkreifpfaqwwfyj2zcy76hr6eswkhbqak5bxjzhryeeg7tqnzjgmx5xfi', () => {
          return HttpResponse.json({
            image: 'ipfs://bafkreifpfaqwwfyj2zcy76hr6eswkhbqak5bxjzhryeeg7tqnzjgmx5xfi',
          })
        })
      )

      return executeComponentTest(
        () => {
          return render(<AssetPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() => {
            const detailsCard = component.getByLabelText(assetDetailsLabel)
            descriptionListAssertion({
              container: detailsCard,
              items: [
                { term: assetIdLabel, description: '854081201ARC-19ARC-69Pure Non-Fungible' },
                { term: assetNameLabel, description: 'Bad Bunny Society #587' },
                { term: assetUnitLabel, description: 'bbs587' },
                { term: assetTotalSupplyLabel, description: '1 bbs587' },
                { term: assetDecimalsLabel, description: '0' },
                { term: assetDefaultFrozenLabel, description: 'No' },
                { term: assetUrlLabel, description: 'template-ipfs://{ipfscid:1:raw:reserve:sha2-256}' },
              ],
            })

            const mediaCard = component.getByLabelText(assetMediaLabel)
            expect(
              mediaCard.querySelector(`img[src="${ipfsGatewayUrl}bafkreifpfaqwwfyj2zcy76hr6eswkhbqak5bxjzhryeeg7tqnzjgmx5xfi"]`)
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
                { term: 'Standard', description: 'arc69' },
                { term: 'Description', description: 'Bad Bunny Society #587' },
                { term: 'Mime Type', description: 'image/webp' },
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

  describe('when rendering an ARC-16 + ARC-19 asset', () => {
    const assetResult = assetResultMother['mainnet-1820067164']().build()
    const transactionResult = transactionResultMother['mainnet-K66JS73E3BDJ4OYHIC4QRRNSGY2PQMKSQMPYFQ6EEYJTOIPDUA3Q']().build()

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(assetResultsAtom, new Map([[assetResult.index, createReadOnlyAtomAndTimestamp(assetResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
      vi.mocked(
        indexer.searchForTransactions().assetID(assetResult.index).txType('acfg').address('').addressRole('sender').limit(2).do
      ).mockReturnValue(Promise.resolve({ transactions: [transactionResult] }))
      server.use(
        http.get('https://ipfs.algonode.xyz/ipfs/bafkreihwm3mg4t4bgdvsf6j4epr4v7qwmuhbk6dv3qt3kmtmmm7uagrji4', () => {
          return HttpResponse.json({
            name: 'Coop #48',
            standard: 'arc3',
            image: 'ipfs://bafybeigx4jqvsvkxdflvwvr2bmurrlugv4ulbgw7juhkd3rz52w32enwoy/48.png',
            image_mime_type: 'image/png',
            description:
              "A troop of 890 Coopers based on Cooper Daniels' DEV'N and his quest for CoopCoin Beach. Artwork by F.o.E. and inspired by the original work of Blockrunner for the ReCoop Show.",
            properties: {
              traits: {
                Background: 'Soft Cream',
                Base: 'Coop v1',
                Tat: 'Naked',
                'Chest Hair': 'Clean',
                Outfit: 'Coop Hoodie',
                'Face Tat': 'Clean',
                'Face Trait': 'Gold Grill',
                'Lower Face': 'Fresh Trim',
                'Upper Head': 'Scoopy',
                Eyes: 'Coop Brokelys',
                Ears: 'Hoop',
              },
              filters: {},
            },
            extra: {},
          })
        })
      )

      return executeComponentTest(
        () => {
          return render(<AssetPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() => {
            const detailsCard = component.getByLabelText(assetDetailsLabel)
            descriptionListAssertion({
              container: detailsCard,
              items: [
                { term: assetIdLabel, description: '1820067164ARC-16ARC-19Pure Non-Fungible' },
                { term: assetNameLabel, description: 'Coop #48' },
                { term: assetUnitLabel, description: 'Coop48' },
                { term: assetTotalSupplyLabel, description: '1 Coop48' },
                { term: assetDecimalsLabel, description: '0' },
                { term: assetDefaultFrozenLabel, description: 'No' },
                { term: assetUrlLabel, description: 'template-ipfs://{ipfscid:1:raw:reserve:sha2-256}' },
              ],
            })

            const mediaCard = component.getByLabelText(assetMediaLabel)
            expect(
              mediaCard.querySelector(`img[src="${ipfsGatewayUrl}bafybeigx4jqvsvkxdflvwvr2bmurrlugv4ulbgw7juhkd3rz52w32enwoy/48.png"]`)
            ).toBeTruthy()

            const assetAddressesCard = component.getByText(assetAddressesLabel).parentElement!
            descriptionListAssertion({
              container: assetAddressesCard,
              items: [
                { term: assetCreatorLabel, description: 'COOPLFOESCTQJVLSFKAA4QURNBDZGMRYJVRH7BRRREB7FFZSHIIA4AVIBE' },
                { term: assetManagerLabel, description: 'COOPLFOESCTQJVLSFKAA4QURNBDZGMRYJVRH7BRRREB7FFZSHIIA4AVIBE' },
                { term: assetReserveLabel, description: '6ZTNQ3SPQEYOWIXZHQR6HSX6CZSQ4FLYOXOCPNJSNRRT6QA2FFD6JIBDSI' },
              ],
            })

            const assetMetadataCard = component.getByText(assetMetadataLabel).parentElement!
            descriptionListAssertion({
              container: assetMetadataCard,
              items: [
                { term: 'Name', description: 'Coop #48' },
                { term: 'Standard', description: 'arc3' },
                { term: 'Image', description: 'ipfs://bafybeigx4jqvsvkxdflvwvr2bmurrlugv4ulbgw7juhkd3rz52w32enwoy/48.png' },
                { term: 'Image Mime Type', description: 'image/png' },
                {
                  term: 'Description',
                  description:
                    "A troop of 890 Coopers based on Cooper Daniels' DEV'N and his quest for CoopCoin Beach. Artwork by F.o.E. and inspired by the original work of Blockrunner for the ReCoop Show.",
                },
                { term: 'Extra', description: '{}' },
              ],
            })

            const assetTraitsCard = component.getByText(assetTraitsLabel).parentElement!
            descriptionListAssertion({
              container: assetTraitsCard,
              items: [
                { term: 'Background', description: 'Soft Cream' },
                { term: 'Base', description: 'Coop v1' },
                { term: 'Tat', description: 'Naked' },
                { term: 'Chest Hair', description: 'Clean' },
                { term: 'Outfit', description: 'Coop Hoodie' },
                { term: 'Face Tat', description: 'Clean' },
                { term: 'Face Trait', description: 'Gold Grill' },
                { term: 'Lower Face', description: 'Fresh Trim' },
                { term: 'Upper Head', description: 'Scoopy' },
                { term: 'Eyes', description: 'Coop Brokelys' },
                { term: 'Ears', description: 'Hoop' },
              ],
            })
          })
        }
      )
    })
  })

  describe('when rendering an ARC-3 + ARC-69 asset', () => {
    const assetResult = assetResultMother['mainnet-909935715']().build()
    const transactionResult = transactionResultMother['mainnet-W7UVVLOW6RWZYEC64WTOVL5RME33UGI6H6AUP7GSEZW4QNDM4GHA']().build()

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(assetResultsAtom, new Map([[assetResult.index, createReadOnlyAtomAndTimestamp(assetResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
      vi.mocked(
        indexer.searchForTransactions().assetID(assetResult.index).txType('acfg').address('').addressRole('sender').limit(2).do
      ).mockReturnValue(Promise.resolve({ transactions: [transactionResult] }))
      server.use(
        http.get('https://ipfs.algonode.xyz/ipfs/QmfYFvNon3vfxbwtcetjYc1uZZ1Faw7AsQtSzz45sxXnaj', () => {
          return HttpResponse.json({
            name: 'NK 0217',
            decimals: 0,
            description: 'Protecting decentralization since 2029. Join the rebellion!',
            image: 'ipfs://QmSayaiy8H4UhYY5kbgZF5knYqtmfuZkaJ84fx5gpgPSKB',
            image_integrity: 'sha256-9DLERd+0OFGoETUCebETjjaiPjn8OywsISozPuEgjaU=',
            image_mimetype: 'image/png',
            unitName: 'NK 0217',
            assetName: 'NK 0217',
            properties: {
              creator: { name: 'Node Keepers', description: '', address: 'CB3KEWUQUTDHQ3TC4P65UQLHC3S7KNBWPTHOFAL7CV4QCDUPDNVY5J3BT4' },
              royalties: [{ name: 'creator', addr: 'CB3KEWUQUTDHQ3TC4P65UQLHC3S7KNBWPTHOFAL7CV4QCDUPDNVY5J3BT4', share: 5 }],
              collection: { name: 'NODE KEEPERS' },
              keyWords: [],
              publisher: 'dartroom.xyz',
              itemListElement: 1,
              numberOfItems: 1,
              arc69: {
                standard: 'arc69',
                attributes: [
                  { trait_type: 'backgrounds', value: 'blue' },
                  { trait_type: 'equpiment', value: 'blank' },
                  { trait_type: 'skintones', value: 'tanned skin' },
                  { trait_type: 'neck', value: 'blank' },
                  { trait_type: 'clothing', value: 'blue nks hoody with m vest' },
                  { trait_type: 'hair', value: 'red long bob cut' },
                  { trait_type: 'headsets', value: 'c link' },
                  { trait_type: 'lips', value: 'normal lips smoking' },
                ],
              },
            },
          })
        })
      )

      return executeComponentTest(
        () => {
          return render(<AssetPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() => {
            const detailsCard = component.getByLabelText(assetDetailsLabel)
            descriptionListAssertion({
              container: detailsCard,
              items: [
                { term: assetIdLabel, description: '909935715ARC-3ARC-69Pure Non-Fungible' },
                { term: assetNameLabel, description: 'NK 0217' },
                { term: assetUnitLabel, description: 'NK 0217' },
                { term: assetTotalSupplyLabel, description: '1 NK 0217' },
                { term: assetDecimalsLabel, description: '0' },
                { term: assetDefaultFrozenLabel, description: 'No' },
                { term: assetUrlLabel, description: 'ipfs://QmfYFvNon3vfxbwtcetjYc1uZZ1Faw7AsQtSzz45sxXnaj#arc3' },
              ],
            })

            const mediaCard = component.getByLabelText(assetMediaLabel)
            expect(mediaCard.querySelector(`img[src="${ipfsGatewayUrl}QmSayaiy8H4UhYY5kbgZF5knYqtmfuZkaJ84fx5gpgPSKB"]`)).toBeTruthy()

            const assetAddressesCard = component.getByText(assetAddressesLabel).parentElement!
            descriptionListAssertion({
              container: assetAddressesCard,
              items: [
                { term: assetCreatorLabel, description: 'CB3KEWUQUTDHQ3TC4P65UQLHC3S7KNBWPTHOFAL7CV4QCDUPDNVY5J3BT4' },
                { term: assetManagerLabel, description: 'CB3KEWUQUTDHQ3TC4P65UQLHC3S7KNBWPTHOFAL7CV4QCDUPDNVY5J3BT4' },
              ],
            })

            const assetMetadataCard = component.getByText(assetMetadataLabel).parentElement!
            descriptionListAssertion({
              container: assetMetadataCard,
              items: [
                { term: 'Name', description: 'NK 0217' },
                { term: 'Decimals', description: '0' },
                { term: 'Description', description: 'Protecting decentralization since 2029. Join the rebellion!' },
                { term: 'Image', description: 'ipfs://QmSayaiy8H4UhYY5kbgZF5knYqtmfuZkaJ84fx5gpgPSKB' },
                { term: 'Image Integrity', description: 'sha256-9DLERd+0OFGoETUCebETjjaiPjn8OywsISozPuEgjaU=' },
                { term: 'Image Mimetype', description: 'image/png' },
                { term: 'UnitName', description: 'NK 0217' },
                { term: 'AssetName', description: 'NK 0217' },
                { term: 'Standard', description: 'arc69' },
              ],
            })

            const assetTraitsCard = component.getByText(assetTraitsLabel).parentElement!
            descriptionListAssertion({
              container: assetTraitsCard,
              items: [
                {
                  term: 'creator',
                  description:
                    '{"name":"Node Keepers","description":"","address":"CB3KEWUQUTDHQ3TC4P65UQLHC3S7KNBWPTHOFAL7CV4QCDUPDNVY5J3BT4"}',
                },
                {
                  term: 'royalties',
                  description: '[{"name":"creator","addr":"CB3KEWUQUTDHQ3TC4P65UQLHC3S7KNBWPTHOFAL7CV4QCDUPDNVY5J3BT4","share":5}]',
                },
                { term: 'collection', description: '{"name":"NODE KEEPERS"}' },
                { term: 'keyWords', description: '[]' },
                { term: 'publisher', description: 'dartroom.xyz' },
                { term: 'itemListElement', description: '1' },
                { term: 'numberOfItems', description: '1' },
                { term: 'background', description: 'blue' },
                { term: 'equipment', description: 'blank' },
                { term: 'skintone', description: 'tanned skin' },
                { term: 'neck', description: 'blank' },
                { term: 'clothing', description: 'blue nks hoody with m vest' },
                { term: 'hair', description: 'red long bob cut' },
                { term: 'headset', description: 'c link' },
                { term: 'mouth', description: 'smoking mouth' },
              ],
            })
          })
        }
      )
    })
  })

  describe('when rendering a deleted asset', () => {
    const assetResult = assetResultMother['mainnet-917559']().build()
    const createAssetTransactionResult = transactionResultMother['mainnet-A5MOSCZBJAENBFJ5WDEYYXTTXQAADS6EQFHYLPTHS5WMQ7ZGSM2Q']().build()
    const reconfigureAssetTransactionResult =
      transactionResultMother['mainnet-HTGK2WBVXTOHV7X5ER3QT3JH2NQSZU43KEMSTHXMJO5D2E3ROT6Q']().build()
    const destroyAssetTransactionResult = transactionResultMother['mainnet-U4XH6AS5UUYQI4IZ3E5JSUEIU64Y3FGNYKLH26W4HRY7T6PK745A']().build()

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(assetResultsAtom, new Map([[assetResult.index, createReadOnlyAtomAndTimestamp(assetResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
      vi.mocked(indexer.searchForTransactions().assetID(assetResult.index).txType('acfg').do).mockImplementation(() =>
        Promise.resolve([createAssetTransactionResult, reconfigureAssetTransactionResult, destroyAssetTransactionResult])
      )

      return executeComponentTest(
        () => {
          return render(<AssetPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() => {
            const detailsCard = component.getByLabelText(assetDetailsLabel)
            descriptionListAssertion({
              container: detailsCard,
              items: [
                { term: assetIdLabel, description: '917559Deleted' },
                { term: assetTotalSupplyLabel, description: '0 ' },
                { term: assetDecimalsLabel, description: '0' },
                { term: assetDefaultFrozenLabel, description: 'No' },
              ],
            })

            const assetAddressesCard = component.getByText(assetAddressesLabel).parentElement!
            descriptionListAssertion({
              container: assetAddressesCard,
              items: [{ term: assetCreatorLabel, description: 'YA2XBMS34J27VKLIWJQ5AWU7FJASZ6PUNICQOB4PJ2NW4CAX5AHB7RVGMY' }],
            })
          })
        }
      )
    })
  })

  describe('when rendering the algo asset', () => {
    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(assetResultsAtom, new Map([[algoAssetResult.index, createReadOnlyAtomAndTimestamp(algoAssetResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: algoAssetResult.index.toString() }))

      return executeComponentTest(
        () => {
          return render(<AssetPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() => {
            const detailsCard = component.getByLabelText(assetDetailsLabel)
            descriptionListAssertion({
              container: detailsCard,
              items: [
                { term: assetIdLabel, description: '0Fungible' },
                { term: assetNameLabel, description: 'ALGO' },
                { term: assetUnitLabel, description: 'ALGO' },
                { term: assetTotalSupplyLabel, description: '10000000000 ALGO' },
                { term: assetDecimalsLabel, description: '6' },
                { term: assetDefaultFrozenLabel, description: 'No' },
                { term: assetUrlLabel, description: 'https://www.algorand.foundation' },
              ],
            })

            const assetAddressesCard = component.queryByText(assetAddressesLabel)
            expect(assetAddressesCard).toBeNull()

            const assetMetadataCard = component.queryByText(assetMetadataLabel)
            expect(assetMetadataCard).toBeNull()

            const assetTraitsCard = component.queryByText(assetTraitsLabel)
            expect(assetTraitsCard).toBeNull()

            const activityTabList = component.queryByRole('tablist', { name: assetActivityLabel })
            expect(activityTabList).toBeNull()
          })
        }
      )
    })
  })

  describe('when rendering an asset that becomes stale', () => {
    const assetResult = assetResultMother['mainnet-1284444444']().build()
    const transactionResult = transactionResultMother.assetConfig().build()

    it('should be rendered with the refresh button', () => {
      const myStore = createStore()
      myStore.set(assetResultsAtom, new Map([[assetResult.index, createReadOnlyAtomAndTimestamp(assetResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
      vi.mocked(
        indexer.searchForTransactions().assetID(assetResult.index).txType('acfg').address('').addressRole('sender').limit(2).do
      ).mockReturnValue(Promise.resolve({ transactions: [transactionResult] }))
      server.use(
        http.get('https://ipfs.algonode.xyz/ipfs/QmUitxJuPJJrcuAdAiVdEEpuzGmsELGgAvhLd5FiXRShEu', () => {
          return HttpResponse.json({
            name: 'Orange',
            decimals: 8,
            description:
              "John Alan Woods 01/Dec/2023 You know, I can pull metrics out of the air too, whatever, 8 million transactions over the last week, I don't know, my mom has four oranges.",
            image: 'ipfs://QmaEGBYWLQWDqMMR9cwpX3t4xoRuJpz5kzCwwdQmWaxHXv',
            image_integrity: 'sha256-hizgBlZvh1teH9kzMnkocf2q9L7zpjLQZghQfKThVRg=',
            image_mimetype: 'image/png',
          })
        })
      )

      return executeComponentTest(
        () => {
          return render(<AssetPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() => {
            const detailsCard = component.getByLabelText(assetDetailsLabel)
            descriptionListAssertion({
              container: detailsCard,
              items: [{ term: assetIdLabel, description: '1284444444ARC-3Fungible' }],
            })

            const refreshButton = component.queryByLabelText(refreshButtonLabel)
            expect(refreshButton).toBeFalsy()
          })

          // Simulate the asset being evicted from the store, due to staleness
          myStore.set(assetResultsAtom, new Map())

          await waitFor(() => {
            const detailsCard = component.getByLabelText(assetDetailsLabel)
            descriptionListAssertion({
              container: detailsCard,
              items: [{ term: assetIdLabel, description: '1284444444ARC-3Fungible' }],
            })

            const refreshButton = component.getByLabelText(refreshButtonLabel)
            expect(refreshButton).toBeTruthy()
          })
        }
      )
    })
  })

  describe('when rendering an ARC-19 asset with invalid json metadata', () => {
    const assetResult = assetResultMother['mainnet-1024439078']().build()
    const transactionResult = transactionResultMother.assetConfig().build()
    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(assetResultsAtom, new Map([[assetResult.index, createReadOnlyAtomAndTimestamp(assetResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
      vi.mocked(
        indexer.searchForTransactions().assetID(assetResult.index).txType('acfg').address('').addressRole('sender').limit(2).do
      ).mockReturnValue(Promise.resolve({ transactions: [transactionResult] }))
      server.use(
        http.head('https://ipfs.algonode.xyz/ipfs/QmbYMPpNdec5Nj8g11JCcaArCSreLWYUcAhPqAK6LjPAtd', () => {
          return new Response(null, { status: 200, headers: { 'Content-Type': 'image/png' } })
        }),
        http.get('https://ipfs.algonode.xyz/ipfs/QmbYMPpNdec5Nj8g11JCcaArCSreLWYUcAhPqAK6LjPAtd', () => {
          return HttpResponse.arrayBuffer(new ArrayBuffer(1), { status: 200, headers: { 'Content-Type': 'image/png' } })
        })
      )

      return executeComponentTest(
        () => {
          return render(<AssetPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() => {
            const detailsCard = component.getByLabelText(assetDetailsLabel)
            descriptionListAssertion({
              container: detailsCard,
              items: [
                { term: assetIdLabel, description: '1024439078ARC-19Fungible' },
                { term: assetNameLabel, description: 'Fracctal Token' },
                { term: assetUnitLabel, description: 'FRACC' },
                { term: assetTotalSupplyLabel, description: '10000000000 FRACC' },
                { term: assetDecimalsLabel, description: '0' },
                { term: assetDefaultFrozenLabel, description: 'No' },
                { term: assetUrlLabel, description: 'template-ipfs://{ipfscid:0:dag-pb:reserve:sha2-256}' },
              ],
            })

            const mediaCard = component.getByLabelText(assetMediaLabel)
            expect(
              mediaCard.querySelector(`img[src="https://ipfs.algonode.xyz/ipfs/QmbYMPpNdec5Nj8g11JCcaArCSreLWYUcAhPqAK6LjPAtd"]`)
            ).toBeTruthy()

            const assetAddressesCard = component.getByText(assetAddressesLabel).parentElement!
            descriptionListAssertion({
              container: assetAddressesCard,
              items: [
                { term: assetCreatorLabel, description: 'KPVZ66IFE7KHQ6623XHTPVS3IL7BXBE3HXQG35J65CVDA54VLRPP4SVOU4' },
                { term: assetManagerLabel, description: 'KPVZ66IFE7KHQ6623XHTPVS3IL7BXBE3HXQG35J65CVDA54VLRPP4SVOU4' },
                { term: assetReserveLabel, description: 'YQTVEPKB4O5F26H76L5I7BA6VGCMRC6P2QSWRKG4KVJLJ62MVYTDJPM6KE' },
              ],
            })

            const assetMetadataCard = component.getByText(assetMetadataLabel).parentElement!
            descriptionListAssertion({
              container: assetMetadataCard,
              items: [{ term: 'Image', description: 'ipfs://QmbYMPpNdec5Nj8g11JCcaArCSreLWYUcAhPqAK6LjPAtd' }],
            })
          })
        }
      )
    })
  })
})
