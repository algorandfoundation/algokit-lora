import { PageTitle } from '@/features/common/components/page-title'
import { useAppInterfaces, useCreateAppInterface } from '@/features/app-interfaces/data'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { PageLoader } from '@/features/common/components/page-loader'
import { AppInterfaces } from '@/features/app-interfaces/components/app-interfaces'
import { useToggle } from '@/features/common/hooks/use-toggle'
import { useCallback, useEffect, useState } from 'react'
import { ApplicationId } from '@/features/applications/data/types'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { zfd } from 'zod-form-data'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { useFormContext, useWatch } from 'react-hook-form'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { readFile } from '@/utils/read-file'
import { jsonAsArc32AppSpec } from '@/features/abi-methods/mappers'
import { asError } from '@/utils/error'
import { Dialog, DialogContent, DialogHeader, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { createAppInterfaceLabel } from '@/features/app-interfaces/components/labels'

export const appLabPageTitle = 'App Lab'

export function AppLab() {
  const [appInterfaces, refreshAppInterfaces] = useAppInterfaces()
  const [applicationId, setApplicationId] = useState<ApplicationId | undefined>()
  const { on, off, state: dialogOpen } = useToggle(false)

  useEffect(() => {
    const deepLinkSearchParams = getAppLapDeepLinkSearchParams()
    if (deepLinkSearchParams) {
      setApplicationId(Number(deepLinkSearchParams.applicationId))
      on()

      const url = new URL(window.location.href)
      url.searchParams.delete(appLapDeepLinkSearchParams.applicationId)
      url.searchParams.delete(appLapDeepLinkSearchParams.filePath)
      url.searchParams.delete(appLapDeepLinkSearchParams.roundFirstValid)
      url.searchParams.delete(appLapDeepLinkSearchParams.roundLastValid)
      window.history.replaceState({}, '', url)
    }
  }, [on])

  const onAppCreated = useCallback(() => {
    off()
    refreshAppInterfaces()
  }, [off, refreshAppInterfaces])

  // TODO: why the dialog is double rendered if it's outside of the render loadable?
  return (
    <>
      <PageTitle title={appLabPageTitle} />
      <RenderLoadable loadable={appInterfaces} fallback={<PageLoader />}>
        {(appInterfaces) => {
          return (
            <>
              <AppInterfaces appInterfaces={appInterfaces} refreshAppInterfaces={refreshAppInterfaces} />
              {applicationId && (
                <CreateAppInterfaceDialog applicationId={applicationId} onSuccess={onAppCreated} dialogOpen={dialogOpen} off={off} />
              )}
            </>
          )
        }}
      </RenderLoadable>
    </>
  )
}

const getAppLapDeepLinkSearchParams = () => {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('applicationId')) {
    return undefined
  }

  const applicationId = url.searchParams.get(appLapDeepLinkSearchParams.applicationId)
  const filePath = url.searchParams.get(appLapDeepLinkSearchParams.filePath)
  const roundFirstValid = url.searchParams.get(appLapDeepLinkSearchParams.roundFirstValid)
  const roundLastValid = url.searchParams.get(appLapDeepLinkSearchParams.roundLastValid)

  return {
    applicationId,
    filePath,
    roundFirstValid,
    roundLastValid,
  }
}

const appLapDeepLinkSearchParams = {
  applicationId: 'applicationId',
  filePath: 'filePath',
  roundFirstValid: 'roundFirstValid',
  roundLastValid: 'roundLastValid',
}

type CreateAppInterfaceDialogProps = {
  applicationId: ApplicationId
  onSuccess: () => void
  dialogOpen: boolean
  off: () => void
}
function CreateAppInterfaceDialog({ applicationId, onSuccess, dialogOpen, off }: CreateAppInterfaceDialogProps) {
  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => (open ? undefined : off())} modal={true}>
      <DialogContent className="bg-card">
        <DialogHeader className="flex-row items-center space-y-0">
          <h2 className="pb-0">{createAppInterfaceLabel}</h2>
        </DialogHeader>
        <MediumSizeDialogBody>
          <CreateAppInterfaceForm applicationId={applicationId} onSuccess={onSuccess} />
        </MediumSizeDialogBody>
      </DialogContent>
    </Dialog>
  )
}

const formSchema = zfd.formData({
  file: z.instanceof(File, { message: 'Required' }).refine((file) => file.type === 'application/json', 'Only JSON files are allowed'),
  name: zfd.text(),
  applicationId: zfd.numeric(),
})
type CreateAppInterfaceFormProps = {
  applicationId: ApplicationId
  onSuccess: () => void
}
function CreateAppInterfaceForm({ applicationId, onSuccess }: CreateAppInterfaceFormProps) {
  const createAppInterface = useCreateAppInterface()

  const save = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      // TODO: consider a more efficient way to read the file, because it's already read when the user selects the file
      const appSpec = await readFileIntoAppSpec(values.file)

      await createAppInterface({
        name: values.name,
        standard: 'ARC-32',
        appSpec: appSpec,
        roundFirstValid: undefined,
        roundLastValid: undefined,
        applicationId: values.applicationId,
      })
      toast.success(`App interface ${values.name} was saved successfully`)
    },
    [createAppInterface]
  )

  return (
    <Form
      schema={formSchema}
      onSubmit={save}
      onSuccess={onSuccess}
      defaultValues={{
        applicationId: applicationId,
      }}
      formAction={
        <FormActions>
          <CancelButton onClick={onSuccess} className="w-28" />
          <SubmitButton className="w-28">Create</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => <FormInner helper={helper} />}
    </Form>
  )
}

type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof formSchema>>
}
function FormInner({ helper }: FormInnerProps) {
  const { control, setValue, setError } = useFormContext<z.infer<typeof formSchema>>()
  const file = useWatch({ name: 'file', control })

  useEffect(() => {
    ;(async () => {
      if (!file) return
      try {
        const appSpec = await readFileIntoAppSpec(file)
        setValue('name', appSpec.contract.name)
      } catch (e) {
        const error = asError(e)
        setError('file', {
          type: 'custom',
          message: error.message,
        })
      }
    })()
  }, [file, setError, setValue])

  return (
    <>
      {helper.fileField({
        field: 'file',
        label: 'App spec',
      })}
      {helper.textField({
        field: 'name',
        label: 'Name',
      })}
      {helper.numberField({
        field: 'applicationId',
        label: 'Application ID',
      })}
    </>
  )
}

const readFileIntoAppSpec = async (file: File): Promise<Arc32AppSpec> => {
  const content = await readFile(file)
  try {
    return jsonAsArc32AppSpec(JSON.parse(content as string))
  } catch (e) {
    throw new Error('The file is not a valid ARC-32 app spec')
  }
}
