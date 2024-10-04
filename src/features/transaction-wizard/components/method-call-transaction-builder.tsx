import algosdk from 'algosdk'
import { bigIntSchema } from '@/features/forms/data/common'
import {
  senderFieldSchema,
  commonSchema,
  onCompleteFieldSchema,
  onCompleteOptions as _onCompleteOptions,
} from '@/features/transaction-wizard/data/common'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { Form } from '@/features/forms/components/form'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { Path, useFormContext } from 'react-hook-form'
import { useLoadableAbiMethodDefinitions } from '@/features/applications/data/application-method-definitions'
import { TransactionBuilderFeeField } from '@/features/transaction-wizard/components/transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from '@/features/transaction-wizard/components/transaction-builder-valid-round-field'
import { DescriptionList } from '@/features/common/components/description-list'
import {
  BuildMethodCallTransactionResult,
  BuildTransactionResult,
  BuildableTransactionType,
  MethodForm,
  PlaceholderTransactionResult,
} from '../models'
import { Struct } from '@/features/abi-methods/components/struct'
import { DefaultArgument } from '@/features/abi-methods/components/default-value'
import { asMethodForm, asFieldInput, methodArgPrefix } from '../mappers'
import { randomGuid } from '@/utils/random-guid'
import { TransactionBuilderMode } from '../data'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'
import { TransactionBuilderNoteField } from './transaction-builder-note-field'
import { invariant } from '@/utils/invariant'

const appCallFormSchema = {
  ...commonSchema,
  ...senderFieldSchema,
  ...onCompleteFieldSchema,
  applicationId: bigIntSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' })),
  methodName: zfd.text(),
}
const baseFormData = zfd.formData(appCallFormSchema)

type Props = {
  mode: TransactionBuilderMode
  transaction?: BuildMethodCallTransactionResult
  activeAddress?: string
  defaultValues?: Partial<BuildMethodCallTransactionResult>
  onSubmit: (transaction: BuildTransactionResult) => void
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
  const [appSpec, setAppSpec] = useState<Arc32AppSpec | undefined>(undefined)
  const [methodForm, setMethodForm] = useState<MethodForm | undefined>(undefined)
  const [formSchema, setFormSchema] = useState(appCallFormSchema)

  const formData = useMemo(() => {
    return zfd.formData(formSchema)
  }, [formSchema])

  const submit = useCallback(
    async (values: z.infer<typeof formData>) => {
      // TODO: PD - handle the placeholder transactions when changing method? - just drop them
      // TODO: PD - handle the placeholder transactions on delete
      invariant(methodForm, 'Method form is required')

      const methodArgs = methodForm.arguments.map((arg, index) => {
        const value = values[`${methodArgPrefix}-${index}` as keyof z.infer<typeof formData>]
        if ('getAppCallArg' in arg) {
          return arg.getAppCallArg(value)
        } else {
          if (mode === TransactionBuilderMode.Create) {
            return {
              id: randomGuid(),
              type: BuildableTransactionType.Placeholder,
              targetType: arg.type,
              argForMethod: methodForm.name,
            } satisfies PlaceholderTransactionResult
          } else {
            return transaction!.methodArgs[index]
          }
        }
      })

      const methodCallTxn = {
        id: transaction?.id ?? randomGuid(),
        type: BuildableTransactionType.MethodCall,
        applicationId: Number(values.applicationId),
        sender: values.sender,
        fee: values.fee,
        validRounds: values.validRounds,
        appSpec: appSpec as AppSpec, // TODO: PD - convert Arc32AppSpec to AppSpec
        method: methodForm.abiMethod,
        methodName: methodForm.name,
        methodArgs: methodArgs,
        note: values.note,
        onComplete: Number(values.onComplete),
      } satisfies BuildMethodCallTransactionResult

      onSubmit(methodCallTxn)
    },
    [methodForm, transaction, appSpec, onSubmit, mode]
  )

  const onSetMethodForm = useCallback((method: MethodForm | undefined) => {
    if (!method) {
      setFormSchema(appCallFormSchema)
      setMethodForm(undefined)
    } else {
      setFormSchema(() => {
        return {
          ...appCallFormSchema,
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
          const { type } = transaction.method.args[index]
          if (!algosdk.abiTypeIsTransaction(type)) {
            acc[`${methodArgPrefix}-${index}`] = asFieldInput(type, arg as algosdk.ABIValue)
          }
          return acc
        },
        {} as Record<string, unknown>
      )
      return {
        applicationId: transaction.applicationId ? BigInt(transaction.applicationId) : undefined,
        sender: transaction.sender,
        onComplete: transaction.onComplete.toString(),
        methodName: transaction.methodName,
        fee: transaction.fee,
        validRounds: transaction.validRounds,
        note: transaction.note,
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
      onComplete: _defaultValues?.onComplete != undefined ? _defaultValues?.onComplete.toString() : undefined,
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
      {(helper) => <FormInner helper={helper} methodForm={methodForm} onSetAppSpec={setAppSpec} onSetMethodForm={onSetMethodForm} />}
    </Form>
  )
}

type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof baseFormData>>
  methodForm: MethodForm | undefined
  onSetAppSpec: (appSpec: Arc32AppSpec) => void
  onSetMethodForm: (method: MethodForm | undefined) => void
}

function FormInner({ helper, methodForm, onSetAppSpec, onSetMethodForm }: FormInnerProps) {
  const { watch, setValue, getValues } = useFormContext<z.infer<typeof baseFormData>>()
  const appId = watch('applicationId')
  const methodName = watch('methodName')

  const loadableMethodDefinitions = useLoadableAbiMethodDefinitions(Number(appId))

  const { appSpec, methodDefinitions } = useMemo(() => {
    if (loadableMethodDefinitions.state !== 'hasData' || !loadableMethodDefinitions.data) {
      return {
        appSpec: undefined,
        methodDefinitions: [],
      }
    }

    return {
      appSpec: loadableMethodDefinitions.data.appSpec,
      methodDefinitions: loadableMethodDefinitions.data.methods.filter((method) => (method.callConfig?.call ?? []).length > 0),
    }
  }, [loadableMethodDefinitions])

  useEffect(() => {
    if (!methodName || methodDefinitions.length === 0 || !appSpec) {
      onSetMethodForm(undefined)
      return
    }

    const methodDefinition = methodDefinitions.find((method) => method.name === methodName)

    if (methodForm?.name !== undefined && methodName !== methodForm.name) {
      const defaultOnComplete = methodDefinition?.callConfig ? methodDefinition?.callConfig?.call[0] : undefined
      if (defaultOnComplete !== undefined) {
        // This is needed to ensure the select list options have updated before setting the value, otherwise it isn't selected in the UI
        setTimeout(() => {
          setValue('onComplete', defaultOnComplete.toString())
        }, 10)
      }
      const values = getValues()
      for (const key of Object.keys(values).filter((key) => key.startsWith(methodArgPrefix))) {
        const value = values[key as keyof typeof values]
        // for number and bigint, set to empty string so that the input is reset
        const defaultValue = typeof value === 'number' || typeof value === 'bigint' ? '' : undefined
        setValue(key as Path<z.infer<typeof baseFormData>>, defaultValue)
      }
    }

    onSetAppSpec(appSpec)
    onSetMethodForm(asMethodForm(methodDefinition!))
  }, [getValues, methodDefinitions, methodForm?.name, methodName, onSetMethodForm, setValue, onSetAppSpec, appSpec])

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
                  dt: 'Default',
                  dd: <DefaultArgument defaultArgument={arg.hint.defaultArgument} />,
                },
              ]
            : []),
        ],
        field: arg.createField(helper),
      })) ?? []
    )
  }, [methodForm?.arguments, helper])

  const onCompleteOptions = useMemo(() => {
    return _onCompleteOptions.filter((x) => {
      if (!methodForm?.callConfig || methodForm?.callConfig.call.includes(Number(x.value) as algosdk.OnApplicationComplete)) {
        return true
      }

      return false
    })
  }, [methodForm?.callConfig])

  return (
    <div className="space-y-4">
      {helper.numberField({
        field: 'applicationId',
        label: 'Application ID',
        helpText: 'The application to be called',
      })}
      {helper.selectField({
        field: 'methodName',
        label: 'Method',
        options: methodDefinitions?.map((method) => ({
          label: method.name,
          value: method.name,
        })),
        helpText: 'Name of the ABI method to call',
      })}
      {helper.selectField({
        field: 'onComplete',
        label: 'On complete',
        options: onCompleteOptions,
        helpText: 'Action to perform after executing the program',
      })}
      {helper.textField({
        field: 'sender',
        label: 'Sender',
        helpText: 'Account to call from. Sends the transaction and pays the fee',
      })}
      {abiMethodArgs.map((arg, index) => (
        <div key={index} className="relative space-y-1.5 text-sm [&_label]:mt-1.5">
          <h5 className="text-primary">{`Argument ${index + 1}`}</h5>
          <DescriptionList items={arg.descriptions} dtClassName="w-24 truncate" />
          {arg.field}
        </div>
      ))}
      <TransactionBuilderFeeField />
      <TransactionBuilderValidRoundField />
      <TransactionBuilderNoteField />
    </div>
  )
}
