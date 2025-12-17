import { Form } from '@/features/forms/components/form'
import { useCallback } from 'react'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormActions } from '@/features/forms/components/form-actions'
import { z } from 'zod'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { AppSpecStandard, AppSpecVersion, Arc32AppSpec, Arc4AppSpec } from '../../data/types'
import { useAddAppSpecVersion } from '../../data/update'
import { ApplicationId } from '@/features/applications/data/types'
import { parseAsAppSpec } from '../../mappers'
import { isArc32AppSpec, isArc4AppSpec, isArc56AppSpec } from '@/features/common/utils'
import { invariant } from '@/utils/invariant'
import { AppSpecFormInner, appSpecSchema, supportedStandards } from './app-spec-form-inner'
import { toast } from 'react-toastify'
import { Arc56Contract } from '@algorandfoundation/algokit-utils/abi'

type Props = {
  applicationId: ApplicationId
  onSuccess: () => void
}

export function AddAppSpecForm({ applicationId, onSuccess }: Props) {
  const addAppSpecVersion = useAddAppSpecVersion()

  const addNewAppSpec = useCallback(
    async (values: z.infer<typeof appSpecSchema>) => {
      const common = {
        roundFirstValid: values.roundFirstValid,
        roundLastValid: values.roundLastValid,
      }
      const parsedAppSpec = await parseAsAppSpec(values.file, supportedStandards)
      const appSpecVersion = isArc32AppSpec(parsedAppSpec)
        ? ({
            ...common,
            appSpec: parsedAppSpec as Arc32AppSpec,
            standard: AppSpecStandard.ARC32,
          } satisfies AppSpecVersion)
        : isArc56AppSpec(parsedAppSpec)
          ? ({
              ...common,
              appSpec: parsedAppSpec as Arc56Contract,
              standard: AppSpecStandard.ARC56,
            } satisfies AppSpecVersion)
          : isArc4AppSpec(parsedAppSpec)
            ? ({
                ...common,
                appSpec: parsedAppSpec as Arc4AppSpec,
                standard: AppSpecStandard.ARC4,
              } satisfies AppSpecVersion)
            : undefined

      invariant(appSpecVersion, 'App spec standard is not supported')
      await addAppSpecVersion(applicationId, appSpecVersion)
      toast.success('App spec has been added')
    },
    [addAppSpecVersion, applicationId]
  )

  return (
    <Form
      schema={appSpecSchema}
      onSubmit={addNewAppSpec}
      onSuccess={onSuccess}
      formAction={
        <FormActions>
          <CancelButton onClick={onSuccess} className="w-28" />
          <SubmitButton className="w-28">Save</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => <AppSpecFormInner helper={helper} />}
    </Form>
  )
}
