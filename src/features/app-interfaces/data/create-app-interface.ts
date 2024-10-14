import { assign, setup } from 'xstate'
import { Arc32AppSpec, Arc4AppSpec, CreateAppInterfaceContext, TemplateParam } from './types'
import { ApplicationId } from '@/features/applications/data/types'
import { useMemo } from 'react'
import { atomWithMachine } from 'jotai-xstate'
import { useAtom } from 'jotai'

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
