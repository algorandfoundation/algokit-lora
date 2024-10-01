import algosdk from 'algosdk'
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
import { Path, useFormContext } from 'react-hook-form'
import { useLoadableAbiMethodDefinitions } from '@/features/applications/data/application-method-definitions'
import { TransactionBuilderFeeField } from '@/features/transaction-wizard/components/transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from '@/features/transaction-wizard/components/transaction-builder-valid-round-field'
import { DescriptionList } from '@/features/common/components/description-list'
import {
  BuildMethodCallTransactionResult,
  BuildTransactionResult,
  BuildableTransactionType,
  MethodCallArg,
  MethodForm,
  TransactionArgumentField,
} from '../models'
import { Struct } from '@/features/abi-methods/components/struct'
import { DefaultArgument } from '@/features/abi-methods/components/default-value'
import { asMethodForm, extractArgumentIndexFromFieldPath, methodArgPrefix } from '../mappers'
import { randomGuid } from '@/utils/random-guid'
import { TransactionBuilderMode } from '../data'
import { cn } from '@/features/common/utils'
import { TransactionBuilder } from './transaction-builder'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'

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
  const [appSpec, setAppSpec] = useState<Arc32AppSpec | undefined>(undefined)
  const [methodForm, setMethodForm] = useState<MethodForm | undefined>(undefined)
  const [formSchema, setFormSchema] = useState(appCallFormSchema)
  const [transactionArgForm, setTransactionArgForm] = useState<React.ReactNode | undefined>(undefined)

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
          appSpec: appSpec as AppSpec, // TODO: PD - convert Arc32AppSpec to AppSpec
          method: methodForm.abiMethod,
          methodName: methodForm.name,
          methodArgs: methodArgs,
        })
      }
    },
    [methodForm, onSubmit, transaction?.id, appSpec]
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
          if (
            (type instanceof algosdk.ABIArrayStaticType && type.childType instanceof algosdk.ABIByteType) ||
            (type instanceof algosdk.ABIArrayDynamicType && type.childType instanceof algosdk.ABIByteType)
          ) {
            acc[`${methodArgPrefix}-${index}`] = uint8ArrayToBase64(arg as Uint8Array)
          } else {
            acc[`${methodArgPrefix}-${index}`] = arg
          }
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
    <>
      <div className={cn(transactionArgForm ? 'hidden' : 'block')}>
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
          {(helper) => (
            <FormInner
              helper={helper}
              methodForm={methodForm}
              onSetAppSpec={setAppSpec}
              onSetMethodForm={onSetMethodForm}
              onSetTransactionArgForm={setTransactionArgForm}
            />
          )}
        </Form>
      </div>
      <div className={cn(transactionArgForm ? 'block' : 'hidden')}>{transactionArgForm}</div>
    </>
  )
}

type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof baseFormData>>
  methodForm: MethodForm | undefined
  onSetAppSpec: (appSpec: Arc32AppSpec) => void
  onSetMethodForm: (method: MethodForm | undefined) => void
  onSetTransactionArgForm: (form: React.ReactNode) => void
}

function FormInner({ helper, methodForm, onSetAppSpec, onSetMethodForm, onSetTransactionArgForm }: FormInnerProps) {
  const { watch, setValue, trigger, getValues } = useFormContext<z.infer<typeof baseFormData>>()
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
      methodDefinitions: loadableMethodDefinitions.data.methods,
    }
  }, [loadableMethodDefinitions])

  const setTransactionArg = useCallback(
    (field: Path<z.infer<typeof baseFormData>>, data: BuildTransactionResult) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setValue(field, data as any)
      trigger(field)
      onSetTransactionArgForm(undefined)
    },
    [setValue, trigger, onSetTransactionArgForm]
  )

  const editTransactionArg = useCallback(
    (arg: TransactionArgumentField) => {
      const fieldValue = getValues(arg.path as Path<z.infer<typeof baseFormData>>)
      const builder = (
        <TransactionBuilder
          mode={fieldValue ? TransactionBuilderMode.Edit : TransactionBuilderMode.Create}
          transactionType={mapToTransactionType(arg.transactionType)}
          transaction={fieldValue as unknown as BuildTransactionResult}
          onCancel={() => onSetTransactionArgForm(undefined)}
          onSubmit={(txn) => setTransactionArg(arg.path as Path<z.infer<typeof baseFormData>>, txn)}
        />
      )
      onSetTransactionArgForm(builder)
    },
    [getValues, onSetTransactionArgForm, setTransactionArg]
  )

  useEffect(() => {
    if (!methodName || methodDefinitions.length === 0 || !appSpec) {
      onSetMethodForm(undefined)
      return
    }

    if (methodForm?.name !== undefined && methodName !== methodForm.name) {
      const values = getValues()
      for (const key of Object.keys(values).filter((key) => key.startsWith(methodArgPrefix))) {
        const value = values[key as keyof typeof values]
        // for number and bigint, set to empty string so that the input is reset
        const defaultValue = typeof value === 'number' || typeof value === 'bigint' ? '' : undefined
        setValue(key as Path<z.infer<typeof baseFormData>>, defaultValue)
      }
    }

    onSetAppSpec(appSpec)
    onSetMethodForm(asMethodForm(methodDefinitions.find((method) => method.name === methodName)!))
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
        field: 'transactionType' in arg ? arg.createField(helper, () => editTransactionArg(arg)) : arg.createField(helper),
      })) ?? []
    )
  }, [methodForm?.arguments, helper, editTransactionArg])

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
        <div key={index} className="relative space-y-1.5 text-sm [&_label]:mt-1.5">
          <h5 className="text-primary">{`Argument ${index + 1}`}</h5>
          <DescriptionList items={arg.descriptions} dtClassName="w-24 truncate" />
          {arg.field}
        </div>
      ))}
      <TransactionBuilderFeeField />
      <TransactionBuilderValidRoundField />
    </div>
  )
}

function mapToTransactionType(type: algosdk.ABITransactionType): algosdk.TransactionType | undefined {
  switch (type) {
    case algosdk.ABITransactionType.pay:
      return algosdk.TransactionType.pay
    case algosdk.ABITransactionType.keyreg:
      return algosdk.TransactionType.keyreg
    case algosdk.ABITransactionType.acfg:
      return algosdk.TransactionType.acfg
    case algosdk.ABITransactionType.axfer:
      return algosdk.TransactionType.axfer
    case algosdk.ABITransactionType.afrz:
      return algosdk.TransactionType.afrz
    case algosdk.ABITransactionType.appl:
      return algosdk.TransactionType.appl
    default:
      return undefined
  }
}
