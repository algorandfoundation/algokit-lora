import { describe, expect, it, vi } from 'vitest'
import { upsertAppInterface } from '../data'
import { getTestStore } from '@/tests/utils/get-test-store'
import { AppInterfaceEntity, dbConnectionAtom } from '@/features/common/data/indexed-db'
import { AppSpecStandard, Arc32AppSpec } from '../data/types'
import AuctionAppSpecArc32 from '@/tests/test-app-specs/auction.arc32.json'
import { createTimestamp } from '@/features/common/data'
import { executeComponentTest } from '@/tests/test-component'
import { EditAppInterfacePage } from './edit-app-interface-page'
import { fireEvent, render, waitFor } from '@/tests/testing-library'
import { useParams } from 'react-router-dom'
import { getButton } from '@/tests/utils/get-button'

describe('edit-app-interface', () => {
  it('can edit an existing app spec', async () => {
    const myStore = getTestStore()
    const applicationId = 1234
    const dbConnection = await myStore.get(dbConnectionAtom)
    await upsertAppInterface(dbConnection, {
      applicationId: applicationId,
      name: 'test',
      appSpecVersions: [
        {
          standard: AppSpecStandard.ARC32,
          appSpec: AuctionAppSpecArc32 as unknown as Arc32AppSpec,
        },
      ],
      lastModified: createTimestamp(),
    } satisfies AppInterfaceEntity)

    vi.mocked(useParams).mockImplementation(() => ({ applicationId: applicationId.toString() }))

    await executeComponentTest(
      () => {
        return render(<EditAppInterfacePage />, undefined, myStore)
      },
      async (component, user) => {
        expect(await component.findByText('Auction')).toBeInTheDocument()

        const editButton = await getButton(component, 'Edit')
        await user.click(editButton)

        const round = '99999'
        const lastValidRound = await waitFor(() => {
          const lastValidRoundInput = component.getByLabelText('Last valid round')
          expect(lastValidRoundInput).toBeDefined()
          return lastValidRoundInput!
        })
        fireEvent.input(lastValidRound, {
          target: { value: round },
        })

        const saveButton = await getButton(component, 'Save')
        await user.click(saveButton)

        expect(await component.findByText(round)).toBeInTheDocument()
      }
    )
  })

  it('can add an app spec', async () => {
    const myStore = getTestStore()
    const applicationId = 1234
    const dbConnection = await myStore.get(dbConnectionAtom)
    await upsertAppInterface(dbConnection, {
      applicationId: applicationId,
      name: 'test',
      appSpecVersions: [
        {
          standard: AppSpecStandard.ARC32,
          appSpec: AuctionAppSpecArc32 as unknown as Arc32AppSpec,
        },
      ],
      lastModified: createTimestamp(),
    } satisfies AppInterfaceEntity)

    vi.mocked(useParams).mockImplementation(() => ({ applicationId: applicationId.toString() }))

    await executeComponentTest(
      () => {
        return render(<EditAppInterfacePage />, undefined, myStore)
      },
      async (component, user) => {
        expect(await component.findByText('Auction')).toBeInTheDocument()

        const addButton = await getButton(component, 'Add')
        await user.click(addButton)

        const round = '99999'
        const lastValidRound = await waitFor(() => {
          const lastValidRoundInput = component.getByLabelText('Last valid round')
          expect(lastValidRoundInput).toBeDefined()
          return lastValidRoundInput!
        })
        fireEvent.input(lastValidRound, {
          target: { value: round },
        })

        const appSpecFileInput = await component.findByLabelText(/JSON app spec file/)
        await user.upload(appSpecFileInput, new File([JSON.stringify(AuctionAppSpecArc32)], 'app.json', { type: 'application/json' }))

        const saveButton = await getButton(component, 'Save')
        await user.click(saveButton)

        expect(await component.findByText(round)).toBeInTheDocument()
      }
    )
  })

  it('can delete an app spec', async () => {
    const myStore = getTestStore()
    const applicationId = 1234
    const dbConnection = await myStore.get(dbConnectionAtom)
    await upsertAppInterface(dbConnection, {
      applicationId: applicationId,
      name: 'test',
      appSpecVersions: [
        {
          standard: AppSpecStandard.ARC32,
          appSpec: AuctionAppSpecArc32 as unknown as Arc32AppSpec,
        },
      ],
      lastModified: createTimestamp(),
    } satisfies AppInterfaceEntity)

    vi.mocked(useParams).mockImplementation(() => ({ applicationId: applicationId.toString() }))

    await executeComponentTest(
      () => {
        return render(<EditAppInterfacePage />, undefined, myStore)
      },
      async (component, user) => {
        expect(await component.findByText('Auction')).toBeInTheDocument()

        const deleteButton = await getButton(component, 'Delete')
        await user.click(deleteButton)

        const confirmButton = await getButton(component, 'Confirm')
        await user.click(confirmButton)

        expect(await component.findByText('No results.')).toBeInTheDocument()
      }
    )
  })
})
