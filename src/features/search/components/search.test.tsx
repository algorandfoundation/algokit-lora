import { Search, noSearchResultsMessage, searchPlaceholderLabel } from './search'
import { describe, it, expect, vi } from 'vitest'
import { render, renderHook, waitFor } from '@/tests/testing-library'
import { executeComponentTest } from '@/tests/test-component'
import { atom, createStore } from 'jotai'
import { assetResultMother } from '@/tests/object-mother/asset-result'
import { applicationResultsAtom } from '@/features/applications/data'
import { applicationResultMother } from '@/tests/object-mother/application-result'
import { blockResultMother } from '@/tests/object-mother/block-result'
import { blockResultsAtom } from '@/features/blocks/data'
import { useNavigate } from 'react-router-dom'
import { SearchResultType } from '../models'
import { assetResultsAtom } from '@/features/assets/data'
import { createReadOnlyAtomAndTimestamp } from '@/features/common/data'
import { transactionResultsAtom } from '@/features/transactions/data'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { forwardNfdResultsAtom, reverseNfdsAtom } from '@/features/nfd/data'
import { nfdResultMother } from '@/tests/object-mother/nfd-result'
import { defaultNetworkConfigs, localnetId, useSetCustomNetworkConfig } from '@/features/network/data'

describe('search', () => {
  describe('when no search results have been returned', () => {
    it('should render the no results message', () => {
      return executeComponentTest(
        () => render(<Search />),
        async (component, user) => {
          await waitFor(async () => {
            const input = component.getByPlaceholderText(searchPlaceholderLabel)
            await user.type(input, 'nothing')
            const result = await component.findByText(noSearchResultsMessage)

            expect(result).toBeDefined()
          })
        }
      )
    })
  })

  describe('when search results have been returned', () => {
    const assetResult = assetResultMother['mainnet-140479105']().build()
    const applicationResult = applicationResultMother.basic().withId(assetResult.index).build()
    const blockResult = blockResultMother.blockWithoutTransactions().withRound(assetResult.index).build()
    const transactionResult = transactionResultMother.payment().withId('FBORGSDC4ULLWHWZUMUFIYQLSDC26HGLTFD7EATQDY37FHCIYBBQ').build()

    const myStore = createStore()
    myStore.set(blockResultsAtom, new Map([[blockResult.round, createReadOnlyAtomAndTimestamp(blockResult)]]))
    myStore.set(assetResultsAtom, new Map([[assetResult.index, createReadOnlyAtomAndTimestamp(assetResult)]]))
    myStore.set(applicationResultsAtom, new Map([[applicationResult.id, createReadOnlyAtomAndTimestamp(applicationResult)]]))
    myStore.set(transactionResultsAtom, new Map([[transactionResult.id, createReadOnlyAtomAndTimestamp(transactionResult)]]))

    describe.each([
      {
        type: SearchResultType.Block,
        id: blockResult.round.toString(),
        label: blockResult.round.toString(),
      },
      {
        type: SearchResultType.Transaction,
        id: transactionResult.id,
        label: `${transactionResult.id.substring(0, 7)}…`,
      },
      {
        type: SearchResultType.Account,
        id: 'KIZLH4HUM5ZIB5RVP6DR2IGXB44TGJ6HZUZIAYZFZ63KWCAQB2EZGPU5BQ',
        label: 'KIZL…U5BQ',
      },
      {
        type: SearchResultType.Asset,
        id: assetResult.index.toString(),
        label: `${assetResult.index} (${assetResult.params.name!})`,
      },
      {
        type: SearchResultType.Application,
        id: applicationResult.id.toString(),
        label: applicationResult.id.toString(),
      },
    ])('and the $type result is selected', ({ type, id, label }: { type: SearchResultType; id: string; label: string }) => {
      it(`should navigate to the ${type.toLowerCase()} page`, () => {
        const mockNavigate = vi.fn()
        vi.mocked(useNavigate).mockReturnValue(mockNavigate)
        if (type === SearchResultType.Account) {
          const mockReverseNfdAtom = atom<string | Promise<string | null> | null>(null)
          myStore.set(reverseNfdsAtom, new Map([[id, [mockReverseNfdAtom, Date.now()] as const]]))
        }

        return executeComponentTest(
          () => render(<Search />, undefined, myStore),
          async (component, user) => {
            await waitFor(
              async () => {
                const input = component.getByPlaceholderText(searchPlaceholderLabel)
                await user.type(input, id)
                const results = (await component.findAllByText(label, undefined, { timeout: 1000 })).map((result) => result.parentElement)
                const result = results.find((result) => result!.textContent!.includes(type))!
                await user.click(result)
                expect(mockNavigate).toHaveBeenCalledWith(`/localnet/${type.toLowerCase()}/${id}`)
              },
              { timeout: 10000 }
            )
          }
        )
      })
    })
  })

  describe('when search results for nfd have been returned', () => {
    const nfdResult = nfdResultMother['mainnet-datamuseum.algo']().build()
    const myStore = createStore()
    myStore.set(forwardNfdResultsAtom, new Map([[nfdResult.name, createReadOnlyAtomAndTimestamp(nfdResult)]]))

    describe.each([
      {
        type: SearchResultType.Account,
        term: 'datamuseum.algo',
        id: 'DHMCHBN4W5MBO72C3L3ZP6GGJHQ4OR6SW2EP3VDEJ5VHT4MERQLCTVW6PU',
        label: 'DHMC…W6PU (datamuseum.algo)',
      },
    ])(
      'and the $type result is selected for nfd',
      ({ type, id, term, label }: { type: SearchResultType; id: string; term: string; label: string }) => {
        it(`should navigate to the ${type.toLowerCase()} page`, () => {
          const mockNavigate = vi.fn()
          vi.mocked(useNavigate).mockReturnValue(mockNavigate)

          renderHook(async () => {
            const setCustomNetworkConfig = useSetCustomNetworkConfig()
            setCustomNetworkConfig(localnetId, {
              nfdApiUrl: 'http://not-used',
              ...defaultNetworkConfigs[localnetId],
            })
          })

          return executeComponentTest(
            () => render(<Search />, undefined, myStore),
            async (component, user) => {
              await waitFor(
                async () => {
                  const input = component.getByPlaceholderText(searchPlaceholderLabel)
                  await user.type(input, term)
                  const results = (await component.findAllByText(label, undefined, { timeout: 1000 })).map((result) => result.parentElement)
                  const result = results.find((result) => result!.textContent!.includes(type))!
                  await user.click(result)
                  expect(mockNavigate).toHaveBeenCalledWith(`/localnet/${type.toLowerCase()}/${id}`)
                },
                { timeout: 10000 }
              )
            }
          )
        })
      }
    )
  })
})
