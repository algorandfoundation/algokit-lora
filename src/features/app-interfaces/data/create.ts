import { AppSpecVersion } from '@/features/app-interfaces/data/types'
import { ApplicationId } from '@/features/applications/data/types.ts'
import { AppInterfaceEntity, DbConnection, dbConnectionAtom } from '@/features/common/data/indexed-db'
import { loadable, useAtomCallback } from 'jotai/utils'
import { useCallback } from 'react'
import { invariant } from '@/utils/invariant'
import { createTimestamp } from '@/features/common/data'
import { getAppInterfaces } from '@/features/app-interfaces/data'
import { assign, setup } from 'xstate'
import { Arc32AppSpec, Arc4AppSpec, CreateAppInterfaceContext, TemplateParam } from './types'
import { useMemo } from 'react'
import { atomWithMachine } from 'jotai-xstate'
import { atom, useAtom, useAtomValue } from 'jotai'

export type AppSpecDetails = {
  applicationId: ApplicationId
  name: string
} & AppSpecVersion

export const writeAppInterface = async (dbConnection: DbConnection, appInterface: AppInterfaceEntity) => {
  await dbConnection.put('app-interfaces', appInterface)
}

export const useCreateAppInterface = () => {
  return useAtomCallback(
    useCallback(async (get, _, appSpecDetails: AppSpecDetails) => {
      const { applicationId, name, ...appSpecVersion } = appSpecDetails
      invariant(
        appSpecVersion.roundFirstValid === undefined || appSpecVersion.roundFirstValid >= 0,
        'roundFirstValid must be greater than or equal to 0'
      )
      invariant(
        appSpecVersion.roundLastValid === undefined || appSpecVersion.roundLastValid >= 0,
        'roundLastValid must be greater than or equal to 0'
      )
      if (appSpecVersion.roundFirstValid !== undefined && appSpecVersion.roundLastValid !== undefined) {
        invariant(appSpecVersion.roundLastValid > appSpecVersion.roundFirstValid, 'roundFirstValid must be greater than roundLastValid')
      }

      const dbConnection = await get(dbConnectionAtom)
      const existingAppInterfaces = await getAppInterfaces(dbConnection)
      invariant(
        existingAppInterfaces.find((e) => e.applicationId === applicationId) === undefined,
        `Application ID '${applicationId}' is already associated with another app interface`
      )
      invariant(
        existingAppInterfaces.find((e) => e.name.toLowerCase() === name.toLowerCase()) === undefined,
        `App interface '${name}' already exists, please choose a different name`
      )

      await writeAppInterface(dbConnection, {
        applicationId: applicationId,
        name: name,
        appSpecVersions: [appSpecDetails],
        lastModified: createTimestamp(),
      })
    }, [])
  )
}

const useAppInterfacesAtom = () => {
  return useMemo(() => {
    return atom(async (get) => {
      const dbConnection = await get(dbConnectionAtom)
      return await getAppInterfaces(dbConnection)
    })
  }, [])
}

export const useLoadableAppInterfacesAtom = () => {
  const appInterfacesAtom = useAppInterfacesAtom()
  return useAtomValue(loadable(appInterfacesAtom))
}

const createMachine = () =>
  setup({
    types: {
      context: {} as CreateAppInterfaceContext,
      events: {} as
        | { type: 'fromAppIdSelected'; applicationId: ApplicationId }
        | { type: 'fromAppDeploymentSelected' }
        | { type: 'appSpecUploadCompleted'; file: File; appSpec: Arc32AppSpec | Arc4AppSpec }
        | { type: 'appSpecUploadCancelled' }
        | {
            type: 'detailsCompleted'
            name?: string
            roundFirstValid?: bigint
            roundLastValid?: bigint
            version?: string
            updatable?: boolean
            deletable?: boolean
            templateParams?: TemplateParam[]
          }
        | { type: 'detailsCancelled' }
        | {
            type: 'deploymentCompleted'
            applicationId?: ApplicationId
            roundFirstValid?: bigint
          }
        | { type: 'deploymentCancelled' }
        | { type: 'createCompleted' }
        | { type: 'createFailed' },
    },
  }).createMachine({
    id: 'createAppInterface',
    initial: 'createAppInterface',
    context: {},
    states: {
      createAppInterface: {
        id: 'createAppInterface',
        on: {
          fromAppIdSelected: {
            target: 'fromAppId',
            actions: assign({
              applicationId: ({ event }) => event.applicationId,
            }),
          },
          fromAppDeploymentSelected: {
            target: 'fromAppDeployment',
          },
        },
      },
      fromAppId: {
        initial: 'appSpec',
        states: {
          appSpec: {
            on: {
              appSpecUploadCompleted: {
                target: 'appDetails',
                actions: assign({
                  file: ({ event }) => event.file,
                  appSpec: ({ event }) => event.appSpec,
                }),
              },
              appSpecUploadCancelled: {
                target: '#createAppInterface',
                actions: assign({
                  file: () => undefined,
                  appSpec: () => undefined,
                  applicationId: () => undefined,
                }),
              },
            },
          },
          appDetails: {
            on: {
              detailsCompleted: {
                target: 'create',
                actions: assign({
                  name: ({ event }) => event.name,
                  roundFirstValid: ({ event }) => event.roundFirstValid,
                  roundLastValid: ({ event }) => event.roundLastValid,
                }),
              },
              detailsCancelled: {
                target: 'appSpec',
                actions: assign({
                  name: () => undefined,
                  roundFirstValid: () => undefined,
                  roundLastValid: () => undefined,
                }),
              },
            },
          },
          create: {
            on: {
              createCompleted: {
                target: '#finished',
              },
              createFailed: {
                target: 'appDetails',
              },
            },
          },
        },
      },
      fromAppDeployment: {
        initial: 'appSpec',
        states: {
          appSpec: {
            on: {
              appSpecUploadCompleted: {
                target: 'appDetails',
                actions: assign({
                  file: ({ event }) => event.file,
                  appSpec: ({ event }) => event.appSpec,
                }),
              },
              appSpecUploadCancelled: {
                target: '#createAppInterface',
                actions: assign({
                  file: () => undefined,
                  appSpec: () => undefined,
                }),
              },
            },
          },
          appDetails: {
            on: {
              detailsCompleted: {
                target: 'deployment',
                actions: assign({
                  name: ({ event }) => event.name,
                  version: ({ event }) => event.version,
                  updatable: ({ event }) => event.updatable,
                  deletable: ({ event }) => event.deletable,
                  templateParams: ({ event }) => event.templateParams,
                }),
              },
              detailsCancelled: {
                target: 'appSpec',
                actions: assign({
                  name: () => undefined,
                  version: () => undefined,
                  updatable: () => undefined,
                  deletable: () => undefined,
                  templateParams: () => undefined,
                }),
              },
            },
          },
          deployment: {
            on: {
              deploymentCompleted: {
                target: 'create',
                actions: assign({
                  applicationId: ({ event }) => event.applicationId,
                  roundFirstValid: ({ event }) => event.roundFirstValid,
                }),
              },
              deploymentCancelled: {
                target: 'appDetails',
                actions: assign({
                  applicationId: () => undefined,
                  roundFirstValid: () => undefined,
                }),
              },
            },
          },
          create: {
            on: {
              createCompleted: {
                target: '#finished',
              },
              createFailed: {
                target: 'deployment',
              },
            },
          },
        },
      },
      finished: {
        id: 'finished',
        type: 'final',
      },
    },
  })

export const useCreateAppInterfaceStateMachine = () => {
  const createAppInterfaceMachineAtom = useMemo(() => {
    return atomWithMachine(() => createMachine())
  }, [])
  return useAtom(createAppInterfaceMachineAtom)
}
