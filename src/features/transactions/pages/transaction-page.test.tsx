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
import { transactionsAtom } from '../data'
import { lookupTransactionById } from '@algorandfoundation/algokit-utils'
import { HttpError } from '@/tests/errors'
import { base64LogicsigTabLabel, tealLogicsigTabLabel, logicsigLabel } from '../components/logicsig'
import { algod, indexer } from '@/features/common/data'
import {
  tableTransactionDetailsTabLabel,
  transactionDetailsLabel,
  visualTransactionDetailsTabLabel,
} from '../components/payment-transaction'
import { multisigSubsignersLabel, multisigThresholdLabel, multisigVersionLabel } from '../components/multisig'
import {
  transactionBlockLabel,
  transactionFeeLabel,
  transactionGroupLabel,
  transactionIdLabel,
  transactionTimestampLabel,
  transactionTypeLabel,
} from '../components/transaction-info'
import { arc2NoteTabLabel, base64NoteTabLabel, jsonNoteTabLabel, noteLabel, textNoteTabLabel } from '../components/transaction-note'
import { transactionAmountLabel, transactionReceiverLabel, transactionSenderLabel } from '../components/transaction-view-table'
import { assetResultMother } from '@/tests/object-mother/asset-result'
import { assetsAtom } from '@/features/assets/data'
import {
  assetLabel,
  transactionCloseRemainderAmountLabel as assetTransactionCloseRemainderAmountLabel,
  transactionCloseRemainderToLabel as assetTransactionCloseRemainderToLabel,
  transactionClawbackAddressLabel,
} from '../components/asset-transfer-transaction-info'
import { transactionCloseRemainderAmountLabel, transactionCloseRemainderToLabel } from '../components/payment-transaction-info'
import { descriptionListAssertion } from '@/tests/assertions/description-list-assertion'
import { tableAssertion } from '@/tests/assertions/table-assertion'

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
      myStore.set(transactionsAtom, new Map([[transaction.id, transaction]]))

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
            component.getByRole('tabpanel', { name: visualTransactionDetailsTabLabel }).getAttribute('data-state'),
            'Visual tab should be active'
          ).toBe('active')

          // After click on the Table tab
          await user.click(getByRole(viewTransactionTabList, 'tab', { name: tableTransactionDetailsTabLabel }))
          const tableViewTab = component.getByRole('tabpanel', { name: tableTransactionDetailsTabLabel })
          await waitFor(() => expect(tableViewTab.getAttribute('data-state'), 'Table tab should be active').toBe('active'))

          tableAssertion({
            container: tableViewTab,
            rows: [
              {
                cells: ['FBORGSD...', 'M3IA...OXXM', 'KIZL...U5BQ', 'Payment', '236.07'],
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
      myStore.set(transactionsAtom, new Map([[transaction.id, transaction]]))

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
      myStore.set(transactionsAtom, new Map([[transaction.id, transaction]]))

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

          const base64Tab = component.getByRole('tabpanel', { name: base64LogicsigTabLabel })
          expect(base64Tab.getAttribute('data-state'), 'Base64 tab should be active').toBe('active')
          expect(base64Tab.textContent).toBe(transaction.signature!.logicsig!.logic)
        }
      )
    })

    it('should show the logicsig teal when activated', () => {
      const teal = '\n#pragma version 8\nint 1\nreturn\n'
      vi.mocked(algod.disassemble('').do).mockImplementation(() => Promise.resolve({ result: teal }))

      const myStore = createStore()
      myStore.set(transactionsAtom, new Map([[transaction.id, transaction]]))

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component, user) => {
          await waitFor(async () => {
            const logicsigTabList = component.getByRole('tablist', { name: logicsigLabel })
            expect(logicsigTabList).toBeTruthy()
            await user.click(getByRole(logicsigTabList, 'tab', { name: tealLogicsigTabLabel }))
          })
          const tealTab = component.getByRole('tabpanel', { name: tealLogicsigTabLabel })
          await waitFor(() => expect(tealTab.getAttribute('data-state'), 'Teal tab should be active').toBe('active'))
          expect(tealTab.textContent).toBe(teal)
        }
      )
    })
  })

  describe('when rending a transaction with a note', () => {
    const transactionBuilder = transactionResultMother.payment()

    describe('and the note is text', () => {
      const note = 'Здравейте, world!'
      const base64Note = Buffer.from(note).toString('base64')
      const transaction = transactionBuilder.withNote(base64Note).build()
      const myStore = createStore()
      myStore.set(transactionsAtom, new Map([[transaction.id, transaction]]))

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
      myStore.set(transactionsAtom, new Map([[transaction.id, transaction]]))

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
            expect(jsonTab.textContent).toBe(JSON.stringify(jsonNote, null, 2))
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
      myStore.set(transactionsAtom, new Map([[transaction.id, transaction]]))

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
              "DApp NamealgoCityTempFormatJSON{
                "city": "Singapore",
                "temp": 35
              }"
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
      myStore.set(transactionsAtom, new Map([[transaction.id, transaction]]))
      myStore.set(assetsAtom, new Map([[asset.index, asset]]))

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
              { term: transactionTypeLabel, description: 'Asset TransferOpt-Out' },
              { term: transactionTimestampLabel, description: 'Thu, 20 July 2023 19:08:03' },
              { term: transactionBlockLabel, description: '30666726' },
              { term: transactionFeeLabel, description: '0.001' },
              { term: transactionSenderLabel, description: 'J2WKA2P622UGRYLEQJPTM3K62RLWOKWSIY32A7HUNJ7HKQCRJANHNBFLBQ' },
              { term: transactionReceiverLabel, description: 'LINTQTVHWUFZR677Z6GD3MTVWEXDX26Z2V7Q7QSD6NOQ6WOZTMSIMYCQE4' },
              { term: assetLabel, description: '140479105 (Clyders)' },
              { term: transactionAmountLabel, description: '0 CLY' },
              { term: assetTransactionCloseRemainderToLabel, description: 'LINTQTVHWUFZR677Z6GD3MTVWEXDX26Z2V7Q7QSD6NOQ6WOZTMSIMYCQE4' },
              { term: assetTransactionCloseRemainderAmountLabel, description: '0 CLY' },
            ],
          })
          expect(component.queryByText(transactionGroupLabel)).toBeNull()

          const viewTransactionTabList = component.getByRole('tablist', { name: transactionDetailsLabel })
          expect(viewTransactionTabList).toBeTruthy()
          expect(
            component.getByRole('tabpanel', { name: visualTransactionDetailsTabLabel }).getAttribute('data-state'),
            'Visual tab should be active'
          ).toBe('active')

          // After click on the Table tab
          await user.click(getByRole(viewTransactionTabList, 'tab', { name: tableTransactionDetailsTabLabel }))
          const tableViewTab = component.getByRole('tabpanel', { name: tableTransactionDetailsTabLabel })
          await waitFor(() => expect(tableViewTab.getAttribute('data-state'), 'Table tab should be active').toBe('active'))

          tableAssertion({
            container: tableViewTab,
            rows: [
              {
                cells: ['V7GQPE5...', 'J2WK...FLBQ', 'LINT...CQE4', 'Asset Transfer', '0 CLY'],
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
      myStore.set(transactionsAtom, new Map([[transaction.id, transaction]]))
      myStore.set(assetsAtom, new Map([[asset.index, asset]]))

      return executeComponentTest(
        () => {
          return render(<TransactionPage />, undefined, myStore)
        },
        async (component) => {
          // waitFor the loading state to be finished
          await waitFor(() => expect(getByDescriptionTerm(component.container, transactionIdLabel).textContent).toBe(transaction.id))
          const transactionTypeDescription = getByDescriptionTerm(component.container, transactionTypeLabel).textContent
          expect(transactionTypeDescription).toContain('Asset Transfer')
          expect(transactionTypeDescription).toContain('Opt-In')
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
      myStore.set(transactionsAtom, new Map([[transaction.id, transaction]]))
      myStore.set(assetsAtom, new Map([[asset.index, asset]]))

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

  describe('when rendering an asset transfer transaction for a deleted asset', () => {
    const transaction = transactionResultMother['mainnet-UFYPQDLWCVK3L5XVVHE7WBQWTW4YMHHKZSDIWXXV2AGCS646HTQA']().build()
    // const asset = assetResultMother['mainnet-140479105']().build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transaction.id }))
      vi.mocked(indexer.lookupAssetByID(0).do).mockImplementation(() => Promise.reject(new HttpError('boom', 404)))
      const myStore = createStore()
      myStore.set(transactionsAtom, new Map([[transaction.id, transaction]]))

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
                { term: transactionTypeLabel, description: 'Asset Transfer' },
                { term: transactionTimestampLabel, description: 'Wed, 17 April 2024 05:39:26' },
                { term: transactionBlockLabel, description: '38008738' },
                { term: transactionGroupLabel, description: 'XeNQmhxvtoWpue/7SAk6RNfuu/8Fp8tw8Nfn+HnIz00=' },
                { term: transactionFeeLabel, description: '0.001' },
                { term: transactionSenderLabel, description: 'QUESTA6XV2JZ2XAV3EK3GKBHYCJO57JWUX6L6ENHGNLR6UE3OPCUCT2WLI' },
                { term: transactionReceiverLabel, description: 'JQ76KXBOL3Z2EKRW43OPHOHKBZJQUULDAH33IIWDX2UWEYEMTKSX2PRS54' },
                { term: assetLabel, description: '1753701469 (DELETED)' },
                { term: transactionAmountLabel, description: '1 DELETED' },
              ],
            })
          })

          const viewTransactionTabList = component.getByRole('tablist', { name: transactionDetailsLabel })
          expect(viewTransactionTabList).toBeTruthy()
          expect(
            component.getByRole('tabpanel', { name: visualTransactionDetailsTabLabel }).getAttribute('data-state'),
            'Visual tab should be active'
          ).toBe('active')

          // After click on the Table tab
          await user.click(getByRole(viewTransactionTabList, 'tab', { name: tableTransactionDetailsTabLabel }))
          const tableViewTab = component.getByRole('tabpanel', { name: tableTransactionDetailsTabLabel })
          await waitFor(() => expect(tableViewTab.getAttribute('data-state'), 'Table tab should be active').toBe('active'))

          tableAssertion({
            container: tableViewTab,
            rows: [
              {
                cells: ['UFYPQDL...', 'QUES...2WLI', 'JQ76...RS54', 'Asset Transfer', '1 DELETED'],
              },
            ],
          })
        }
      )
    })
  })
})
