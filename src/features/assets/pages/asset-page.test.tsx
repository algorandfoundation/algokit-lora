import { assetResultMother } from '@/tests/object-mother/asset-result'
import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor } from '@/tests/testing-library'
import { describe, expect, it, vi } from 'vitest'
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
  assetUrlLabel,
} from '../components/labels'
import { useParams } from 'react-router-dom'
import { atom, createStore } from 'jotai'
import { algoAssetResult } from '../data'
import { indexer, algod } from '@/features/common/data'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { assetUnitLabel } from '@/features/transactions/components/asset-config-transaction-info'
import { HttpError } from '@/tests/errors'
import { ipfsGatewayUrl } from '../utils/replace-ipfs-with-gateway-if-needed'
import { assetResultsAtom } from '../data'

describe('asset-page', () => {
  describe('when rending an asset using an invalid asset Id', () => {
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

  describe('when rending an asset with asset Id that does not exist', () => {
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

  describe('when rending an asset that failed to load', () => {
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
      myStore.set(assetResultsAtom, new Map([[assetResult.index, atom(assetResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
      vi.mocked(fetch).mockImplementation(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              name: 'Orange',
              decimals: 8,
              description:
                "John Alan Woods 01/Dec/2023 You know, I can pull metrics out of the air too, whatever, 8 million transactions over the last week, I don't know, my mom has four oranges.",
              image: 'ipfs://QmaEGBYWLQWDqMMR9cwpX3t4xoRuJpz5kzCwwdQmWaxHXv',
              image_integrity: 'sha256-hizgBlZvh1teH9kzMnkocf2q9L7zpjLQZghQfKThVRg=',
              image_mimetype: 'image/png',
            }),
        } as Response)
      )

      vi.mocked(
        indexer.searchForTransactions().assetID(assetResult.index).txType('acfg').address('').addressRole('sender').limit(2).do().then
      ).mockImplementation(() => Promise.resolve([transactionResult]))

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
            expect(detailsCard.querySelector(`img[src="${ipfsGatewayUrl}QmaEGBYWLQWDqMMR9cwpX3t4xoRuJpz5kzCwwdQmWaxHXv"]`)).toBeTruthy()

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
      myStore.set(assetResultsAtom, new Map([[assetResult.index, atom(assetResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
      vi.mocked(fetch).mockImplementation(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
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
            }),
        } as Response)
      )
      vi.mocked(
        indexer.searchForTransactions().assetID(assetResult.index).txType('acfg').address('').addressRole('sender').limit(2).do().then
      ).mockImplementation(() => Promise.resolve([transactionResult]))

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
            expect(
              detailsCard.querySelector(`img[src="${ipfsGatewayUrl}bafkreicfzgycn6zwhmegqjfnsj4q4qkff2luu3tzfrxtv5qpra5buf7d74"]`)
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
      myStore.set(assetResultsAtom, new Map([[assetResult.index, atom(assetResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
      vi.mocked(
        indexer.searchForTransactions().assetID(assetResult.index).txType('acfg').address('').addressRole('sender').limit(2).do().then
      ).mockImplementation(() => Promise.resolve([transactionResult]))

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
            expect(detailsCard.querySelector('video>source[src="https://assets.datahistory.org/solar/SCQCSO.mp4#v"]')).toBeTruthy()

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
      myStore.set(assetResultsAtom, new Map([[assetResult.index, atom(assetResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
      vi.mocked(
        indexer.searchForTransactions().assetID(assetResult.index).txType('acfg').address('').addressRole('sender').limit(2).do().then
      ).mockImplementation(() => Promise.resolve([transactionResult]))

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
            expect(
              detailsCard.querySelector(`img[src="${ipfsGatewayUrl}bafkreifpfaqwwfyj2zcy76hr6eswkhbqak5bxjzhryeeg7tqnzjgmx5xfi"]`)
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

  describe('when rendering an ARC16 + ARC-19 asset', () => {
    const assetResult = assetResultMother['mainnet-1820067164']().build()
    const transactionResult = transactionResultMother['mainnet-K66JS73E3BDJ4OYHIC4QRRNSGY2PQMKSQMPYFQ6EEYJTOIPDUA3Q']().build()

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(assetResultsAtom, new Map([[assetResult.index, atom(assetResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ assetId: assetResult.index.toString() }))
      vi.mocked(fetch).mockImplementation(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
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
            }),
        } as Response)
      )
      vi.mocked(
        indexer.searchForTransactions().assetID(assetResult.index).txType('acfg').address('').addressRole('sender').limit(2).do().then
      ).mockImplementation(() => Promise.resolve([transactionResult]))

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
            expect(
              detailsCard.querySelector(`img[src="${ipfsGatewayUrl}bafybeigx4jqvsvkxdflvwvr2bmurrlugv4ulbgw7juhkd3rz52w32enwoy/48.png"]`)
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

  describe('when rendering a deleted asset', () => {
    const assetResult = assetResultMother['mainnet-917559']().build()
    const createAssetTransactionResult = transactionResultMother['mainnet-A5MOSCZBJAENBFJ5WDEYYXTTXQAADS6EQFHYLPTHS5WMQ7ZGSM2Q']().build()
    const reconfigureAssetTransactionResult =
      transactionResultMother['mainnet-HTGK2WBVXTOHV7X5ER3QT3JH2NQSZU43KEMSTHXMJO5D2E3ROT6Q']().build()
    const destroyAssetTransactionResult = transactionResultMother['mainnet-U4XH6AS5UUYQI4IZ3E5JSUEIU64Y3FGNYKLH26W4HRY7T6PK745A']().build()

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(assetResultsAtom, new Map([[assetResult.index, atom(assetResult)]]))

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
      myStore.set(assetResultsAtom, new Map([[algoAssetResult.index, atom(algoAssetResult)]]))

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
          })
        }
      )
    })
  })
})
