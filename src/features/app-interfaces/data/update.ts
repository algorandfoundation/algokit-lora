import { AppInterfaceEntity, dbConnectionAtom } from '@/features/common/data/indexed-db'
import { ApplicationId } from '@/features/applications/data/types'
import { useAtomCallback } from 'jotai/utils'
import { useCallback, useMemo } from 'react'
import { upsertAppInterface } from './create'
import { AppSpec, AppSpecVersion, TemplateParam, UpdateAppInterfaceContext } from './types'
import { invariant } from '@/utils/invariant'
import { getAppInterfaces } from './read'
import { createTimestamp } from '@/features/common/data'
import { useAtom } from 'jotai'
import { atomWithMachine } from 'jotai-xstate'
import { setup, assign } from 'xstate'

export const useAddAppSpecVersion = () => {
  return useAtomCallback(
    useCallback(async (get, _, applicationId: ApplicationId, appSpecVersion: AppSpecVersion) => {
      invariant(
        appSpecVersion.roundFirstValid === undefined || appSpecVersion.roundFirstValid >= 0,
        'Round first valid must be greater than or equal to 0'
      )
      invariant(
        appSpecVersion.roundLastValid === undefined || appSpecVersion.roundLastValid >= 0,
        'Round last valid must be greater than or equal to 0'
      )
      if (appSpecVersion.roundFirstValid !== undefined && appSpecVersion.roundLastValid !== undefined) {
        invariant(
          appSpecVersion.roundLastValid >= appSpecVersion.roundFirstValid,
          'Round last valid must be greater than or equal to round first valid'
        )
      }

      const dbConnection = await get(dbConnectionAtom)
      const existingAppInterfaces = await getAppInterfaces(dbConnection)
      const existingAppInterface = existingAppInterfaces.find((e) => e.applicationId === applicationId)

      invariant(existingAppInterface, `Application ID '${applicationId}' does not have an app interface`)

      await upsertAppInterface(dbConnection, {
        ...existingAppInterface,
        appSpecVersions: [...existingAppInterface.appSpecVersions, appSpecVersion],
        lastModified: createTimestamp(),
      })
    }, [])
  )
}

export const useUpdateAppSpecVersion = () => {
  return useAtomCallback(
    useCallback(async (get, _, applicationId: ApplicationId, appSpecVersionIndex: number, appSpecVersion: AppSpecVersion) => {
      invariant(
        appSpecVersion.roundFirstValid === undefined || appSpecVersion.roundFirstValid >= 0,
        'Round first valid must be greater than or equal to 0'
      )
      invariant(
        appSpecVersion.roundLastValid === undefined || appSpecVersion.roundLastValid >= 0,
        'Round last valid must be greater than or equal to 0'
      )
      if (appSpecVersion.roundFirstValid !== undefined && appSpecVersion.roundLastValid !== undefined) {
        invariant(
          appSpecVersion.roundLastValid >= appSpecVersion.roundFirstValid,
          'Round last valid must be greater than or equal to round first valid'
        )
      }

      const dbConnection = await get(dbConnectionAtom)
      const existingAppInterfaces = await getAppInterfaces(dbConnection)
      const existingAppInterface = existingAppInterfaces.find((e) => e.applicationId === applicationId)

      invariant(existingAppInterface, `Application ID '${applicationId}' does not have an app interface`)

      existingAppInterface.appSpecVersions[appSpecVersionIndex] = appSpecVersion

      await upsertAppInterface(dbConnection, {
        ...existingAppInterface,
        lastModified: createTimestamp(),
      })
    }, [])
  )
}

export const useDeleteAppSpec = () => {
  return useAtomCallback(
    useCallback(async (get, _, applicationId: ApplicationId, appSpecVersionIndex: number) => {
      const dbConnection = await get(dbConnectionAtom)
      const existingAppInterfaces = await getAppInterfaces(dbConnection)
      const existingAppInterface = existingAppInterfaces.find((e) => e.applicationId === applicationId)

      invariant(existingAppInterface, `Application ID '${applicationId}' does not have an app interface`)

      existingAppInterface.appSpecVersions.splice(appSpecVersionIndex, 1)

      await upsertAppInterface(dbConnection, {
        ...existingAppInterface,
        lastModified: createTimestamp(),
      })
    }, [])
  )
}

const createMachine = (appInterface: AppInterfaceEntity) =>
  setup({
    types: {
      context: {} as UpdateAppInterfaceContext,
      events: {} as
        | { type: 'fromAppSpecFileSelected' }
        | { type: 'fromAppDeploymentSelected' }
        | { type: 'appSpecUploadCompleted'; file: File; appSpec: AppSpec }
        | { type: 'appSpecUploadCancelled' }
        | {
            type: 'appSpecFormCompleted'
            file: File
            appSpec: AppSpec
            roundFirstValid?: bigint
            roundLastValid?: bigint
          }
        | {
            type: 'detailsCompleted'
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
    id: 'updateAppInterface',
    initial: 'updateAppInterface',
    context: {
      applicationId: appInterface.applicationId,
      name: appInterface.name,
    },
    states: {
      updateAppInterface: {
        id: 'updateAppInterface',
        on: {
          fromAppSpecFileSelected: {
            target: 'fromAppSpecFile',
          },
          fromAppDeploymentSelected: {
            target: 'fromAppDeployment',
          },
        },
      },
      fromAppSpecFile: {
        id: 'fromAppSpecFile',
        on: {
          createCompleted: {
            // TODO: do we need to assign anything here?
            target: '#finished',
          },
          createFailed: {
            target: 'fromAppSpecFile',
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
                target: '#updateAppInterface',
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
                  version: ({ event }) => event.version, // TODO: check if the version is newer?
                  updatable: ({ event }) => event.updatable,
                  deletable: ({ event }) => event.deletable,
                  templateParams: ({ event }) => event.templateParams,
                }),
              },
              detailsCancelled: {
                target: 'appSpec',
                actions: assign({
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
                  roundFirstValid: ({ event }) => event.roundFirstValid,
                }),
              },
              deploymentCancelled: {
                target: 'appDetails',
                actions: assign({
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

export const useUpdateAppInterfaceStateMachine = (appInterface: AppInterfaceEntity) => {
  const updateAppInterfaceMachineAtom = useMemo(() => {
    return atomWithMachine(() => createMachine(appInterface))
  }, [appInterface])
  return useAtom(updateAppInterfaceMachineAtom)
}
