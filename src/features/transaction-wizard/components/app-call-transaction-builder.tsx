import algosdk from 'algosdk'
import { bigIntSchema } from '@/features/forms/data/common'
import { senderFieldSchema, commoSchema } from '@/features/transaction-wizard/data/common'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { Form } from '@/features/forms/components/form'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { useFormContext } from 'react-hook-form'
import { useLoadableAbiMethodDefinitions } from '@/features/applications/data/application-method-definitions'
import { TransactionBuilderFeeField } from '@/features/transaction-wizard/components/transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from '@/features/transaction-wizard/components/transaction-builder-valid-round-field'
import { DescriptionList } from '@/features/common/components/description-list'
import { AppCallTransactionBuilderResult, MethodForm } from '../models'
import { Struct } from '@/features/abi-methods/components/struct'
import { DefaultArgument } from '@/features/abi-methods/components/default-value'
import { asMethodForm, extractArgumentIndexFromFieldPath, methodArgPrefix } from '../mappers'
import { AppClientMethodCallParamsArgs } from '@/features/applications/data/types'

const appCallFormSchema = {
  ...commoSchema,
  ...senderFieldSchema,
  appId: bigIntSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' })),
  // TODO: PD - JSON serialisation of app args should exclude the ids
  appArgs: zfd.repeatableOfType(
    z.object({
      id: z.string(),
      value: zfd.text(),
    })
  ),
}
const baseFormData = zfd.formData(appCallFormSchema)

type Props = {
  onSubmit: (transaction: algosdk.Transaction) => void
  onCancel: () => void
}

export function AppCallTransactionBuilder({ onSubmit, onCancel }: Props) {
  const [methodForm, setMethodForm] = useState<MethodForm | undefined>(undefined)
  const [formSchema, setFormSchema] = useState(appCallFormSchema)

  const formData = useMemo(() => {
    return zfd.formData(formSchema)
  }, [formSchema])

  const submit = useCallback(
    async (values: z.infer<typeof formData>) => {
      if (methodForm) {
        const methodArgs = await Object.entries(values).reduce(
          async (asyncAcc, [path, value]) => {
            if (!path.startsWith(`${methodArgPrefix}-`)) {
              return asyncAcc
            }
            const acc = await asyncAcc
            const index = extractArgumentIndexFromFieldPath(path)
            acc[index] = await methodForm.arguments[index].getAppCallArg(value)
            return acc
          },
          Promise.resolve([] as AppClientMethodCallParamsArgs[])
        )
        const fields = Object.entries(values).reduce((acc, [path, value]) => {
          if (!path.startsWith(`${methodArgPrefix}-`)) {
            return { ...acc, [path]: value }
          }
          return acc
        }, {})

        throw new Error('Not implemented')
      }
    },
    [methodForm, onSubmit]
  )

  const onSetMethodForm = useCallback((method: MethodForm | undefined) => {
    if (!method) {
      setFormSchema(appCallFormSchema)
      setMethodForm(undefined)
    } else {
      setFormSchema((prev) => {
        return {
          ...prev,
          ...method.schema,
        }
      })
      setMethodForm(method)
    }
  }, [])

  return (
    <Form
      schema={formData}
      onSubmit={submit}
      defaultValues={{
        fee: {
          setAutomatically: true,
        },
        validRounds: {
          setAutomatically: true,
        },
      }}
      formAction={
        <FormActions>
          <CancelButton onClick={onCancel} className="w-28" />
          <SubmitButton className="w-28">Create</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => <FormInner helper={helper} methodForm={methodForm} onSetMethodForm={onSetMethodForm} />}
    </Form>
  )
}

type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof baseFormData>>
  methodForm: MethodForm | undefined
  onSetMethodForm: (method: MethodForm | undefined) => void
}

function FormInner({ helper, methodForm, onSetMethodForm }: FormInnerProps) {
  const { watch } = useFormContext<z.infer<typeof baseFormData>>()
  const appId = watch('appId')
  const methodDefinitions = useLoadableAbiMethodDefinitions(Number(appId))

  const method = useMemo(() => {
    if (methodDefinitions.state !== 'hasData' || !methodDefinitions.data) {
      return undefined
    }
    return methodDefinitions.data.methods[0]
  }, [methodDefinitions])

  useEffect(() => {
    if (!method) {
      onSetMethodForm(undefined)
      return
    }

    onSetMethodForm(asMethodForm(method))
  }, [method, onSetMethodForm])

  const abiMethodArgs = useMemo(() => {
    return (
      methodForm?.arguments.map((arg) => ({
        descriptions: [
          ...(arg.name
            ? [
                {
                  dt: 'Name',
                  dd: arg.name,
                },
              ]
            : []),
          ...(arg.description
            ? [
                {
                  dt: 'Description',
                  dd: arg.description,
                },
              ]
            : []),
          {
            dt: 'Type',
            dd: arg.hint?.struct ? <Struct struct={arg.hint.struct} /> : arg.type.toString(),
          },
          ...(arg.hint?.defaultArgument
            ? [
                {
                  dt: 'Default Argument',
                  dd: <DefaultArgument defaultArgument={arg.hint.defaultArgument} />,
                },
              ]
            : []),
        ],
        field: arg.createField(helper),
      })) ?? []
    )
  }, [methodForm?.arguments, helper])

  return (
    <div>
      {helper.numberField({
        field: 'appId',
        label: 'Application ID',
      })}
      {helper.textField({
        field: 'sender',
        label: 'Sender',
      })}
      {abiMethodArgs.map((arg, index) => (
        <div key={index}>
          <h5 className="text-primary">{`Argument ${index + 1}`}</h5>
          <DescriptionList items={arg.descriptions} />
          <Fragment>{arg.field}</Fragment>
        </div>
      ))}
      <TransactionBuilderFeeField />
      <TransactionBuilderValidRoundField />
    </div>
  )
}
