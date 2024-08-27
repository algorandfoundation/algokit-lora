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
