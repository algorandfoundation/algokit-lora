import { assign, setup } from 'xstate'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { ApplicationId } from '@/features/applications/data/types.ts'
import { useAtom } from 'jotai'
import { atomWithMachine } from 'jotai-xstate'

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
        appDeployed?: boolean
      },
      events: {} as
        | { type: 'file_selected'; file: File; appSpec: Arc32AppSpec }
        | { type: 'create_new_app_requested'; name?: string; applicationId?: ApplicationId }
        | { type: 'new_app_created'; applicationId: ApplicationId }
        | { type: 'create_new_app_request_cancel' },
    },
  }).createMachine({
    id: 'createAppInterface',
    initial: 'upload_file',
    context: {},
    states: {
      upload_file: {
        on: {
          file_selected: {
            target: 'form',
            actions: assign({
              file: ({ event }) => event.file,
              appSpec: ({ event }) => event.appSpec,
            }),
          },
        },
      },
      form: {
        on: {
          create_new_app_requested: {
            target: 'deploy_app',
            actions: assign({
              name: ({ context, event }) => (event.name != null ? event.name : context.name),
              applicationId: ({ context, event }) => (event.applicationId != null ? event.applicationId : context.applicationId),
            }),
          },
        },
      },
      deploy_app: {
        on: {
          new_app_created: {
            target: 'form',
            actions: assign({ applicationId: ({ event }) => event.applicationId, appDeployed: true }),
          },
          create_new_app_request_cancel: {
            target: 'form',
          },
        },
      },
    },
  })

// TODO: change to camelCase
const createAppInterfaceMachineAtom = atomWithMachine(() => createMachine())

export const useCreateAppInterfaceStateMachine = () => {
  return useAtom(createAppInterfaceMachineAtom)
}
