import { assign, setup } from 'xstate'
import { Arc32AppSpec, Arc4AppSpec } from './types'
import { ApplicationId } from '@/features/applications/data/types'
import { useMemo } from 'react'
import { atomWithMachine } from 'jotai-xstate'
import { useAtom } from 'jotai'

/*
createAppInterface
  fromAppId
    appSpec
      appSpecCancelled
      appSpecCompleted
    details (AppIdDetails)
      detailsCancelled
      detailsCompleted
  fromAppDeployment
    appSpec
      appSpecCancelled
      appSpecCompleted
    details (AppDeploymentDetails)
      detailsCancelled
      detailsCompleted
    deploy
*/

// TODO: NC - Move this
// TODO: NC - Should we construct this type to be a bit friendlier to use in context?
type CreateAppInterfaceContext = {
  applicationId?: ApplicationId
  file?: File
  appSpec?: Arc32AppSpec | Arc4AppSpec
  name?: string
  version?: string
  roundFirstValid?: number
  roundLastValid?: number
  updatable?: boolean
  deletable?: boolean
  templateParams?: Record<string, string | number | Uint8Array>
}

// TODO: NC - Do we need to remove state as we navigate backwards?
// TODO: NC - We can potentially just implement a cancelled event

const createMachine = () =>
  setup({
    types: {
      context: {} as CreateAppInterfaceContext,
      events: {} as
        | { type: 'fromAppIdSelected' }
        | { type: 'fromAppDeploymentSelected' }
        | { type: 'appSpecUploadCompleted'; file: File; appSpec: Arc32AppSpec | Arc4AppSpec }
        | { type: 'appSpecUploadCancelled' }
        | {
            type: 'detailsCompleted'
            name?: string
            roundFirstValid?: number
            roundLastValid?: number
            applicationId?: ApplicationId
            version?: string
            updatable?: boolean
            deletable?: boolean
            templateParams?: Record<string, string | number | Uint8Array>
          }
        | { type: 'detailsCancelled' }
        | {
            type: 'deploymentCompleted'
            applicationId?: ApplicationId
          }
        | { type: 'deploymentCancelled' },
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
                }),
              },
            },
          },
          appDetails: {
            on: {
              detailsCompleted: {
                target: '#finished',
                actions: assign({
                  name: ({ event }) => event.name,
                  applicationId: ({ event }) => event.applicationId,
                  roundFirstValid: ({ event }) => event.roundFirstValid,
                  roundLastValid: ({ event }) => event.roundLastValid,
                }),
              },
              detailsCancelled: {
                target: 'appSpec',
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
                target: '#finished',
                actions: assign({
                  applicationId: ({ event }) => event.applicationId,
                }),
              },
              deploymentCancelled: {
                target: 'appDetails',
                actions: assign({
                  applicationId: () => undefined,
                }),
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
