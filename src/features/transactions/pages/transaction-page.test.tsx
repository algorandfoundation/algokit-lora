import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  TransactionPage,
  transactionFailedToLoadMessage,
  transactionInvalidIdMessage,
  transactionNotFoundMessage,
} from './transaction-page'
import { executeComponentTest } from '@/tests/test-component'
import { getByRole, render, waitFor } from '@/tests/testing-library'
import { useParams } from 'react-router-dom'
import { getByDescriptionTerm } from '@/tests/custom-queries/get-description'
import { createStore } from 'jotai'
import { transactionResultsAtom } from '../data'
import { lookupTransactionById } from '@algorandfoundation/algokit-utils'
import { HttpError } from '@/tests/errors'
import { logicsigLabel } from '../components/logicsig-details'
import { createReadOnlyAtomAndTimestamp, createTimestamp } from '@/features/common/data'
import {
  transactionVisualTableTabLabel,
  transactionDetailsLabel,
  transactionVisualGraphTabLabel,
} from '../components/transaction-view-tabs'
import { multisigSubsignersLabel, multisigThresholdLabel, multisigVersionLabel } from '../components/multisig-details'
import {
  parentTransactionIdLabel,
  transactionBlockLabel,
  transactionFeeLabel,
  transactionGroupLabel,
  transactionIdLabel,
  transactionRekeyToLabel,
  transactionTimestampLabel,
  transactionTypeLabel,
} from '../components/transaction-info'
import { arc2NoteTabLabel, base64NoteTabLabel, jsonNoteTabLabel, noteLabel, textNoteTabLabel } from '../components/transaction-note'
import { assetResultMother } from '@/tests/object-mother/asset-result'
import { algoAssetResult } from '@/features/assets/data'
import {
  assetLabel,
  transactionCloseRemainderAmountLabel as assetTransactionCloseRemainderAmountLabel,
  transactionCloseRemainderToLabel as assetTransactionCloseRemainderToLabel,
  transactionClawbackAddressLabel,
} from '../components/asset-transfer-transaction-info'
import { transactionCloseRemainderAmountLabel, transactionCloseRemainderToLabel } from '../components/payment-transaction-info'
import { descriptionListAssertion } from '@/tests/assertions/description-list-assertion'
import { tableAssertion } from '@/tests/assertions/table-assertion'
import {
  appCallTransactionDetailsLabel,
  foreignAccountsTabLabel,
  applicationArgsTabLabel,
  foreignApplicationsTabLabel,
  foreignAssetsTabLabel,
  globalStateDeltaTabLabel,
  onCompletionLabel,
  localStateDeltaTabLabel,
  decodedAbiMethodTabLabel,
} from '../components/app-call-transaction-info'
import { base64LogsTabLabel, logsLabel, textLogsTabLabel } from '../components/app-call-transaction-logs'
import { InnerTransactionPage } from './inner-transaction-page'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'
import {
  assetDecimalsLabel,
  assetDefaultFrozenLabel,
  assetManagerLabel,
  assetReserveLabel,
  assetTotalSupplyLabel,
  assetUnitLabel,
  assetUrlLabel,
} from '../components/asset-config-transaction-info'
import { assetFreezeAddressLabel, assetFreezeStatusLabel } from '../components/asset-freeze-transaction-info'
import {
  selectionParticipationKeyLabel,
  voteFirstValidLabel,
  voteKeyDilutionLabel,
  voteLastValidLabel,
  voteParticipationKeyLabel,
} from '../components/key-reg-transaction-info'
import { assetResultsAtom } from '@/features/assets/data'
import { base64ProgramTabLabel, tealProgramTabLabel } from '@/features/applications/components/application-program'
import { transactionAmountLabel } from '../components/transactions-table-columns'
import { transactionReceiverLabel, transactionSenderLabel } from '../components/labels'
import { applicationIdLabel } from '@/features/applications/components/labels'
import SampleFiveAppSpec from '@/tests/test-app-specs/sample-five.arc32.json'
import { AppSpecStandard, Arc32AppSpec, Arc4AppSpec } from '@/features/app-interfaces/data/types'
import { AppInterfaceEntity, dbConnectionAtom } from '@/features/common/data/indexed-db'
import { genesisHashAtom } from '@/features/blocks/data'
import { writeAppInterface } from '@/features/app-interfaces/data'
import { algod } from '@/features/common/data/algo-client'

vi.mock('@/features/common/data/algo-client', async () => {
  const original = await vi.importActual('@/features/common/data/algo-client')
  return {
    ...original,
    algod: {
      disassemble: vi.fn().mockReturnValue({
        do: vi.fn(),
      }),
    },
  }
})

describe('transaction-page', () => {
  describe('when rendering a transaction with an invalid id', () => {
    it('should display invalid id message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: 'invalid-id' }))

      return executeComponentTest(
        () => render(<TransactionPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(transactionInvalidIdMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering a transaction that does not exist', () => {
    it('should display not found message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: '8MK6WLKFBPC323ATSEKNEKUTQZ23TCCM75SJNSFAHEM65GYJ5AND' }))
      vi.mocked(lookupTransactionById).mockImplementation(() => Promise.reject(new HttpError('boom', 404)))

      return executeComponentTest(
        () => render(<TransactionPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(transactionNotFoundMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering a transaction that fails to load', () => {
    it('should display failed to load message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: '7MK6WLKFBPC323ATSEKNEKUTQZ23TCCM75SJNSFAHEM65GYJ5AND' }))
      vi.mocked(lookupTransactionById).mockImplementation(() => Promise.reject({}))

      return executeComponentTest(
        () => render(<TransactionPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(transactionFailedToLoadMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering a payment transaction', () => {
    const transaction = transactionResultMother
      .payment()
      .withId('FBORGSDC4ULLWHWZUMUFIYQLSDC26HGLTFD7EATQDY37FHCIYBBQ')
      ['withConfirmed-round'](36570178)
      ['withRound-time'](1709189521)
      .withSender('M3IAMWFYEIJWLWFIIOEDFOLGIVMEOB3F4I3CA4BIAHJENHUUSX63APOXXM')
      ['withPayment-transaction']({
        amount: 236070000,
        receiver: 'KIZLH4HUM5ZIB5RVP6DR2IGXB44TGJ6HZUZIAYZFZ63KWCAQB2EZGPU5BQ',
        'close-amount': 345071234,
        'close-remainder-to': 'AIZLH4HUM5ZIB5RVP6DR2IGXB44TGJ6HZUZIAYZFZ63KWCAQB2EZGPU5BQ',
      })
      .withFee(1000)
      .build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))

      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component, user) => {
          // waitFor the loading state to be finished
          await waitFor(() => {
            descriptionListAssertion({
              container: component.container,
              items: [
                { term: transactionIdLabel, description: transaction.id },
                { term: transactionTypeLabel, description: 'Payment' },
                { term: transactionTimestampLabel, description: 'Thu, 29 February 2024 06:52:01' },
                { term: transactionBlockLabel, description: '36570178' },
                { term: transactionFeeLabel, description: '0.001' },
                { term: transactionSenderLabel, description: transaction.sender },
                { term: transactionReceiverLabel, description: transaction['payment-transaction']!.receiver },
                { term: transactionAmountLabel, description: '236.07' },
                { term: transactionCloseRemainderToLabel, description: 'AIZLH4HUM5ZIB5RVP6DR2IGXB44TGJ6HZUZIAYZFZ63KWCAQB2EZGPU5BQ' },
                { term: transactionCloseRemainderAmountLabel, description: '345.071234' },
              ],
            })
          })

          expect(component.queryByText(transactionGroupLabel)).toBeNull()

          const viewTransactionTabList = component.getByRole('tablist', { name: transactionDetailsLabel })
          expect(viewTransactionTabList).toBeTruthy()
          expect(
            component.getByRole('tabpanel', { name: transactionVisualGraphTabLabel }).getAttribute('data-state'),
            'Visual tab should be active'
          ).toBe('active')

          // After click on the Table tab
          await user.click(getByRole(viewTransactionTabList, 'tab', { name: transactionVisualTableTabLabel }))
          const tableViewTab = component.getByRole('tabpanel', { name: transactionVisualTableTabLabel })
          await waitFor(() => expect(tableViewTab.getAttribute('data-state'), 'Table tab should be active').toBe('active'))

          tableAssertion({
            container: tableViewTab,
            rows: [
              {
                cells: ['', 'FBORGSD…', '', 'M3IA…OXXM', 'KIZL…U5BQ', 'Payment', '236.07'],
              },
            ],
          })
        }
      )
    })
  })

  describe('when rendering a multisig payment transaction', () => {
    const transaction = transactionResultMother.multisig().build()

    beforeEach(() => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))
    })

    it('should show the multisig information', () => {
      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() => {
            descriptionListAssertion({
              container: component.container,
              items: [
                {
                  term: multisigThresholdLabel,
                  description: '3',
                },
                {
                  term: multisigVersionLabel,
                  description: '1',
                },
                {
                  term: multisigSubsignersLabel,
                  description:
                    'QWEQQN7CGK3W5O7GV6L3TDBIAM6BD4A5B7L3LE2QKGMJ7DT2COFI6WBPGU4QUFAFCF4IOWJXS6QJBEOKMNT7FOMEACIDDJNIUC5YYCEBY2HA27ZYJ46QIY2D3V7M55ROTKZ6N5KDQQYN7BU6KHLPWSBFREIIEV3G7IUOS4ESEUHPM4',
                },
              ],
            })
          })
        }
      )
    })
  })

  describe('when rendering a logicsig payment transaction', () => {
    const transaction = transactionResultMother.logicsig().build()

    beforeEach(() => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))
    })

    it('should show 2 tabs with the logicsig base64 as default', () => {
      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() => {
            const logicsigTabList = component.getByRole('tablist', { name: logicsigLabel })
            expect(logicsigTabList).toBeTruthy()
            expect(logicsigTabList.children.length).toBe(2)
          })

          const base64Tab = component.getByRole('tabpanel', { name: base64ProgramTabLabel })
          expect(base64Tab.getAttribute('data-state'), 'Base64 tab should be active').toBe('active')
          expect(base64Tab.textContent).toBe(transaction.signature!.logicsig!.logic)
        }
      )
    })

    it('should show the logicsig teal when activated', () => {
      const teal = '\n#pragma version 8\nint 1\nreturn\n'
      vi.mocked(algod.disassemble('').do).mockImplementation(() => Promise.resolve({ result: teal }))

      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component, user) => {
          await waitFor(async () => {
            const logicsigTabList = component.getByRole('tablist', { name: logicsigLabel })
            expect(logicsigTabList).toBeTruthy()
            await user.click(getByRole(logicsigTabList, 'tab', { name: tealProgramTabLabel }))
          })
          const tealTab = component.getByRole('tabpanel', { name: tealProgramTabLabel })
          await waitFor(() => expect(tealTab.getAttribute('data-state'), 'Teal tab should be active').toBe('active'))
          expect(tealTab.textContent).toBe(teal)
        }
      )
    })
  })

  describe('when rendering a transaction with a note', () => {
    const transactionBuilder = transactionResultMother.payment()

    describe('and the note is text', () => {
      const note = 'Здравейте, world!'
      const base64Note = Buffer.from(note).toString('base64')
      const transaction = transactionBuilder.withNote(base64Note).build()
      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))

      beforeEach(() => {
        vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))
      })

      it('should show 2 tabs with the note base64 as default', () => {
        return executeComponentTest(
          () => {
            return render(<TransactionPage />, undefined, myStore)
          },
          async (component) => {
            await waitFor(() => {
              const noteTabList = component.getByRole('tablist', { name: noteLabel })
              expect(noteTabList).toBeTruthy()
              expect(noteTabList.children.length).toBe(2)
            })

            const base64Tab = component.getByRole('tabpanel', { name: base64NoteTabLabel })
            expect(base64Tab.getAttribute('data-state'), 'Base64 tab should be active').toBe('active')
            expect(base64Tab.textContent).toBe(base64Note)
          }
        )
      })

      it('should show the utf-8 text when activated', () => {
        return executeComponentTest(
          () => {
            return render(<TransactionPage />, undefined, myStore)
          },
          async (component, user) => {
            await waitFor(async () => {
              const noteTabList = component.getByRole('tablist', { name: noteLabel })
              expect(noteTabList).toBeTruthy()
              await user.click(getByRole(noteTabList, 'tab', { name: textNoteTabLabel }))
            })
            const textTab = component.getByRole('tabpanel', { name: textNoteTabLabel })
            await waitFor(() => expect(textTab.getAttribute('data-state'), 'UTF-8 tab should be active').toBe('active'))
            expect(textTab.textContent).toBe(note)
          }
        )
      })
    })

    describe('and the note is json', () => {
      const jsonNote = { hello: 'world' }
      const note = JSON.stringify(jsonNote)
      const base64Note = Buffer.from(note).toString('base64')
      const transaction = transactionBuilder.withNote(base64Note).build()
      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))

      beforeEach(() => {
        vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))
      })

      it('should show 3 tabs with the note json as default', () => {
        return executeComponentTest(
          () => {
            return render(<TransactionPage />, undefined, myStore)
          },
          async (component) => {
            await waitFor(() => {
              const noteTabList = component.getByRole('tablist', { name: noteLabel })
              expect(noteTabList).toBeTruthy()
              expect(noteTabList.children.length).toBe(3)
            })

            const jsonTab = component.getByRole('tabpanel', { name: jsonNoteTabLabel })
            expect(jsonTab.getAttribute('data-state'), 'JSON tab should be active').toBe('active')
            expect(jsonTab.textContent).toBe('{hello:"world"}')
          }
        )
      })

      it('should show the note base64 when activated', () => {
        return executeComponentTest(
          () => {
            return render(<TransactionPage />, undefined, myStore)
          },
          async (component, user) => {
            await waitFor(async () => {
              const noteTabList = component.getByRole('tablist', { name: noteLabel })
              expect(noteTabList).toBeTruthy()
              await user.click(getByRole(noteTabList, 'tab', { name: base64NoteTabLabel }))
            })
            const base64Tab = component.getByRole('tabpanel', { name: base64NoteTabLabel })
            await waitFor(() => expect(base64Tab.getAttribute('data-state'), 'Base64 tab should be active').toBe('active'))
            expect(base64Tab.textContent).toBe(base64Note)
          }
        )
      })

      it('should show the utf-8 text when activated', () => {
        return executeComponentTest(
          () => {
            return render(<TransactionPage />, undefined, myStore)
          },
          async (component, user) => {
            await waitFor(async () => {
              const noteTabList = component.getByRole('tablist', { name: noteLabel })
              expect(noteTabList).toBeTruthy()
              await user.click(getByRole(noteTabList, 'tab', { name: textNoteTabLabel }))
            })
            const textTab = component.getByRole('tabpanel', { name: textNoteTabLabel })
            await waitFor(() => expect(textTab.getAttribute('data-state'), 'UTF-8 tab should be active').toBe('active'))
            expect(textTab.textContent).toBe(note)
          }
        )
      })
    })

    describe('and the note is arc-2 formatted', () => {
      const note = 'algoCityTemp:j{"city":"Singapore","temp":35}'
      const base64Note = Buffer.from(note).toString('base64')
      const transaction = transactionBuilder.withNote(base64Note).build()
      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))

      beforeEach(() => {
        vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))
      })

      it('should show 3 tabs with the note arc-2 as default', () => {
        return executeComponentTest(
          () => {
            return render(<TransactionPage />, undefined, myStore)
          },
          async (component) => {
            await waitFor(() => {
              const noteTabList = component.getByRole('tablist', { name: noteLabel })
              expect(noteTabList).toBeTruthy()
              expect(noteTabList.children.length).toBe(3)
            })

            const arc2Tab = component.getByRole('tabpanel', { name: arc2NoteTabLabel })
            expect(arc2Tab.getAttribute('data-state'), 'ARC-2 tab should be active').toBe('active')
            expect(arc2Tab.textContent).toMatchInlineSnapshot(`
              "DApp NamealgoCityTempFormatJSON{city:"Singapore",temp:35}"
            `)
          }
        )
      })

      it('should show the note base64 when activated', () => {
        return executeComponentTest(
          () => {
            return render(<TransactionPage />, undefined, myStore)
          },
          async (component, user) => {
            await waitFor(async () => {
              const noteTabList = component.getByRole('tablist', { name: noteLabel })
              expect(noteTabList).toBeTruthy()
              await user.click(getByRole(noteTabList, 'tab', { name: base64NoteTabLabel }))
            })
            const base64Tab = component.getByRole('tabpanel', { name: base64NoteTabLabel })
            await waitFor(() => expect(base64Tab.getAttribute('data-state'), 'Base64 tab should be active').toBe('active'))
            expect(base64Tab.textContent).toBe(base64Note)
          }
        )
      })

      it('should show the utf-8 text when activated', () => {
        return executeComponentTest(
          () => {
            return render(<TransactionPage />, undefined, myStore)
          },
          async (component, user) => {
            await waitFor(async () => {
              const noteTabList = component.getByRole('tablist', { name: noteLabel })
              expect(noteTabList).toBeTruthy()
              await user.click(getByRole(noteTabList, 'tab', { name: textNoteTabLabel }))
            })
            const textTab = component.getByRole('tabpanel', { name: textNoteTabLabel })
            await waitFor(() => expect(textTab.getAttribute('data-state'), 'UTF-8 tab should be active').toBe('active'))
            expect(textTab.textContent).toBe(note)
          }
        )
      })
    })
  })

  describe('when rendering an asset transfer transaction', () => {
    const transaction = transactionResultMother['mainnet-V7GQPE5TDMB4BIW2GCTPCBMXYMCF3HQGLYOYHGWP256GQHN5QAXQ']().build()
    const asset = assetResultMother['mainnet-140479105']().build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))
      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))
      myStore.set(assetResultsAtom, new Map([[asset.index, createReadOnlyAtomAndTimestamp(asset)]]))

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component, user) => {
          // waitFor the loading state to be finished
          await waitFor(() => expect(getByDescriptionTerm(component.container, transactionIdLabel).textContent).toBeTruthy())

          descriptionListAssertion({
            container: component.container,
            items: [
              { term: transactionIdLabel, description: transaction.id },
              { term: transactionTypeLabel, description: 'Asset TransferOpt-out' },
              { term: transactionTimestampLabel, description: 'Thu, 20 July 2023 19:08:03' },
              { term: transactionBlockLabel, description: '30666726' },
              { term: transactionFeeLabel, description: '0.001' },
              { term: transactionSenderLabel, description: 'J2WKA2P622UGRYLEQJPTM3K62RLWOKWSIY32A7HUNJ7HKQCRJANHNBFLBQ' },
              { term: transactionReceiverLabel, description: 'LINTQTVHWUFZR677Z6GD3MTVWEXDX26Z2V7Q7QSD6NOQ6WOZTMSIMYCQE4' },
              { term: assetLabel, description: '140479105(Clyders)' },
              { term: transactionAmountLabel, description: '0CLY' },
              { term: assetTransactionCloseRemainderToLabel, description: 'LINTQTVHWUFZR677Z6GD3MTVWEXDX26Z2V7Q7QSD6NOQ6WOZTMSIMYCQE4' },
              { term: assetTransactionCloseRemainderAmountLabel, description: '0CLY' },
            ],
          })
          expect(component.queryByText(transactionGroupLabel)).toBeNull()

          const viewTransactionTabList = component.getByRole('tablist', { name: transactionDetailsLabel })
          expect(viewTransactionTabList).toBeTruthy()
          expect(
            component.getByRole('tabpanel', { name: transactionVisualGraphTabLabel }).getAttribute('data-state'),
            'Visual tab should be active'
          ).toBe('active')

          // After click on the Table tab
          await user.click(getByRole(viewTransactionTabList, 'tab', { name: transactionVisualTableTabLabel }))
          const tableViewTab = component.getByRole('tabpanel', { name: transactionVisualTableTabLabel })
          await waitFor(() => expect(tableViewTab.getAttribute('data-state'), 'Table tab should be active').toBe('active'))

          tableAssertion({
            container: tableViewTab,
            rows: [
              {
                cells: ['', 'V7GQPE5…', '', 'J2WK…FLBQ', 'LINT…CQE4', 'Asset Transfer', '0CLY'],
              },
            ],
          })
        }
      )
    })
  })

  describe('when rendering an asset opt-in transaction', () => {
    const transaction = transactionResultMother['mainnet-563MNGEL2OF4IBA7CFLIJNMBETT5QNKZURSLIONJBTJFALGYOAUA']().build()
    const asset = assetResultMother['mainnet-312769']().build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))
      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))
      myStore.set(assetResultsAtom, new Map([[asset.index, createReadOnlyAtomAndTimestamp(asset)]]))

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component) => {
          // waitFor the loading state to be finished
          await waitFor(() => expect(getByDescriptionTerm(component.container, transactionIdLabel).textContent).toBe(transaction.id))
          const transactionTypeDescription = getByDescriptionTerm(component.container, transactionTypeLabel).textContent
          expect(transactionTypeDescription).toContain('Asset Transfer')
          expect(transactionTypeDescription).toContain('Opt-in')
        }
      )
    })
  })

  describe('when rendering an asset opt-out transaction', () => {
    const transaction = transactionResultMother['testnet-DWVIXKZ2URUOKVZRBRJHMERSPIWTMLFFLLVKH5RATFGNPT7VVNIA']().build()
    const asset = assetResultMother['testnet-210971834']().build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))

      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))
      myStore.set(assetResultsAtom, new Map([[asset.index, createReadOnlyAtomAndTimestamp(asset)]]))

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component) => {
          // waitFor the loading state to be finished
          await waitFor(() => expect(getByDescriptionTerm(component.container, transactionIdLabel).textContent).toBe(transaction.id))
          const transactionTypeDescription = getByDescriptionTerm(component.container, transactionTypeLabel).textContent
          expect(transactionTypeDescription).toContain('Asset Transfer')
          expect(transactionTypeDescription).toContain('Opt-out')
        }
      )
    })
  })

  describe('when rendering an asset clawback transaction', () => {
    const transaction = transactionResultMother['testnet-VIXTUMAPT7NR4RB2WVOGMETW4QY43KIDA3HWDWWXS3UEDKGTEECQ']().build()
    const asset = assetResultMother['testnet-642327435']().build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))

      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))
      myStore.set(assetResultsAtom, new Map([[asset.index, createReadOnlyAtomAndTimestamp(asset)]]))

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component) => {
          // waitFor the loading state to be finished
          await waitFor(() => {
            descriptionListAssertion({
              container: component.container,
              items: [
                { term: transactionIdLabel, description: transaction.id },
                { term: transactionTypeLabel, description: 'Asset TransferClawback' },
                { term: transactionSenderLabel, description: 'ATJJRFAQVMD3YVX47HZLK2GRNKZLS3YDRLJ62JJPLUCZPDJE7QPQZDTVGY' },
                { term: transactionReceiverLabel, description: 'ATSGPNTPGMJ2U3GQRSEXA2OZGFPMKPO66NNPIKFD4LHETHYIYRIRIN6GJE' },
                { term: transactionClawbackAddressLabel, description: 'AT3QNHSO7VZ2CPEZGI4BG7M3TIUG7YE5KZXNAE55Z4QHHAGBEU6K2LCJUA' },
              ],
            })
          })
        }
      )
    })
  })

  describe('when rendering an app call transaction', () => {
    const transaction = transactionResultMother['mainnet-KMNBSQ4ZFX252G7S4VYR4ZDZ3RXIET5CNYQVJUO5OXXPMHAMJCCQ']().build()
    const asset = assetResultMother['mainnet-971381860']().build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))

      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))
      myStore.set(
        assetResultsAtom,
        new Map([
          [algoAssetResult.index, createReadOnlyAtomAndTimestamp(algoAssetResult)],
          [asset.index, createReadOnlyAtomAndTimestamp(asset)],
        ])
      )
      myStore.set(genesisHashAtom, 'some-hash')

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component, user) => {
          // waitFor the loading state to be finished
          await waitFor(() => {
            descriptionListAssertion({
              container: component.container,
              items: [
                { term: transactionIdLabel, description: transaction.id },
                { term: transactionTypeLabel, description: 'Application Call' },
                { term: transactionTimestampLabel, description: 'Fri, 01 March 2024 00:07:53' },
                { term: transactionBlockLabel, description: '36591812' },
                { term: transactionGroupLabel, description: 'Tjo3cLO5x5GeMwmJLuJCQ1YT2FHkmUpVlSLbxRQDJ30=' },
                { term: transactionFeeLabel, description: '0.005' },
                { term: transactionSenderLabel, description: 'W2IZ3EHDRW2IQNPC33CI2CXSLMFCFICVKQVWIYLJWXCTD765RW47ONNCEY' },
                { term: applicationIdLabel, description: '971368268' },
                { term: onCompletionLabel, description: 'NoOp' },
              ],
            })
          })

          const detailsTabList = component.getByRole('tablist', { name: appCallTransactionDetailsLabel })
          expect(detailsTabList).toBeTruthy()

          expect(component.getByRole('tabpanel', { name: applicationArgsTabLabel }).textContent).toMatch(
            '1.6r6CnQ==2.AAAAAAAAAAA=3.AA==4.AA==5.AQ==6.AQ=='
          )

          await user.click(getByRole(detailsTabList, 'tab', { name: foreignAccountsTabLabel }))
          expect(component.getByRole('tabpanel', { name: foreignAccountsTabLabel }).textContent).toMatch('')

          await user.click(getByRole(detailsTabList, 'tab', { name: foreignApplicationsTabLabel }))
          expect(component.getByRole('tabpanel', { name: foreignApplicationsTabLabel }).textContent).toMatch('971350278')

          await user.click(getByRole(detailsTabList, 'tab', { name: foreignAssetsTabLabel }))
          expect(component.getByRole('tabpanel', { name: foreignAssetsTabLabel }).textContent).toMatch('0971381860')

          await user.click(getByRole(detailsTabList, 'tab', { name: globalStateDeltaTabLabel }))
          const globalStateDeltaTab = component.getByRole('tabpanel', { name: globalStateDeltaTabLabel })
          tableAssertion({
            container: globalStateDeltaTab,
            rows: [
              {
                cells: ['i', 'Bytes', 'Set', 'AAONfqTGgAAAAAkYTnKgAAAca/UmNAAAAABZC8sUiKAAARg1PuJHngAAYtCCAWTGAAAAAGXhHFY='],
              },
              {
                cells: [
                  's',
                  'Bytes',
                  'Set',
                  'AADMouUTEAAAAMyi5RMQAABHDeTfggAAAAqoe+5TgAAABxr9SY0AAAAf+XPK+oAAABHDeTfggAAABxr9SY0AAAAAAQXS3+IfAAR2O9R9MEEAAAAABGJpIfE2cs7Vt0ol',
                ],
              },
              {
                cells: ['v', 'Bytes', 'Set', 'AAC15iD0gAAAAzKLlExAAABHDeTfggAAAAAoa8i0brcAApIbjWwBBgAAZ/7Fy4wR'],
              },
            ],
          })

          const viewTransactionTabList = component.getByRole('tablist', { name: transactionDetailsLabel })
          await user.click(getByRole(viewTransactionTabList, 'tab', { name: transactionVisualTableTabLabel }))
          const tableViewTab = component.getByRole('tabpanel', { name: transactionVisualTableTabLabel })

          tableAssertion({
            container: tableViewTab,
            rows: [
              { cells: ['', 'KMNBSQ4…', 'Tjo3cLO…', 'W2IZ…NCEY', '971368268', 'Application Call', ''] },
              { cells: ['', 'inner/1', '', '2ZPN…DJJ4', 'W2IZ…NCEY', 'Payment', '236.706032'] },
              { cells: ['', 'inner/2', '', '2ZPN…DJJ4', '971350278', 'Application Call', ''] },
            ],
          })
        }
      )
    })
  })

  describe('when rendering an inner transaction of an app call transaction', () => {
    const transaction = transactionResultMother['mainnet-INDQXWQXHF22SO45EZY7V6FFNI6WUD5FHRVDV6NCU6HD424BJGGA']().build()
    const assets = [
      assetResultMother['mainnet-31566704']().build(),
      assetResultMother['mainnet-386195940']().build(),
      assetResultMother['mainnet-408898501']().build(),
    ]

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id, '*': '2' }))

      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))
      myStore.set(
        assetResultsAtom,
        new Map([
          [algoAssetResult.index, createReadOnlyAtomAndTimestamp(algoAssetResult)],
          ...assets.map((a) => [a.index, createReadOnlyAtomAndTimestamp(a)] as const),
        ])
      )
      myStore.set(genesisHashAtom, 'some-hash')

      return executeComponentTest(
        () => {
          return render(<InnerTransactionPage />, undefined, myStore)
        },
        async (component, user) => {
          // waitFor the loading state to be finished
          await waitFor(() => {
            descriptionListAssertion({
              container: component.container,
              items: [
                { term: transactionIdLabel, description: 'INDQXWQXHF22SO45EZY7V6FFNI6WUD5FHRVDV6NCU6HD424BJGGA/inner/2' },
                { term: parentTransactionIdLabel, description: 'INDQXWQXHF22SO45EZY7V6FFNI6WUD5FHRVDV6NCU6HD424BJGGA' },
                { term: transactionTypeLabel, description: 'Application Call' },
                { term: transactionTimestampLabel, description: 'Fri, 01 March 2024 00:07:53' },
                { term: transactionBlockLabel, description: '36591812' },
                { term: transactionGroupLabel, description: 'aWpPwlog0oZYHQe9uDlwReKzIgb9HVKLv8Z4GX0wMO0=' },
                { term: transactionFeeLabel, description: '0.002' },
                { term: transactionSenderLabel, description: 'AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A' },
                { term: applicationIdLabel, description: '1002541853' },
                { term: onCompletionLabel, description: 'NoOp' },
              ],
            })
          })

          const detailsTabList = component.getByRole('tablist', { name: appCallTransactionDetailsLabel })
          expect(detailsTabList).toBeTruthy()

          expect(component.getByRole('tabpanel', { name: applicationArgsTabLabel }).textContent).toMatch(
            '1.c3dhcA==2.Zml4ZWQtaW5wdXQ=3.AAAAAAAAAAA='
          )

          await user.click(getByRole(detailsTabList, 'tab', { name: foreignAccountsTabLabel }))
          expect(component.getByRole('tabpanel', { name: foreignAccountsTabLabel }).textContent).toMatch(
            '2PIFZW53RHCSFSYMCFUBW4XOCXOMB7XOYQSQ6KGT3KVGJTL4HM6COZRNMM'
          )

          await user.click(getByRole(detailsTabList, 'tab', { name: foreignApplicationsTabLabel }))
          expect(component.getByRole('tabpanel', { name: foreignApplicationsTabLabel }).textContent).toMatch('')

          await user.click(getByRole(detailsTabList, 'tab', { name: foreignAssetsTabLabel }))
          expect(component.getByRole('tabpanel', { name: foreignAssetsTabLabel }).textContent).toMatch('31566704')

          await user.click(getByRole(detailsTabList, 'tab', { name: localStateDeltaTabLabel }))
          const localStateDeltaTab = component.getByRole('tabpanel', { name: localStateDeltaTabLabel })
          tableAssertion({
            container: localStateDeltaTab,
            rows: [
              {
                cells: ['2PIF…RNMM', 'asset_1_reserves', 'Uint', 'Set', '1624171900529'],
              },
              {
                cells: ['2PIF…RNMM', 'asset_2_protocol_fees', 'Uint', 'Set', '177107130743'],
              },
              {
                cells: ['2PIF…RNMM', 'asset_2_reserves', 'Uint', 'Set', '7646891725226'],
              },
            ],
          })

          const viewTransactionTabList = component.getByRole('tablist', { name: transactionDetailsLabel })
          await user.click(getByRole(viewTransactionTabList, 'tab', { name: transactionVisualTableTabLabel }))
          const tableViewTab = component.getByRole('tabpanel', { name: transactionVisualTableTabLabel })
          tableAssertion({
            container: tableViewTab,
            rows: [
              { cells: ['', 'inner/2', 'aWpPwlo…', 'AACC…EN4A', '1002541853', 'Application Call', ''] },
              { cells: ['', 'inner/2/1', '', '2PIF…RNMM', 'AACC…EN4A', 'Asset Transfer', '0.586582USDC'] },
            ],
          })

          const logTabList = component.getByRole('tablist', { name: logsLabel })
          const base64LogViewTab = component.getByRole('tabpanel', { name: base64LogsTabLabel })

          descriptionListAssertion({
            container: base64LogViewTab,
            items: [
              { term: '1.', description: 'aW5wdXRfYXNzZXRfaWQgJWkAAAAAAAAAAA==' },
              { term: '2.', description: 'aW5wdXRfYW1vdW50ICVpAAAAAAAqRH0=' },
              { term: '3.', description: 'c3dhcF9hbW91bnQgJWkAAAAAACokBw==' },
              { term: '4.', description: 'Y2hhbmdlICVpAAAAAAAAAAA=' },
              { term: '5.', description: 'b3V0cHV0X2Fzc2V0X2lkICVpAAAAAAHhq3A=' },
              { term: '6.', description: 'b3V0cHV0X2Ftb3VudCAlaQAAAAAACPNW' },
              { term: '7.', description: 'cG9vbGVyc19mZWVfYW1vdW50ICVpAAAAAAAAGw0=' },
              { term: '8.', description: 'cHJvdG9jb2xfZmVlX2Ftb3VudCAlaQAAAAAAAAVp' },
              { term: '9.', description: 'dG90YWxfZmVlX2Ftb3VudCAlaQAAAAAAACB2' },
            ],
          })

          await user.click(getByRole(logTabList, 'tab', { name: textLogsTabLabel }))
          const textLogViewTab = component.getByRole('tabpanel', { name: textLogsTabLabel })
          descriptionListAssertion({
            container: textLogViewTab,
            items: [
              { term: '1.', description: base64ToUtf8('aW5wdXRfYXNzZXRfaWQgJWkAAAAAAAAAAA==') },
              { term: '2.', description: base64ToUtf8('aW5wdXRfYW1vdW50ICVpAAAAAAAqRH0=') },
              { term: '3.', description: base64ToUtf8('c3dhcF9hbW91bnQgJWkAAAAAACokBw==') },
              { term: '4.', description: base64ToUtf8('Y2hhbmdlICVpAAAAAAAAAAA=') },
              { term: '5.', description: base64ToUtf8('b3V0cHV0X2Fzc2V0X2lkICVpAAAAAAHhq3A=') },
              { term: '6.', description: base64ToUtf8('b3V0cHV0X2Ftb3VudCAlaQAAAAAACPNW') },
              { term: '7.', description: base64ToUtf8('cG9vbGVyc19mZWVfYW1vdW50ICVpAAAAAAAAGw0=') },
              { term: '8.', description: base64ToUtf8('cHJvdG9jb2xfZmVlX2Ftb3VudCAlaQAAAAAAAAVp') },
              { term: '9.', description: base64ToUtf8('dG90YWxfZmVlX2Ftb3VudCAlaQAAAAAAACB2') },
            ],
          })
        }
      )
    })
  })

  describe('when rendering an nested inner transaction of an app call transaction', () => {
    const transaction = transactionResultMother['mainnet-INDQXWQXHF22SO45EZY7V6FFNI6WUD5FHRVDV6NCU6HD424BJGGA']().build()
    const assets = [
      assetResultMother['mainnet-31566704']().build(),
      assetResultMother['mainnet-386195940']().build(),
      assetResultMother['mainnet-408898501']().build(),
    ]

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id, '*': '2/1' }))
      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))
      myStore.set(
        assetResultsAtom,
        new Map([
          [algoAssetResult.index, createReadOnlyAtomAndTimestamp(algoAssetResult)],
          ...assets.map((a) => [a.index, createReadOnlyAtomAndTimestamp(a)] as const),
        ])
      )

      return executeComponentTest(
        () => {
          return render(<InnerTransactionPage />, undefined, myStore)
        },
        async (component) => {
          // waitFor the loading state to be finished
          await waitFor(() => {
            descriptionListAssertion({
              container: component.container,
              items: [
                { term: transactionIdLabel, description: 'INDQXWQXHF22SO45EZY7V6FFNI6WUD5FHRVDV6NCU6HD424BJGGA/inner/2/1' },
                { term: parentTransactionIdLabel, description: 'INDQXWQXHF22SO45EZY7V6FFNI6WUD5FHRVDV6NCU6HD424BJGGA/inner/2' },
              ],
            })
          })
        }
      )
    })
  })

  describe('when rendering an app call transaction that has no foreign assets but has an inner asset transfer transaction', () => {
    const asset = assetResultMother['mainnet-312769']().build()
    const innerAssetTransferTransaction = transactionResultMother.transfer(asset).build()
    const transaction = transactionResultMother.appCall()['withInner-txns']([innerAssetTransferTransaction]).build()

    it('should be rendered without error', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))
      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))
      myStore.set(
        assetResultsAtom,
        new Map([
          [algoAssetResult.index, createReadOnlyAtomAndTimestamp(algoAssetResult)],
          [asset.index, createReadOnlyAtomAndTimestamp(asset)],
        ])
      )

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() => {
            descriptionListAssertion({
              container: component.container,
              items: [{ term: transactionIdLabel, description: transaction.id }],
            })
          })
        }
      )
    })
  })

  describe('when rendering an asset config destroy transaction', () => {
    const transaction = transactionResultMother['mainnet-U4XH6AS5UUYQI4IZ3E5JSUEIU64Y3FGNYKLH26W4HRY7T6PK745A']().build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))

      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component) => {
          // waitFor the loading state to be finished
          await waitFor(() => {
            descriptionListAssertion({
              container: component.container,
              items: [
                { term: transactionIdLabel, description: transaction.id },
                { term: transactionTypeLabel, description: 'Asset ConfigDestroy' },
                { term: transactionTimestampLabel, description: 'Wed, 29 April 2020 06:52:54' },
                { term: transactionBlockLabel, description: '6354625' },
                { term: transactionFeeLabel, description: '0.001' },
                { term: transactionSenderLabel, description: 'MBX2M6J44LQ22L3FROYRBKUAG4FWENPSLPTI7EBR4ECQ2APDMI6XTENHWQ' },
                { term: assetLabel, description: '917559' },
              ],
            })
          })
        }
      )
    })
  })

  describe('when rendering an asset config creation transaction', () => {
    const transaction = transactionResultMother['mainnet-ZXQMOO6KBSG4LFJ5CSN3HEQVIL5A5FIF46VDAS6N24JWXOC3U3PQ']().build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))

      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component, user) => {
          // waitFor the loading state to be finished
          await waitFor(() => {
            descriptionListAssertion({
              container: component.container,
              items: [
                { term: transactionIdLabel, description: transaction.id },
                { term: transactionTypeLabel, description: 'Asset ConfigCreate' },
                { term: transactionTimestampLabel, description: 'Tue, 23 April 2024 02:42:13' },
                { term: transactionBlockLabel, description: '38185488' },
                { term: transactionFeeLabel, description: '0.001' },
                { term: transactionSenderLabel, description: 'EHYQCYHUC6CIWZLBX5TDTLVJ4SSVE4RRTMKFDCG4Z4Q7QSQ2XWIQPMKBPU' },
                { term: assetLabel, description: '1781083085(DHM: M5+ Quake us6000mt40)' },
                { term: assetUrlLabel, description: 'https://assets.datahistory.org/quake/us6000mt40.png#i' },
                { term: assetUnitLabel, description: 'QUAKE' },
                { term: assetTotalSupplyLabel, description: '1 QUAKE' },
                { term: assetDecimalsLabel, description: '0' },
                { term: assetManagerLabel, description: 'EHYQCYHUC6CIWZLBX5TDTLVJ4SSVE4RRTMKFDCG4Z4Q7QSQ2XWIQPMKBPU' },
                { term: assetReserveLabel, description: 'VHHSUDWVVP43DUTX5ILBU2C5MGTHOKL2KVM2WBHNJK4B5YTBRQGZ5SW6QQ' },
                { term: assetDefaultFrozenLabel, description: 'No' },
              ],
            })
          })

          const viewTransactionTabList = component.getByRole('tablist', { name: transactionDetailsLabel })
          expect(viewTransactionTabList).toBeTruthy()
          expect(
            component.getByRole('tabpanel', { name: transactionVisualGraphTabLabel }).getAttribute('data-state'),
            'Visual tab should be active'
          ).toBe('active')

          // After click on the Table tab
          await user.click(getByRole(viewTransactionTabList, 'tab', { name: transactionVisualTableTabLabel }))
          const tableViewTab = component.getByRole('tabpanel', { name: transactionVisualTableTabLabel })
          await waitFor(() => expect(tableViewTab.getAttribute('data-state'), 'Table tab should be active').toBe('active'))

          tableAssertion({
            container: tableViewTab,
            rows: [
              {
                cells: ['', 'ZXQMOO6…', '', 'EHYQ…KBPU', '1781083085', 'Asset Config', ''],
              },
            ],
          })
        }
      )
    })
  })

  describe('when rendering an asset config reconfigure transaction', () => {
    const transaction = transactionResultMother['mainnet-GAMRAG3KCG23U2HOELJF32OQAWAISLIFBB5RLDDDYHUSOZNYN7MQ']().build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))

      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component) => {
          // waitFor the loading state to be finished
          await waitFor(() => {
            descriptionListAssertion({
              container: component.container,
              items: [
                { term: transactionIdLabel, description: transaction.id },
                { term: transactionTypeLabel, description: 'Asset ConfigReconfigure' },
                { term: transactionTimestampLabel, description: 'Mon, 01 April 2024 18:05:37' },
              ],
            })
          })
        }
      )
    })
  })

  describe('when rendering an asset freeze transaction', () => {
    const transaction = transactionResultMother['mainnet-2XFGVOHMFYLAWBHOSIOI67PBT5LDRHBTD3VLX5EYBDTFNVKMCJIA']().build()
    const asset = assetResultMother['mainnet-1707148495']().build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))

      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))
      myStore.set(assetResultsAtom, new Map([[asset.index, createReadOnlyAtomAndTimestamp(asset)]]))

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component, user) => {
          // waitFor the loading state to be finished
          await waitFor(() => expect(getByDescriptionTerm(component.container, transactionIdLabel).textContent).toBeTruthy())

          descriptionListAssertion({
            container: component.container,
            items: [
              { term: transactionIdLabel, description: transaction.id },
              { term: transactionTypeLabel, description: 'Asset Freeze' },
              { term: transactionTimestampLabel, description: 'Sat, 30 March 2024 01:03:28' },
              { term: transactionBlockLabel, description: '37463564' },
              { term: transactionGroupLabel, description: 'xERjxVTlNb8jeHa16qmpxDMh4+dcDCokO69QnNESbFk=' },
              { term: transactionFeeLabel, description: '0.001' },
              { term: transactionSenderLabel, description: 'E4A6FVIHXSZ3F7QXRCOTYDDILVQYEBFH56HYDIIYX4SVXS2QX5GUTBVZHY' },
              { term: assetLabel, description: '1707148495(Verification Lofty #29297)' },
              { term: assetFreezeAddressLabel, description: 'ZJU3X2B2QN3BUBIJ64JZ565V363ANGBUDOLXAJHDXGIIMYK6WV3NSNCBQQ' },
              { term: assetFreezeStatusLabel, description: 'Frozen' },
            ],
          })

          const viewTransactionTabList = component.getByRole('tablist', { name: transactionDetailsLabel })
          expect(viewTransactionTabList).toBeTruthy()
          expect(
            component.getByRole('tabpanel', { name: transactionVisualGraphTabLabel }).getAttribute('data-state'),
            'Visual tab should be active'
          ).toBe('active')

          // After click on the Table tab
          await user.click(getByRole(viewTransactionTabList, 'tab', { name: transactionVisualTableTabLabel }))
          const tableViewTab = component.getByRole('tabpanel', { name: transactionVisualTableTabLabel })
          await waitFor(() => expect(tableViewTab.getAttribute('data-state'), 'Table tab should be active').toBe('active'))

          tableAssertion({
            container: tableViewTab,
            rows: [
              {
                cells: ['', '2XFGVOH…', 'xERjxVT…', 'E4A6…VZHY', 'ZJU3…CBQQ', 'Asset Freeze', ''],
              },
            ],
          })
        }
      )
    })
  })

  describe('when rendering a state proof transaction', () => {
    const transaction = transactionResultMother
      .stateProof()
      ['withRound-time'](1696316292)
      ['withConfirmed-round'](32563331)
      .withFee(0)
      .build()

    it('should be rendered correctly', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))

      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))
      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() => {
            descriptionListAssertion({
              container: component.container,
              items: [
                { term: transactionIdLabel, description: transaction.id },
                { term: transactionTypeLabel, description: 'State Proof' },
                { term: transactionTimestampLabel, description: 'Tue, 03 October 2023 06:58:12' },
                { term: transactionBlockLabel, description: '32563331' },
                { term: transactionFeeLabel, description: '0' },
              ],
            })
          })
        }
      )
    })
  })

  describe('when rendering a key registration transaction (online)', () => {
    const transaction = transactionResultMother['mainnet-VE767RE4HGQM7GFC7MUVY3J67KOR5TV34OBTDDEQTDET2UFM7KTQ']().build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))

      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() =>
            descriptionListAssertion({
              container: component.container,
              items: [
                { term: transactionIdLabel, description: transaction.id },
                { term: transactionTypeLabel, description: 'Key RegistrationOnlineMultisig' },
                { term: transactionTimestampLabel, description: 'Mon, 17 June 2019 20:53:10' },
                { term: transactionBlockLabel, description: '107358' },
                { term: transactionFeeLabel, description: '0.001' },
                { term: transactionSenderLabel, description: '65NE3RG7Q3IWZMFPKAHSGZV766M4HGN73QBWWF2RPT55X32LHYYIV2YLNI' },
                { term: voteParticipationKeyLabel, description: 'YlVE4fhZdVHS5ap0ltTyn6Oy3a2Xl9exzOLk4/fF3cY=' },
                { term: selectionParticipationKeyLabel, description: 'irHd9MGgb7ou2aDUHtgvpqA6lvhtgMCJgldKgP8bu6Q=' },
                { term: voteFirstValidLabel, description: '1000' },
                { term: voteLastValidLabel, description: '5180000' },
                { term: voteKeyDilutionLabel, description: '10000' },
              ],
            })
          )
        }
      )
    })
  })

  describe('when rendering a key registration transaction (offline)', () => {
    const transaction = transactionResultMother['mainnet-BABZ5DOKAN7IP6FJ5PZSP2NRQU5OFRPZ7WIS2A3DRXCWEMVEM3PQ']().build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))

      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component) => {
          await waitFor(() =>
            descriptionListAssertion({
              container: component.container,
              items: [
                { term: transactionIdLabel, description: transaction.id },
                { term: transactionTypeLabel, description: 'Key RegistrationOfflineMultisig' },
              ],
            })
          )
          expect(component.queryByText(selectionParticipationKeyLabel)).toBeNull()
          expect(component.queryByText(voteFirstValidLabel)).toBeNull()
          expect(component.queryByText(voteLastValidLabel)).toBeNull()
          expect(component.queryByText(voteKeyDilutionLabel)).toBeNull()
        }
      )
    })
  })
})

describe('when rendering a rekey transaction', () => {
  const transaction = transactionResultMother['testnet-24RAYAOGMJ45BL6A7RYQOKZNECCA3VFXQUAM5X64BEDBVFNLPIPQ']().build()

  it('should be rendered with the correct data', () => {
    vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))

    const myStore = createStore()
    myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))

    return executeComponentTest(
      () => {
        return render(<TransactionPage />, undefined, myStore)
      },
      async (component) => {
        await waitFor(() => {
          descriptionListAssertion({
            container: component.container,
            items: [
              { term: transactionIdLabel, description: transaction.id },
              { term: transactionTypeLabel, description: 'PaymentRekey' },
              { term: transactionRekeyToLabel, description: 'QUANSC2GTZQ7GL5CA42CMOYIX2LHJ2E7QD2ZDZKQJG2WAKGWOYBMNADHSA' },
            ],
          })
        })
      }
    )
  })
})

describe('when rendering an app call transaction with ARC-32 app spec loaded', () => {
  const transaction = transactionResultMother['testnet-6YD3MPUIGUKMJ3NOJ3ZPHNC3GVDOFCTHMV6ADPMOI2BC6K3ZEE6Q']().build()

  it('should be rendered with the correct data', async () => {
    vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))

    const myStore = createStore()
    myStore.set(genesisHashAtom, 'some-hash')
    myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))

    const applicationId = transaction['application-transaction']!['application-id']!
    const dbConnection = await myStore.get(dbConnectionAtom)
    await writeAppInterface(dbConnection, {
      applicationId: applicationId,
      name: 'test',
      appSpecVersions: [
        {
          standard: AppSpecStandard.ARC32,
          appSpec: SampleFiveAppSpec as unknown as Arc32AppSpec,
        },
      ],
      lastModified: createTimestamp(),
    } satisfies AppInterfaceEntity)

    return executeComponentTest(
      () => {
        return render(<TransactionPage />, undefined, myStore)
      },
      async (component) => {
        await waitFor(() => {
          const tabList = component.getByRole('tablist', { name: appCallTransactionDetailsLabel })
          expect(tabList).toBeTruthy()

          const decodedAbiMethodTab = component.getByRole('tabpanel', { name: decodedAbiMethodTabLabel })
          expect(decodedAbiMethodTab.getAttribute('data-state'), 'ABI Method tab should be active').toBe('active')

          expect(decodedAbiMethodTab.textContent).toBe(
            'echo_address(address: 25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE)Returns: 25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE'
          )
        })
      }
    )
  })
})

describe('when rendering an app call transaction with ARC-4 app spec loaded', () => {
  const transaction = transactionResultMother['testnet-6YD3MPUIGUKMJ3NOJ3ZPHNC3GVDOFCTHMV6ADPMOI2BC6K3ZEE6Q']().build()

  it('should be rendered with the correct data', async () => {
    vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))

    const myStore = createStore()
    myStore.set(genesisHashAtom, 'some-hash')
    myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))

    const applicationId = transaction['application-transaction']!['application-id']!
    const dbConnection = await myStore.get(dbConnectionAtom)
    await writeAppInterface(dbConnection, {
      applicationId: applicationId,
      name: 'test',
      appSpecVersions: [
        {
          standard: AppSpecStandard.ARC4,
          appSpec: SampleFiveAppSpec as unknown as Arc4AppSpec,
        },
      ],
      lastModified: createTimestamp(),
    } satisfies AppInterfaceEntity)

    return executeComponentTest(
      () => {
        return render(<TransactionPage />, undefined, myStore)
      },
      async (component) => {
        await waitFor(() => {
          const tabList = component.getByRole('tablist', { name: appCallTransactionDetailsLabel })
          expect(tabList).toBeTruthy()

          const decodedAbiMethodTab = component.getByRole('tabpanel', { name: decodedAbiMethodTabLabel })
          expect(decodedAbiMethodTab.getAttribute('data-state'), 'ABI Method tab should be active').toBe('active')

          expect(decodedAbiMethodTab.textContent).toBe(
            'echo_address(address: 25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE)Returns: 25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE'
          )
        })
      }
    )
  })
})
