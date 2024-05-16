import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor } from '@/tests/testing-library'
import { useParams } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import {
  ApplicationPage,
  applicationFailedToLoadMessage,
  applicationInvalidIdMessage,
  applicationNotFoundMessage,
} from './application-page'
import { algod, indexer } from '@/features/common/data'
import { HttpError } from '@/tests/errors'
import { applicationResultMother } from '@/tests/object-mother/application-result'
import { atom, createStore } from 'jotai'
import { applicationResultsAtom } from '../data'
import {
  applicationAccountLabel,
  applicationCreatorAccountLabel,
  applicationDetailsLabel,
  applicationGlobalStateByteLabel,
  applicationGlobalStateLabel,
  applicationGlobalStateUintLabel,
  applicationIdLabel,
  applicationLocalStateByteLabel,
  applicationLocalStateUintLabel,
} from '../components/labels'
import { descriptionListAssertion } from '@/tests/assertions/description-list-assertion'
import { tableAssertion } from '@/tests/assertions/table-assertion'

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
      vi.mocked(indexer.lookupApplications(0).includeAll(true).do).mockImplementation(() => Promise.reject(new HttpError('boom', 404)))

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
      vi.mocked(indexer.lookupApplications(0).includeAll(true).do).mockImplementation(() => Promise.reject({}))

      return executeComponentTest(
        () => render(<ApplicationPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(applicationFailedToLoadMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering an application', () => {
    const applicationResult = applicationResultMother['mainner-80441968']().build()

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(applicationResultsAtom, new Map([[applicationResult.id, atom(applicationResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ applicationId: applicationResult.id.toString() }))
      const teal = '\n#pragma version 8\nint 1\nreturn\n'
      vi.mocked(algod.disassemble('').do).mockImplementation(() => Promise.resolve({ result: teal }))

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
                { term: applicationIdLabel, description: '80441968' },
                { term: applicationCreatorAccountLabel, description: '24YD4UNKUGVNGZ6QGXWIUPQ5L456FBH7LB5L6KFGQJ65YLQHXX4CQNPCZA' },
                { term: applicationAccountLabel, description: 'S3TLYVDRMR5VRKPACAYFXFLPNTYWQG37A6LPKERQ2DNABLTTGCXDUE2T3E' },
                { term: applicationGlobalStateByteLabel, description: '3' },
                { term: applicationLocalStateByteLabel, description: '0' },
                { term: applicationGlobalStateUintLabel, description: '12' },
                { term: applicationLocalStateUintLabel, description: '2' },
              ],
            })

            // Only test the first 10 rows, should be enough
            const globalStateCard = component.getByLabelText(applicationGlobalStateLabel)
            tableAssertion({
              container: globalStateCard,
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
          })
        }
      )
    })
  })
})
