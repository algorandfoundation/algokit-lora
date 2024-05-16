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

describe('application-page', () => {
  describe('when rending an application using an invalid application Id', () => {
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

  describe('when rending an application with application Id that does not exist', () => {
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

  describe('when rending an application that failed to load', () => {
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
})
