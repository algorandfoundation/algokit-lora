import { SelectAppSpecForm } from '@/features/app-interfaces/components/select-app-spec-form'
import { CreateAppInterfaceForm } from '@/features/app-interfaces/components/create-app-interface-form'
import { DeployAppForm } from './deploy-app-form'
import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data/state-machine'

type Props = {
  onSuccess: () => void
}

// TODO: research UI patterns for this
export function CreateAppInterfaceDialogBody({ onSuccess }: Props) {
  const [snapshot] = useCreateAppInterfaceStateMachine()

  console.log(snapshot.value, snapshot.context)
  // const onDeployAppButtonClick = useCallback(
  //   (name?: string, applicationId?: ApplicationId) => {
  //     send({ type: 'create_new_app_requested', name, applicationId })
  //     const currentState = state as FormState
  //     transitionToDeployAppState({ appSpecFile: currentState.appSpecFile, appSpec: currentState.appSpec })
  //   },
  //   [state, transitionToDeployAppState]
  // )
  //
  // const onAppCreated = useCallback(
  //   (appId: ApplicationId) => {
  //     const currentState = state as DeployAppState
  //     transitionToFormState({ applicationId: appId, appSpecFile: currentState.appSpecFile, appSpec: currentState.appSpec })
  //   },
  //   [state, transitionToFormState]
  // )
  //
  // const onCreateAppCancelled = useCallback(() => {
  //   const currentState = state as DeployAppState
  //   transitionToFormState({ applicationId: undefined, appSpecFile: currentState.appSpecFile, appSpec: currentState.appSpec })
  // }, [state, transitionToFormState])

  return (
    <>
      {snapshot.value === 'upload_file' && <SelectAppSpecForm />}
      {snapshot.value === 'form' && snapshot.context.appSpec && snapshot.context.file && (
        <CreateAppInterfaceForm appSpec={snapshot.context.appSpec} appSpecFile={snapshot.context.file} onSuccess={onSuccess} />
      )}
      {snapshot.value === 'deploy_app' && snapshot.context.appSpec && <DeployAppForm appSpec={snapshot.context.appSpec} />}
    </>
  )
}

// type UploadFileState = {
//   name: 'upload-file'
// }

// type FormState = {
//   name: 'form'
//   appSpecFile: File
//   appSpec: Arc32AppSpec
//   applicationId?: ApplicationId
//   values: z.infer<typeof createAppInterfaceFormSchema>
// }

// type DeployAppState = {
//   name: 'deploy-app'
//   appSpec: Arc32AppSpec
// }

// type DialogState = UploadFileState | FormState | DeployAppState

// type DialogContext = {
//   appSpecFile?: File
//   appSpec?: Arc32AppSpec
//   applicationId?: ApplicationId
//   createAppInterfaceFormValues?: z.infer<typeof createAppInterfaceFormSchema>
// }

// type StateConfig = {
//   name: string
//   targets: string[]
//   onExit: (context: DialogContext) => DialogContext
// }

// const uploadFileStateConfig: StateConfig = {
//   name: 'upload-file',
//   targets: ['form', 'deploy-app'],
//   onExit: (context) => {
//     return { ...context }
//   },
// }
// const formStateConfig: StateConfig = {
//   name: 'form',
//   targets: ['deploy-app'],
// }
// const deployAppStateConfig: StateConfig = {
//   name: 'deploy-app',
//   targets: ['form'],
// }

// const useCreateAppInterfaceStateAtom = () => {
//   const configs = [uploadFileStateConfig, formStateConfig, deployAppStateConfig]
//   const contextAtom = useMemo(() => atom<DialogContext>({}), [])
//   const stateAtom = useMemo(() => atom<DialogState>({ name: 'upload-file' }), [])

//   const [state, setState] = useAtom(stateAtom)

//   // const transition = useCallback(
//   //   (params: CreateAppInterfaceDialogState) => {
//   //     setState(params)
//   //   },
//   //   [setState]
//   // )

//   // const transitionToFormState = useCallback(
//   //   ({ appSpecFile, appSpec, applicationId }: Omit<FormState, 'name'>) => {
//   //     setState({ name: 'form', appSpecFile, appSpec, applicationId })
//   //   },
//   //   [setState]
//   // )

//   // const transitionToDeployAppState = useCallback(
//   //   ({ appSpecFile, appSpec }: Omit<DeployAppState, 'name'>) => {
//   //     setState({ name: 'deploy-app', appSpecFile, appSpec })
//   //   },
//   //   [setState]
//   // )

//   return { state, setState, stateHistory }
// }
