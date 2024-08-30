import { assign, setup } from 'xstate'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { ApplicationId } from '@/features/applications/data/types.ts'
import { useAtom } from 'jotai'
import { atomWithMachine } from 'jotai-xstate'
import { AppInterfaceEntity, DbConnection, dbConnectionAtom } from '@/features/common/data/indexed-db'
import { useAtomCallback } from 'jotai/utils'
import { useCallback } from 'react'
import { invariant } from '@/utils/invariant'
import { createTimestamp } from '@/features/common/data'
import { getAppInterfaces } from '@/features/app-interfaces/data/index'

export const writeAppInterface = async (dbConnection: DbConnection, appInterface: AppInterfaceEntity) => {
  await dbConnection.put('app-interfaces', appInterface)
}

export const useCreateAppInterface = () => {
  return useAtomCallback(
    useCallback(
      async (
        get,
        _,
        {
          applicationId,
          name,
          standard,
          roundFirstValid,
          roundLastValid,
          appSpec,
        }: {
          applicationId: ApplicationId
          name: string
          standard: 'ARC-32'
          appSpec: Arc32AppSpec
          roundFirstValid?: number
          roundLastValid?: number
        }
      ) => {
        invariant(roundFirstValid === undefined || roundFirstValid >= 0, 'roundFirstValid must be greater than or equal to 0')
        invariant(roundLastValid === undefined || roundLastValid >= 0, 'roundLastValid must be greater than or equal to 0')
        if (roundFirstValid !== undefined && roundLastValid !== undefined) {
          invariant(roundLastValid > roundFirstValid, 'roundFirstValid must be greater than roundLastValid')
        }

        const dbConnection = await get(dbConnectionAtom)
        const existingAppInterfaces = await getAppInterfaces(dbConnection)
        invariant(
          existingAppInterfaces.find((e) => e.applicationId === applicationId) === undefined,
          `Application ID "${applicationId}" is already associated with another app interface`
        )
        invariant(
          existingAppInterfaces.find((e) => e.name.toLowerCase() === name.toLowerCase()) === undefined,
          `App interface "${name}" already exists, please choose a different name`
        )

        await writeAppInterface(dbConnection, {
          applicationId: applicationId,
          name: name,
          appSpecVersions: [
            {
              standard,
              roundFirstValid,
              roundLastValid,
              appSpec,
            },
          ],
          lastModified: createTimestamp(),
        })
      },
      []
    )
  )
}

const createMachine = () =>
  setup({
    types: {
      context: {} as {
        file?: File
        appSpec?: Arc32AppSpec
        name?: string
        applicationId?: ApplicationId
        roundFirstValid?: number
        roundLastValid?: number
      },
      events: {} as
        | { type: 'fileSelected'; file: File; appSpec: Arc32AppSpec }
        | { type: 'deployAppRequested'; name?: string; applicationId?: ApplicationId }
        | { type: 'deployAppCompleted'; applicationId: ApplicationId }
        | { type: 'deployAppCancelled' },
    },
  }).createMachine({
    id: 'createAppInterface',
    initial: 'selectAppSpec',
    context: {},
    states: {
      selectAppSpec: {
        on: {
          fileSelected: {
            target: 'createAppInterface',
            actions: assign({
              file: ({ event }) => event.file,
              appSpec: ({ event }) => event.appSpec,
            }),
          },
        },
      },
      createAppInterface: {
        on: {
          deployAppRequested: {
            target: 'deployApp',
            actions: assign({
              name: ({ context, event }) => (event.name != null ? event.name : context.name),
              applicationId: ({ context, event }) => (event.applicationId != null ? event.applicationId : context.applicationId),
            }),
          },
        },
      },
      deployApp: {
        on: {
          deployAppCompleted: {
            target: 'createAppInterface',
            actions: assign({ applicationId: ({ event }) => event.applicationId }),
          },
          deployAppCancelled: {
            target: 'createAppInterface',
          },
        },
      },
    },
  })

const createAppInterfaceMachineAtom = atomWithMachine(() => createMachine())

export const useCreateAppInterfaceStateMachine = () => {
  return useAtom(createAppInterfaceMachineAtom)
}
