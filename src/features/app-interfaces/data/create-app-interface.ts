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
type CreateAppInterfaceContext = {
  applicationId?: ApplicationId
  file?: File
  appSpec?: Arc32AppSpec | Arc4AppSpec
  name?: string
  version?: string
  fromRound?: bigint
  toRound?: bigint
}

// TODO: NC - Do we need to remove state as we navigate backwards?

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
            fromRound?: bigint
            toRound?: bigint
            applicationId?: ApplicationId
            version?: string
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
                  fromRound: ({ event }) => event.fromRound,
                  toRound: ({ event }) => event.toRound,
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
                  fromRound: ({ event }) => event.fromRound,
                  toRound: ({ event }) => event.toRound,
                  // TODO: NC - Add template params
                  // TODO: NC - Add updatable/deletable
                }),
              },
              detailsCancelled: {
                target: 'appSpec',
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
