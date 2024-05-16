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
import { indexer } from '@/features/common/data'
import { HttpError } from '@/tests/errors'
import { applicationResultMother } from '@/tests/object-mother/application-result'
import { atom, createStore } from 'jotai'
import { applicationResultsAtom } from '../data'
import {
  applicationAccountLabel,
  applicationBoxesLabel,
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
import { modelsv2, indexerModels } from 'algosdk'

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
      vi.mocked(indexer.searchForApplicationBoxes(0).nextToken('').limit(10).do).mockImplementation(() =>
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

            const boxesCard = component.getByLabelText(applicationBoxesLabel)
            tableAssertion({
              container: boxesCard,
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
          })
        }
      )
    })
  })
})
