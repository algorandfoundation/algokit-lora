import { useCallback } from 'react'
import { z } from 'zod'
import { Form } from '@/features/forms/components/form'
import { zfd } from 'zod-form-data'
import { Arc32AppSpec, Arc4AppSpec } from '@/features/app-interfaces/data/types'
import { readFile } from '@/utils/read-file'
import { jsonAsArc32AppSpec, jsonAsArc4AppSpec } from '@/features/abi-methods/mappers'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data/create-app-interface'
import { FormActions } from '@/features/forms/components/form-actions'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { Button } from '@/features/common/components/button'

type Props = {
  snapshot: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function WIPDetails({ snapshot }: Props) {
  const [_, send] = snapshot

  return (
    <div>
      <span>fromAppDeployment 2</span>
      <Button onClick={() => send({ type: 'detailsCancelled' })}>Back</Button>
      <Button onClick={() => send({ type: 'detailsCompleted' })}>Next</Button>
    </div>
  )
}
