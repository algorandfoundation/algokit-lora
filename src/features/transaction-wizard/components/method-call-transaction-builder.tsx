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
import { FieldPath, Path, useFormContext } from 'react-hook-form'
import { useLoadableAbiMethodDefinitions } from '@/features/applications/data/application-method-definitions'
import { TransactionBuilderFeeField } from '@/features/transaction-wizard/components/transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from '@/features/transaction-wizard/components/transaction-builder-valid-round-field'
import { DescriptionList } from '@/features/common/components/description-list'
import { BuildMethodCallTransactionResult, BuildTransactionResult, BuildableTransactionType, MethodCallArg, MethodForm } from '../models'
import { Struct } from '@/features/abi-methods/components/struct'
import { DefaultArgument } from '@/features/abi-methods/components/default-value'
import { asMethodForm, extractArgumentIndexFromFieldPath, methodArgPrefix } from '../mappers'
import { randomGuid } from '@/utils/random-guid'
import { TransactionBuilderMode } from '../data'
import { invariant } from '@/utils/invariant'
import { cn } from '@/features/common/utils'

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
  defaultValues?: Partial<BuildMethodCallTransactionResult>
  onSubmit: (transaction: BuildMethodCallTransactionResult) => void
  onCancel: () => void
}

export function MethodCallTransactionBuilder({ mode, transaction, defaultValues: defaultValuesProps, onSubmit, onCancel }: Props) {
  const [methodForm, setMethodForm] = useState<MethodForm | undefined>(undefined)
  const [formSchema, setFormSchema] = useState(appCallFormSchema)
  const [childForm, setChildForm] = useState<React.ReactNode | undefined>(undefined)

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
    if (mode === TransactionBuilderMode.Create) {
      return {
        fee: {
          setAutomatically: true,
        },
        validRounds: {
          setAutomatically: true,
        },
        ...defaultValuesProps,
      }
    } else if (mode === TransactionBuilderMode.Edit) {
      invariant(transaction, 'Transaction is required in edit mode')

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
    return {}
  }, [transaction, mode, defaultValuesProps])

  const onChildFormCancel = useCallback(() => {
    setChildForm(undefined)
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onChildFormSubmit = useCallback(() => {
    setChildForm(undefined)
  }, [])

  return (
    <>
      <div className={cn(childForm ? 'hidden' : 'block')}>
        <Form
          schema={formData}
          onSubmit={submit}
          defaultValues={defaultValues}
          formAction={
            <FormActions>
              <CancelButton onClick={onCancel} className="w-28" />
              <SubmitButton className="w-28">Save</SubmitButton>
            </FormActions>
          }
        >
          {(helper) => (
            <FormInner
              helper={helper}
              methodForm={methodForm}
              onSetMethodForm={onSetMethodForm}
              onShowForm={setChildForm}
              onCancel={onChildFormCancel}
              onSubmit={onChildFormSubmit}
            />
          )}
        </Form>
      </div>
      <div className={cn(childForm ? 'block' : 'hidden')}>{childForm}</div>
    </>
  )
}

type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof baseFormData>>
  methodForm: MethodForm | undefined
  onSetMethodForm: (method: MethodForm | undefined) => void
  onShowForm: (form: React.ReactNode) => void
  onCancel: () => void
  onSubmit: () => void
}

function FormInner({ helper, methodForm, onSetMethodForm, onShowForm, onCancel, onSubmit }: FormInnerProps) {
  const { watch, setValue, trigger } = useFormContext<z.infer<typeof baseFormData>>()
  const appId = watch('applicationId')
  const methodName = watch('methodName')

  const loadableMethodDefinitions = useLoadableAbiMethodDefinitions(Number(appId))
  const methodDefinitions = useMemo(() => {
    if (loadableMethodDefinitions.state !== 'hasData' || !loadableMethodDefinitions.data) {
      return []
    }
    return loadableMethodDefinitions.data.methods
  }, [loadableMethodDefinitions])

  const onTransactionFormSubmit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (field: Path<any>, data: BuildTransactionResult) => {
      setValue(field, data)
      trigger(field)
      onSubmit()
    },
    [onSubmit, setValue, trigger]
  )

  useEffect(() => {
    if (!methodName || methodDefinitions.length === 0) {
      onSetMethodForm(undefined)
      return
    }

    onSetMethodForm(
      asMethodForm({
        method: methodDefinitions.find((method) => method.name === methodName)!,
        onShowForm,
        onCancel,
        onSubmit: onTransactionFormSubmit,
      })
    )
  }, [methodDefinitions, methodName, onCancel, onSetMethodForm, onShowForm, onSubmit, onTransactionFormSubmit])

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
        field: 'foo' in arg ? arg.createField(helper, onShowForm, onSubmit, onCancel) : arg.createField(helper),
      })) ?? []
    )
  }, [methodForm?.arguments, helper, onShowForm, onSubmit, onCancel])

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
