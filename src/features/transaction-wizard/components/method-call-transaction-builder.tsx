import { bigIntSchema } from '@/features/forms/data/common'
import { senderFieldSchema, commonSchema } from '@/features/transaction-wizard/data/common'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { Form } from '@/features/forms/components/form'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { useFormContext } from 'react-hook-form'
import { useLoadableAbiMethodDefinitions } from '@/features/applications/data/application-method-definitions'
import { TransactionBuilderFeeField } from '@/features/transaction-wizard/components/transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from '@/features/transaction-wizard/components/transaction-builder-valid-round-field'
import { DescriptionList } from '@/features/common/components/description-list'
import { BuildMethodCallTransactionResult, BuildableTransactionType, MethodCallArg, MethodForm } from '../models'
import { Struct } from '@/features/abi-methods/components/struct'
import { DefaultArgument } from '@/features/abi-methods/components/default-value'
import { asMethodForm, extractArgumentIndexFromFieldPath, methodArgPrefix } from '../mappers'
import { randomGuid } from '@/utils/random-guid'
import { TransactionBuilderMode } from '../data'

const appCallFormSchema = {
  ...commonSchema,
  ...senderFieldSchema,
  applicationId: bigIntSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' })),
  methodName: zfd.text(),
}
const baseFormData = zfd.formData(appCallFormSchema)

type Props = {
  mode: TransactionBuilderMode
  transaction?: BuildMethodCallTransactionResult
  activeAddress?: string
  defaultValues?: Partial<BuildMethodCallTransactionResult>
  onSubmit: (transaction: BuildMethodCallTransactionResult) => void
  onCancel: () => void
}

export function MethodCallTransactionBuilder({
  mode,
  transaction,
  activeAddress,
  defaultValues: _defaultValues,
  onSubmit,
  onCancel,
}: Props) {
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
          Promise.resolve([] as MethodCallArg[])
        )

        onSubmit({
          id: transaction?.id ?? randomGuid(),
          type: BuildableTransactionType.MethodCall,
          applicationId: Number(values.applicationId),
          sender: values.sender,
          fee: values.fee,
          validRounds: values.validRounds,
          method: methodForm.abiMethod,
          methodName: methodForm.name,
          methodArgs: methodArgs,
        })
      }
    },
    [methodForm, onSubmit, transaction?.id]
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

  const defaultValues = useMemo<Partial<z.infer<typeof baseFormData>>>(() => {
    if (mode === TransactionBuilderMode.Edit && transaction) {
      const methodArgs = transaction.methodArgs?.reduce(
        (acc, arg, index) => {
          acc[`${methodArgPrefix}-${index}`] = arg
          return acc
        },
        {} as Record<string, unknown>
      )
      return {
        applicationId: transaction.applicationId ? BigInt(transaction.applicationId) : undefined,
        sender: transaction.sender,
        fee: transaction.fee,
        validRounds: transaction.validRounds,
        methodName: transaction.methodName,
        ...methodArgs,
      }
    }
    return {
      sender: activeAddress,
      fee: {
        setAutomatically: true,
      },
      validRounds: {
        setAutomatically: true,
      },
      ..._defaultValues,
      applicationId: _defaultValues?.applicationId ? BigInt(_defaultValues.applicationId) : undefined,
    }
  }, [mode, transaction, activeAddress, _defaultValues])

  return (
    <Form
      schema={formData}
      onSubmit={submit}
      defaultValues={defaultValues}
      formAction={
        <FormActions>
          <CancelButton onClick={onCancel} className="w-28" />
          <SubmitButton className="w-28">{mode === TransactionBuilderMode.Edit ? 'Update' : 'Add'}</SubmitButton>
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
  const appId = watch('applicationId')
  const methodName = watch('methodName')

  const loadableMethodDefinitions = useLoadableAbiMethodDefinitions(Number(appId))
  const methodDefinitions = useMemo(() => {
    if (loadableMethodDefinitions.state !== 'hasData' || !loadableMethodDefinitions.data) {
      return []
    }
    return loadableMethodDefinitions.data.methods
  }, [loadableMethodDefinitions])

  useEffect(() => {
    if (!methodName || methodDefinitions.length === 0) {
      onSetMethodForm(undefined)
      return
    }

    onSetMethodForm(asMethodForm(methodDefinitions.find((method) => method.name === methodName)!))
  }, [methodDefinitions, methodName, onSetMethodForm])

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
    <div className="space-y-4">
      {helper.numberField({
        field: 'applicationId',
        label: 'Application ID',
      })}
      {helper.selectField({
        field: 'methodName',
        label: 'Method',
        options: methodDefinitions?.map((method) => ({
          label: method.name,
          value: method.name,
        })),
      })}
      {helper.textField({
        field: 'sender',
        label: 'Sender',
      })}
      {abiMethodArgs.map((arg, index) => (
        <div key={index} className="space-y-1.5 text-sm">
          <h5 className="text-primary">{`Argument ${index + 1}`}</h5>
          <DescriptionList items={arg.descriptions} />
          <>{arg.field}</>
        </div>
      ))}
      <TransactionBuilderFeeField />
      <TransactionBuilderValidRoundField />
    </div>
  )
}
