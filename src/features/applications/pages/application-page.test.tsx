import { executeComponentTest } from '@/tests/test-component'
import { findByRole, findByText, getByRole, render, waitFor, within } from '@/tests/testing-library'
import { useParams } from 'react-router-dom'
import { describe, expect, it, vi, beforeAll } from 'vitest'
import {
  ApplicationPage,
  applicationFailedToLoadMessage,
  applicationInvalidIdMessage,
  applicationNotFoundMessage,
} from './application-page'
import { createReadOnlyAtomAndTimestamp, createTimestamp } from '@/features/common/data'
import { HttpError } from '@/tests/errors'
import { applicationResultMother } from '@/tests/object-mother/application-result'
import { createStore } from 'jotai'
import { applicationResultsAtom } from '../data'
import {
  applicationAbiMethodDefinitionsLabel,
  applicationAccountLabel,
  applicationBoxesLabel,
  applicationCreatorAccountLabel,
  applicationDetailsLabel,
  applicationGlobalStateByteLabel,
  applicationGlobalStateLabel,
  applicationGlobalStateUintLabel,
  applicationIdLabel,
  applicationLocalStateByteLabel,
  applicationLocalStateLabel,
  applicationLocalStateUintLabel,
  applicationNameLabel,
  applicationStateLabel,
  enterAddressToViewLocalStateMessage,
  failedToLoadLocalStateMessage,
  invalidAddressForLocalStateMessage,
} from '../components/labels'
import { descriptionListAssertion } from '@/tests/assertions/description-list-assertion'
import { tableAssertion } from '@/tests/assertions/table-assertion'
import { TransactionsResponse, Transaction as IndexerTransaction } from '@algorandfoundation/algokit-utils/indexer-client'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { refreshButtonLabel } from '@/features/common/components/refresh-button'
import { algod, indexer } from '@/features/common/data/algo-client'
import { genesisHashAtom } from '@/features/blocks/data'
import { AppInterfaceEntity, dbConnectionAtom } from '@/features/common/data/indexed-db'
import { upsertAppInterface } from '@/features/app-interfaces/data'
import SampleSevenAppSpec from '@/tests/test-app-specs/sample-seven.arc32.json'
import { AppSpecStandard, Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { searchTransactionsMock } from '@/tests/setup/mocks'
import { Arc56Contract } from '@algorandfoundation/algokit-utils/abi'
import { AccountApplicationResponse } from '@algorandfoundation/algokit-utils/algod-client'
import Arc56TestAppSpecSampleOne from '@/tests/test-app-specs/arc56/sample-one.json'
import Arc56TestAppSpecSampleThree from '@/tests/test-app-specs/arc56/sample-three.json'
import { JotaiStore } from '@/features/common/data/types'
import { NO_RESULTS_TABLE_MESSAGE } from '@/features/common/constants'

vi.mock('@/features/common/data/algo-client', async () => {
  const original = await vi.importActual('@/features/common/data/algo-client')
  return {
    ...original,
    algod: {
      getApplicationById: vi.fn().mockResolvedValue({}),
      accountApplicationInformation: vi.fn().mockResolvedValue({}),
    },
    indexer: {
      lookupApplicationById: vi.fn().mockResolvedValue({}),
      searchForApplicationBoxes: vi.fn().mockResolvedValue({}),
      searchForTransactions: vi.fn().mockImplementation(() => searchTransactionsMock),
    },
  }
})

describe('application-page', () => {
  describe('when rendering an application using an invalid application Id', () => {
    it('should display invalid application Id message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ applicationId: 'invalid-id' }))

      return executeComponentTest(
        () => render(<ApplicationPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(applicationInvalidIdMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering an application with application Id that does not exist', () => {
    it('should display not found message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ applicationId: '123456' }))
      vi.mocked(algod.getApplicationById).mockRejectedValue(new HttpError('boom', 404))
      vi.mocked(indexer.lookupApplicationById).mockRejectedValue(new HttpError('boom', 404))

      return executeComponentTest(
        () => render(<ApplicationPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(applicationNotFoundMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering an application that failed to load', () => {
    it('should display failed to load message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ applicationId: '123456' }))
      vi.mocked(indexer.lookupApplicationById).mockRejectedValue({})

      return executeComponentTest(
        () => render(<ApplicationPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(applicationFailedToLoadMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering an application with state', () => {
    const applicationResult = applicationResultMother['mainnet-80441968']().build()
    let myStore: JotaiStore

    beforeAll(() => {
      myStore = createStore()
      myStore.set(genesisHashAtom, 'some-hash')
      myStore.set(applicationResultsAtom, new Map([[applicationResult.id, createReadOnlyAtomAndTimestamp(applicationResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ applicationId: applicationResult.id.toString() }))
      vi.mocked(indexer.searchForApplicationBoxes).mockImplementation(() =>
        Promise.resolve(
          new indexerModels.BoxesResponse({
            applicationId: 80441968,
            boxes: [
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAABhjNpJEU5krRanhldfCDWa2Rs8=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAAB3fFPhSWjPaBhjzsx3NbXvlBK4=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAACctz98iaZ1MeSEbj+XCnD5CCwQ=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAACh7tCy49kQrUL7ykRWDmayeLKk=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAAECfyDmi7C5tEjBUI9N80BEnnAk=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAAEKTl0iZ2Q9UxPJphTgwplTfk6U=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAAEO4cIhnhmQ0qdQDLoXi7q0+G7o=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAAEVLZkp/l5eUQJZ/QEYYy9yNtuc=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAAEkbM2/K1+8IrJ/jdkgEoF/O5k0=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAAFwILIUnvVR4R/Xe9jTEV2SzTck=',
              }),
            ],
            nextToken: 'b64:AAAAAAAAAAAAAAAAAFwILIUnvVR4R/Xe9jTEV2SzTck=',
          })
        )
      )
      vi.mocked(searchTransactionsMock.do).mockImplementation(() =>
        Promise.resolve(new TransactionsResponse({ currentRound: 123n, transactions: [], nextToken: '' }))
      )
    })

    it('should be rendered with the correct data', () => {
      return executeComponentTest(
        () => {
          return render(<ApplicationPage />, undefined, myStore)
        },
        async (component, user) => {
          const detailsCard = await component.findByLabelText(applicationDetailsLabel)
          descriptionListAssertion({
            container: detailsCard,
            items: [
              { term: applicationIdLabel, description: '80441968' },
              { term: applicationCreatorAccountLabel, description: '24YD4UNKUGVNGZ6QGXWIUPQ5L456FBH7LB5L6KFGQJ65YLQHXX4CQNPCZA' },
              { term: applicationAccountLabel, description: 'S3TLYVDRMR5VRKPACAYFXFLPNTYWQG37A6LPKERQ2DNABLTTGCXDUE2T3E' },
              { term: applicationGlobalStateByteLabel, description: '3' },
              { term: applicationLocalStateByteLabel, description: '0' },
              { term: applicationGlobalStateUintLabel, description: '12' },
              { term: applicationLocalStateUintLabel, description: '2' },
            ],
          })

          const applicationStateTabList = component.getByRole('tablist', { name: applicationStateLabel })
          expect(applicationStateTabList).toBeTruthy()
          // Only test the first 10 rows, should be enough
          const globalStateTab = await component.findByRole('tabpanel', {
            name: applicationGlobalStateLabel,
          })
          await tableAssertion({
            container: globalStateTab,
            rows: [
              { cells: ['Bids', 'Uint', '0'] },
              { cells: ['Creator', 'Bytes', '24YD4UNKUGVNGZ6QGXWIUPQ5L456FBH7LB5L6KFGQJ65YLQHXX4CQNPCZA'] },
              { cells: ['Dividend', 'Uint', '5'] },
              { cells: ['Escrow', 'Bytes', '24YD4UNKUGVNGZ6QGXWIUPQ5L456FBH7LB5L6KFGQJ65YLQHXX4CQNPCZA'] },
              { cells: ['FeesFirst', 'Uint', '250000'] },
              { cells: ['FeesSecond', 'Uint', '500000'] },
              { cells: ['Multiplier', 'Uint', '5'] },
              { cells: ['Pot', 'Uint', '0'] },
              { cells: ['Price', 'Uint', '1000000'] },
              { cells: ['RoundBegin', 'Uint', '1606905675'] },
            ],
          })

          await user.click(getByRole(applicationStateTabList, 'tab', { name: applicationLocalStateLabel }))
          const localStateTab = await component.findByRole('tabpanel', { name: applicationLocalStateLabel })
          await findByText(localStateTab, enterAddressToViewLocalStateMessage)

          await user.click(getByRole(applicationStateTabList, 'tab', { name: applicationBoxesLabel }))
          const boxesTab = await component.findByRole('tabpanel', { name: applicationBoxesLabel })
          await tableAssertion({
            container: boxesTab,
            rows: [
              { cells: ['AAAAAAAAAAAAAAAAABhjNpJEU5krRanhldfCDWa2Rs8='] },
              { cells: ['AAAAAAAAAAAAAAAAAB3fFPhSWjPaBhjzsx3NbXvlBK4='] },
              { cells: ['AAAAAAAAAAAAAAAAACctz98iaZ1MeSEbj+XCnD5CCwQ='] },
              { cells: ['AAAAAAAAAAAAAAAAACh7tCy49kQrUL7ykRWDmayeLKk='] },
              { cells: ['AAAAAAAAAAAAAAAAAECfyDmi7C5tEjBUI9N80BEnnAk='] },
              { cells: ['AAAAAAAAAAAAAAAAAEKTl0iZ2Q9UxPJphTgwplTfk6U='] },
              { cells: ['AAAAAAAAAAAAAAAAAEO4cIhnhmQ0qdQDLoXi7q0+G7o='] },
              { cells: ['AAAAAAAAAAAAAAAAAEVLZkp/l5eUQJZ/QEYYy9yNtuc='] },
              { cells: ['AAAAAAAAAAAAAAAAAEkbM2/K1+8IrJ/jdkgEoF/O5k0='] },
              { cells: ['AAAAAAAAAAAAAAAAAFwILIUnvVR4R/Xe9jTEV2SzTck='] },
            ],
          })
        }
      )
    })

    it('should render local state when account has state', () => {
      const addressWithLocalState = 'YJJBMRVNONUG52SHL7WA3P766CJUEBQVSKEYNSEDTS2YD5ETX2I64ISL74'
      vi.mocked(algod.accountApplicationInformation).mockResolvedValue({
        round: 1n,
        appLocalState: {
          id: applicationResult.id,
          schema: {
            numUint: 1,
            numByteSlice: 2,
          },
          keyValue: [
            {
              key: new Uint8Array(Buffer.from('YmFsYW5jZQ==', 'base64')),
              value: {
                type: 2,
                uint: 1150n,
                bytes: new Uint8Array(),
              },
            },
            {
              key: new Uint8Array(Buffer.from('bWVzc2FnZQ==', 'base64')),
              value: {
                type: 1,
                uint: 0n,
                bytes: new Uint8Array(Buffer.from('SGVsbG8gd29ybGQ=', 'base64')),
              },
            },
            {
              key: new Uint8Array(Buffer.from('aS5hcHBpZA==', 'base64')),
              value: {
                type: 1,
                uint: 0n,
                bytes: new Uint8Array(Buffer.from('AAAAADNlLm0=', 'base64')),
              },
            },
          ],
        },
        createdApp: undefined,
      } as unknown as AccountApplicationResponse)

      return executeComponentTest(
        () => {
          return render(<ApplicationPage />, undefined, myStore)
        },
        async (component, user) => {
          const applicationStateTabList = await component.findByRole('tablist', { name: applicationStateLabel })
          expect(applicationStateTabList).toBeTruthy()

          await user.click(getByRole(applicationStateTabList, 'tab', { name: applicationLocalStateLabel }))
          const localStateTab = await component.findByRole('tabpanel', { name: applicationLocalStateLabel })

          const addressInput = await findByRole(localStateTab, 'textbox', { name: 'local-state-address' })
          await user.type(addressInput, addressWithLocalState)

          await tableAssertion({
            container: localStateTab,
            rows: [
              { cells: ['balance', 'Uint', '1150'] },
              { cells: ['i.appid', 'Bytes', 'AAAAADNlLm0='] },
              { cells: ['message', 'Bytes', 'Hello world'] },
            ],
          })
        }
      )
    })

    it('should render no results message when account does not have local state', () => {
      vi.mocked(algod.accountApplicationInformation).mockImplementation(() => Promise.reject(new HttpError('boom', 404)))

      return executeComponentTest(
        () => {
          return render(<ApplicationPage />, undefined, myStore)
        },
        async (component, user) => {
          const applicationStateTabList = await component.findByRole('tablist', { name: applicationStateLabel })
          expect(applicationStateTabList).toBeTruthy()

          await user.click(getByRole(applicationStateTabList, 'tab', { name: applicationLocalStateLabel }))
          const localStateTab = await component.findByRole('tabpanel', { name: applicationLocalStateLabel })

          const addressInput = await findByRole(localStateTab, 'textbox', { name: 'local-state-address' })
          await user.type(addressInput, '24YD4UNKUGVNGZ6QGXWIUPQ5L456FBH7LB5L6KFGQJ65YLQHXX4CQNPCZA')

          await findByText(localStateTab, NO_RESULTS_TABLE_MESSAGE)
        }
      )
    })

    it('should display failure message when local state fails to load', () => {
      vi.mocked(algod.accountApplicationInformation).mockImplementation(() => Promise.reject(new Error('boom')))

      return executeComponentTest(
        () => {
          return render(<ApplicationPage />, undefined, myStore)
        },
        async (component, user) => {
          const applicationStateTabList = await component.findByRole('tablist', { name: applicationStateLabel })
          expect(applicationStateTabList).toBeTruthy()

          await user.click(getByRole(applicationStateTabList, 'tab', { name: applicationLocalStateLabel }))
          const localStateTab = await component.findByRole('tabpanel', { name: applicationLocalStateLabel })

          const addressInput = await findByRole(localStateTab, 'textbox', { name: 'local-state-address' })
          await user.type(addressInput, 'OMXLQTI5ZSMWTCIZA3O3YBW74BTCOI67SZTOEDHK3ZEDZ34Z3DEOQD4PW4')

          await findByText(localStateTab, failedToLoadLocalStateMessage)
        }
      )
    })

    it('should display invalid address message when viewing local state for an invalid address', () => {
      vi.mocked(algod.accountApplicationInformation).mockImplementation(() => Promise.reject(new Error('boom')))

      return executeComponentTest(
        () => {
          return render(<ApplicationPage />, undefined, myStore)
        },
        async (component, user) => {
          const applicationStateTabList = await component.findByRole('tablist', { name: applicationStateLabel })
          expect(applicationStateTabList).toBeTruthy()

          await user.click(getByRole(applicationStateTabList, 'tab', { name: applicationLocalStateLabel }))
          const localStateTab = await component.findByRole('tabpanel', { name: applicationLocalStateLabel })

          const addressInput = await findByRole(localStateTab, 'textbox', { name: 'local-state-address' })
          await user.type(addressInput, 'HELLO')

          await findByText(localStateTab, invalidAddressForLocalStateMessage)
        }
      )
    })
  })

  describe('when rendering an application that has app name following algokit standard', () => {
    const applicationResult = applicationResultMother['mainnet-1196727051']().build()
    const transactionResult = transactionResultMother['mainnet-XCXQW7J5G5QSPVU5JFYEELVIAAABPLZH2I36BMNVZLVHOA75MPAQ']().build()

    it('should be rendered with the correct app name', () => {
      const myStore = createStore()
      myStore.set(genesisHashAtom, 'some-hash')

      myStore.set(applicationResultsAtom, new Map([[applicationResult.id, createReadOnlyAtomAndTimestamp(applicationResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ applicationId: applicationResult.id.toString() }))
      vi.mocked(searchTransactionsMock.do).mockImplementation(() =>
        Promise.resolve(
          new TransactionsResponse({
            currentRound: 123n,
            transactions: [transactionResult] as IndexerTransaction[],
            nextToken: '',
          })
        )
      )

      return executeComponentTest(
        () => {
          return render(<ApplicationPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(async () => {
            const detailsCard = component.getByLabelText(applicationDetailsLabel)
            descriptionListAssertion({
              container: detailsCard,
              items: [
                { term: applicationIdLabel, description: '1196727051' },
                { term: applicationNameLabel, description: 'cryptoless-JIUK4YAO2GU7UX36JHH35KWI4AJ3PDEYSRQ75PCJJKR5UBX6RQ6Y5UZSJQ' },
              ],
            })
          })
        }
      )
    })
  })

  describe('when rendering an application that becomes stale', () => {
    const applicationResult = applicationResultMother['mainnet-80441968']().build()

    it('should be rendered with the refresh button', () => {
      const myStore = createStore()
      myStore.set(genesisHashAtom, 'some-hash')

      myStore.set(applicationResultsAtom, new Map([[applicationResult.id, createReadOnlyAtomAndTimestamp(applicationResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ applicationId: applicationResult.id.toString() }))
      vi.mocked(indexer.searchForApplicationBoxes).mockImplementation(() =>
        Promise.resolve(
          new indexerModels.BoxesResponse({
            applicationId: 80441968,
            boxes: [
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAABhjNpJEU5krRanhldfCDWa2Rs8=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAAB3fFPhSWjPaBhjzsx3NbXvlBK4=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAACctz98iaZ1MeSEbj+XCnD5CCwQ=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAACh7tCy49kQrUL7ykRWDmayeLKk=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAAECfyDmi7C5tEjBUI9N80BEnnAk=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAAEKTl0iZ2Q9UxPJphTgwplTfk6U=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAAEO4cIhnhmQ0qdQDLoXi7q0+G7o=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAAEVLZkp/l5eUQJZ/QEYYy9yNtuc=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAAEkbM2/K1+8IrJ/jdkgEoF/O5k0=',
              }),
              new modelsv2.BoxDescriptor({
                name: 'AAAAAAAAAAAAAAAAAFwILIUnvVR4R/Xe9jTEV2SzTck=',
              }),
            ],
            nextToken: 'b64:AAAAAAAAAAAAAAAAAFwILIUnvVR4R/Xe9jTEV2SzTck=',
          })
        )
      )
      vi.mocked(searchTransactionsMock.do).mockImplementation(() =>
        Promise.resolve(
          new TransactionsResponse({
            currentRound: 123n,
            transactions: [],
            nextToken: '',
          })
        )
      )

      return executeComponentTest(
        () => {
          return render(<ApplicationPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(async () => {
            const detailsCard = component.getByLabelText(applicationDetailsLabel)
            descriptionListAssertion({
              container: detailsCard,
              items: [{ term: applicationIdLabel, description: '80441968' }],
            })

            const refreshButton = component.queryByLabelText(refreshButtonLabel)
            expect(refreshButton).toBeFalsy()
          })

          // Simulate the application being evicted from the store, due to staleness
          myStore.set(applicationResultsAtom, new Map())

          await waitFor(async () => {
            const detailsCard = component.getByLabelText(applicationDetailsLabel)
            descriptionListAssertion({
              container: detailsCard,
              items: [{ term: applicationIdLabel, description: '80441968' }],
            })

            const refreshButton = component.getByLabelText(refreshButtonLabel)
            expect(refreshButton).toBeTruthy()
          })
        }
      )
    })
  })

  describe('when rendering an application that is associated with an appspec', () => {
    it('should be rendered with the correct data', async () => {
      const applicationResult = applicationResultMother['testnet-718348254']().build()
      vi.mocked(useParams).mockImplementation(() => ({ applicationId: applicationResult.id.toString() }))
      vi.mocked(searchTransactionsMock.do).mockImplementation(() =>
        Promise.resolve(
          new TransactionsResponse({
            currentRound: 123n,
            transactions: [],
            nextToken: '',
          })
        )
      )

      const myStore = createStore()
      myStore.set(genesisHashAtom, 'some-hash')
      myStore.set(applicationResultsAtom, new Map([[applicationResult.id, createReadOnlyAtomAndTimestamp(applicationResult)]]))

      const dbConnection = await myStore.get(dbConnectionAtom)
      await upsertAppInterface(dbConnection, {
        applicationId: applicationResult.id,
        name: 'test',
        appSpecVersions: [
          {
            standard: AppSpecStandard.ARC32,
            appSpec: SampleSevenAppSpec as unknown as Arc32AppSpec,
          },
        ],
        lastModified: createTimestamp(),
      } satisfies AppInterfaceEntity)

      return executeComponentTest(
        () => {
          return render(<ApplicationPage />, undefined, myStore)
        },
        async (component, user) => {
          const abiMethodsCard = await component.findByLabelText(applicationAbiMethodDefinitionsLabel)
          expect(abiMethodsCard).toBeTruthy()

          const echoStructAccordionTrigger = component.getByRole('button', { name: 'echo_struct' })
          await user.click(echoStructAccordionTrigger)

          const echoStructAccordionPanel = component.getByRole('region', { name: 'echo_struct' })
          expect(echoStructAccordionPanel).toBeTruthy()

          const argumentsDiv = within(echoStructAccordionPanel).getByText('Arguments').parentElement
          expect(argumentsDiv).toBeTruthy()

          const argument1Div = within(argumentsDiv!).getByText('Argument 1').parentElement
          descriptionListAssertion({
            container: argument1Div!,
            items: [
              { term: 'Name', description: 'inputUser' },
              { term: 'Type', description: 'UserStruct:name: stringid: uint64' },
            ],
          })

          const returnDiv = within(echoStructAccordionPanel).getByText('Return').parentElement
          expect(returnDiv).toBeTruthy()

          const returnTypeDiv = within(returnDiv!).getByText('Type').parentElement
          expect(returnTypeDiv).toBeTruthy()

          descriptionListAssertion({
            container: returnTypeDiv!,
            items: [{ term: 'Type', description: 'UserStruct:name: stringid: uint64' }],
          })
        }
      )
    })

    describe('when the application has global states and boxes', () => {
      it('should be rendered with the correct data', async () => {
        const applicationResult = applicationResultMother['localnet-3771']().build()
        vi.mocked(useParams).mockImplementation(() => ({ applicationId: applicationResult.id.toString() }))
        vi.mocked(indexer.searchForApplicationBoxes).mockImplementation(() =>
          Promise.resolve(
            new indexerModels.BoxesResponse({
              applicationId: 3771,
              boxes: [
                new modelsv2.BoxDescriptor({
                  name: 'Ym94S2V5',
                }),
                new modelsv2.BoxDescriptor({
                  name: 'cAAAAAAAAAABAAAAAAAAAAIAAAAAAAAABAAAAAAAAAAD',
                }),
              ],
              nextToken: 'b64:cAAAAAAAAAABAAAAAAAAAAIAAAAAAAAABAAAAAAAAAAD',
            })
          )
        )
        vi.mocked(searchTransactionsMock.do).mockImplementation(() =>
          Promise.resolve(
            new TransactionsResponse({
              currentRound: 123n,
              transactions: [],
              nextToken: '',
            })
          )
        )

        const myStore = createStore()
        myStore.set(genesisHashAtom, 'some-hash')
        myStore.set(applicationResultsAtom, new Map([[applicationResult.id, createReadOnlyAtomAndTimestamp(applicationResult)]]))

        const dbConnection = await myStore.get(dbConnectionAtom)
        await upsertAppInterface(dbConnection, {
          applicationId: applicationResult.id,
          name: 'test',
          appSpecVersions: [
            {
              standard: AppSpecStandard.ARC56,
              appSpec: Arc56TestAppSpecSampleOne as Arc56Contract,
            },
          ],
          lastModified: createTimestamp(),
        } satisfies AppInterfaceEntity)

        return executeComponentTest(
          () => {
            return render(<ApplicationPage />, undefined, myStore)
          },
          async (component, user) => {
            const applicationStateTabList = await component.findByRole('tablist', { name: applicationStateLabel })
            expect(applicationStateTabList).toBeTruthy()

            const globalStateTab = await component.findByRole('tabpanel', {
              name: applicationGlobalStateLabel,
            })
            await tableAssertion({
              container: globalStateTab,
              rows: [
                { cells: ['globalKey', 'TypeKeyValue"globalKey"', '1234'] },
                { cells: ['globalMap', 'TypeMap KeyAppSpec PrefixpValue"foo"', '{foo: 13, bar: 37}'] },
              ],
            })

            await user.click(getByRole(applicationStateTabList, 'tab', { name: applicationBoxesLabel }))
            const boxesTab = await component.findByRole('tabpanel', { name: applicationBoxesLabel })
            await tableAssertion({
              container: boxesTab,
              rows: [
                { cells: ['boxKey', 'TypeKeyValue"boxKey"', 'View'] },
                { cells: ['boxMap', 'TypeMap KeyAppSpec PrefixpValue{add: {a: 1, b: 2}, subtract: {a: 4, b: 3}}', 'View'] },
              ],
            })
          }
        )
      })
    })

    describe('when the application has global states and boxes without prefix', () => {
      it('should be rendered with the correct data', async () => {
        const applicationResult = applicationResultMother['localnet-5103']().build()
        vi.mocked(useParams).mockImplementation(() => ({ applicationId: applicationResult.id.toString() }))
        vi.mocked(indexer.searchForApplicationBoxes).mockImplementation(() =>
          Promise.resolve(
            new indexerModels.BoxesResponse({
              applicationId: 5103,
              boxes: [
                new modelsv2.BoxDescriptor({
                  name: 'AAAAAAAAAAEAAAAAAAAAAgAAAAAAAAAEAAAAAAAAAAM=',
                }),
              ],
              nextToken: '"b64:AAAAAAAAAAEAAAAAAAAAAgAAAAAAAAAEAAAAAAAAAAM=',
            })
          )
        )
        vi.mocked(searchTransactionsMock.do).mockImplementation(() =>
          Promise.resolve(
            new TransactionsResponse({
              currentRound: 123n,
              transactions: [],
              nextToken: '',
            })
          )
        )

        const myStore = createStore()
        myStore.set(genesisHashAtom, 'some-hash')
        myStore.set(applicationResultsAtom, new Map([[applicationResult.id, createReadOnlyAtomAndTimestamp(applicationResult)]]))

        const dbConnection = await myStore.get(dbConnectionAtom)
        await upsertAppInterface(dbConnection, {
          applicationId: applicationResult.id,
          name: 'test',
          appSpecVersions: [
            {
              standard: AppSpecStandard.ARC56,
              appSpec: Arc56TestAppSpecSampleThree as Arc56Contract,
            },
          ],
          lastModified: createTimestamp(),
        } satisfies AppInterfaceEntity)

        return executeComponentTest(
          () => {
            return render(<ApplicationPage />, undefined, myStore)
          },
          async (component, user) => {
            const applicationStateTabList = await component.findByRole('tablist', { name: applicationStateLabel })
            expect(applicationStateTabList).toBeTruthy()

            const globalStateTab = await component.findByRole('tabpanel', {
              name: applicationGlobalStateLabel,
            })
            await tableAssertion({
              container: globalStateTab,
              rows: [{ cells: ['globalMap', 'TypeMap KeyValue"foo"', '{foo: 13, bar: 37}'] }],
            })

            await user.click(getByRole(applicationStateTabList, 'tab', { name: applicationBoxesLabel }))
            const boxesTab = await component.findByRole('tabpanel', { name: applicationBoxesLabel })
            await tableAssertion({
              container: boxesTab,
              rows: [{ cells: ['boxMap', 'TypeMap KeyValue{add: {a: 1, b: 2}, subtract: {a: 4, b: 3}}', 'View'] }],
            })
          }
        )
      })
    })
  })
})
