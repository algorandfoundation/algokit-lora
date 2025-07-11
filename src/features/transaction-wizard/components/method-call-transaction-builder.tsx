import algosdk from 'algosdk'
import { bigIntSchema, numberSchema } from '@/features/forms/data/common'
import {
  commonSchema,
  onCompleteFieldSchema,
  onCompleteOptions as _onCompleteOptions,
  senderFieldSchema,
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
import { TransactionBuilderFeeField } from '@/features/transaction-wizard/components/transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from '@/features/transaction-wizard/components/transaction-builder-valid-round-field'
import { DescriptionList } from '@/features/common/components/description-list'
import {
  BuildableTransactionType,
  BuildMethodCallTransactionResult,
  BuildTransactionResult,
  MethodForm,
  PlaceholderTransaction,
} from '../models'
import { StructDefinition } from '@/features/applications/components/struct-definition'
import { DefaultArgument } from '@/features/applications/components/default-argument'
import { asFieldInput, asMethodForm, methodArgPrefix } from '../mappers'
import { randomGuid } from '@/utils/random-guid'
import { TransactionBuilderMode, useLoadableArc56AppSpecWithMethodDefinitions } from '../data'
import { TransactionBuilderNoteField } from './transaction-builder-note-field'
import { invariant } from '@/utils/invariant'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/common/components/tooltip'
import { Info } from 'lucide-react'
import { ApplicationId } from '@/features/applications/data/types'
import { MethodDefinition } from '@/features/applications/models'
import { asAddressOrNfd } from '../mappers/as-address-or-nfd'
import { ActiveWalletAccount } from '@/features/wallet/types/active-wallet'
import { AbiFormItemValue } from '@/features/abi-methods/models'

const appCallFormSchema = {
  ...commonSchema,
  ...senderFieldSchema,
  ...onCompleteFieldSchema,
  applicationId: bigIntSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' })),
  methodName: zfd.text(),
  extraProgramPages: numberSchema(z.number().min(0).max(3).optional()),
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const baseFormData = zfd.formData(appCallFormSchema)

type Props = {
  mode: TransactionBuilderMode
  transaction?: BuildMethodCallTransactionResult
  activeAccount?: ActiveWalletAccount
  defaultValues?: Partial<BuildMethodCallTransactionResult>
  onSubmit: (transaction: BuildTransactionResult) => void
  onCancel: () => void
}

export function MethodCallTransactionBuilder({
  mode,
  transaction,
  activeAccount,
  defaultValues: _defaultValues,
  onSubmit,
  onCancel,
}: Props) {
  const initialValues = useMemo(() => {
    if (mode === TransactionBuilderMode.Edit && transaction) {
      return {
        applicationId: transaction.applicationId !== undefined ? transaction.applicationId : undefined,
        methodName: transaction.methodDefinition.name,
        appSpec: transaction.appSpec,
      }
    }

    return {
      applicationId: _defaultValues?.applicationId !== undefined ? _defaultValues.applicationId : undefined,
      methodName: _defaultValues?.methodDefinition?.name,
      appSpec: _defaultValues?.appSpec,
    }
  }, [_defaultValues?.appSpec, _defaultValues?.applicationId, _defaultValues?.methodDefinition?.name, mode, transaction])

  const [appId, setAppId] = useState<ApplicationId | undefined>(initialValues.applicationId)
  const [methodName, setMethodName] = useState<string | undefined>(initialValues.methodName)
  const loadableArc56ContractWithMethodDefinitions = useLoadableArc56AppSpecWithMethodDefinitions(initialValues.appSpec, appId)

  const { appSpec, methodDefinitions } = useMemo(() => {
    if (loadableArc56ContractWithMethodDefinitions.state !== 'hasData' || !loadableArc56ContractWithMethodDefinitions.data) {
      return {
        appSpec: undefined,
        methodDefinitions: [],
      }
    }

    return {
      appSpec: loadableArc56ContractWithMethodDefinitions.data.appSpec,
      methodDefinitions: loadableArc56ContractWithMethodDefinitions.data.methodDefinitions.filter((method) =>
        appId === 0n ? (method.callConfig?.create ?? []).length > 0 : (method.callConfig?.call ?? []).length > 0
      ),
    }
  }, [appId, loadableArc56ContractWithMethodDefinitions])

  const methodDefinition = useMemo(() => {
    if (!methodName || methodDefinitions.length === 0 || !appSpec) {
      return undefined
    }
    return methodDefinitions.find((method) => method.name === methodName)
  }, [appSpec, methodDefinitions, methodName])

  const methodForm = useMemo(() => {
    return methodDefinition ? asMethodForm(methodDefinition) : undefined
  }, [methodDefinition])

  const formData = useMemo(() => {
    if (!methodForm) {
      return zfd.formData(appCallFormSchema)
    }

    return zfd.formData({
      ...appCallFormSchema,
      ...methodForm.schema,
    })
  }, [methodForm])

  const submit = useCallback(
    async (values: z.infer<typeof formData>) => {
      invariant(methodDefinition, 'Method is required')
      invariant(methodForm, 'Method form is required')

      const methodCallTransactionId = transaction?.id ?? randomGuid()

      const methodArgs = methodForm.arguments.map((arg, index) => {
        const value = values[`${methodArgPrefix}-${index}` as keyof z.infer<typeof formData>]
        if ('getAppCallArg' in arg) {
          return arg.getAppCallArg(value as AbiFormItemValue)
        } else {
          if (mode === TransactionBuilderMode.Create || (transaction && values.methodName !== transaction.methodDefinition.name)) {
            return {
              id: randomGuid(),
              type: BuildableTransactionType.Placeholder,
              targetType: arg.type,
            } satisfies PlaceholderTransaction
          } else {
            return transaction!.methodArgs[index]
          }
        }
      })

      const methodCallTxn = {
        id: methodCallTransactionId,
        type: BuildableTransactionType.MethodCall,
        applicationId: BigInt(values.applicationId),
        methodDefinition: methodDefinition,
        onComplete: Number(values.onComplete),
        sender: values.sender,
        extraProgramPages: values.extraProgramPages,
        appSpec: appSpec!,
        methodArgs: methodArgs,
        fee: values.fee,
        validRounds: values.validRounds,
        note: values.note,
      } satisfies BuildMethodCallTransactionResult

      onSubmit(methodCallTxn)
    },
    [methodDefinition, methodForm, transaction, appSpec, onSubmit, mode]
  )

  const defaultValues = useMemo<Partial<z.infer<typeof baseFormData>>>(() => {
    if (mode === TransactionBuilderMode.Edit && transaction) {
      const methodArgs = transaction.methodArgs?.reduce(
        (acc, arg, index) => {
          const { type } = transaction.methodDefinition.arguments[index]
          const field = `${methodArgPrefix}-${index}${type instanceof algosdk.ABIAddressType || type === algosdk.ABIReferenceType.account ? '.value' : ''}`
          if (!algosdk.abiTypeIsTransaction(type)) {
            acc[field] = asFieldInput(type, arg as algosdk.ABIValue)
          } else {
            acc[field] = arg
          }
          return acc
        },
        {} as Record<string, unknown>
      )
      return {
        applicationId: transaction.applicationId !== undefined ? BigInt(transaction.applicationId) : undefined,
        sender: transaction.sender,
        onComplete: transaction.onComplete.toString(),
        methodName: transaction.methodDefinition.name,
        extraProgramPages: transaction.extraProgramPages,
        fee: transaction.fee,
        validRounds: transaction.validRounds,
        note: transaction.note,
        ...methodArgs,
      }
    }
    return {
      sender: activeAccount ? asAddressOrNfd(activeAccount) : undefined,
      fee: {
        setAutomatically: true,
      },
      validRounds: {
        setAutomatically: true,
      },
      methodName: _defaultValues?.methodDefinition?.name,
      applicationId: _defaultValues?.applicationId !== undefined ? BigInt(_defaultValues.applicationId) : undefined,
      onComplete: _defaultValues?.onComplete != undefined ? _defaultValues?.onComplete.toString() : undefined,
    }
  }, [mode, transaction, activeAccount, _defaultValues])

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
      {(helper) => (
        <FormInner
          helper={helper}
          onAppIdChanged={setAppId}
          onMethodNameChanged={setMethodName}
          methodDefinitions={methodDefinitions}
          selectedMethodForm={methodForm}
        />
      )}
    </Form>
  )
}

type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof baseFormData>>
  onAppIdChanged: (appId: ApplicationId) => void
  onMethodNameChanged: (methodName?: string) => void
  methodDefinitions: MethodDefinition[]
  selectedMethodForm: MethodForm | undefined
}

function FormInner({ helper, onAppIdChanged, onMethodNameChanged, methodDefinitions, selectedMethodForm }: FormInnerProps) {
  const { watch, setValue, getValues, unregister } = useFormContext<z.infer<typeof baseFormData>>()
  const appId = watch('applicationId')
  const methodName = watch('methodName')

  useEffect(() => {
    onAppIdChanged(appId)
  }, [appId, onAppIdChanged])

  useEffect(() => {
    onMethodNameChanged(methodName)
  }, [methodName, onMethodNameChanged])

  useEffect(() => {
    // Clear method specific args when the method is changed
    if (selectedMethodForm !== undefined && methodName !== selectedMethodForm.name) {
      const values = getValues()
      for (const key of Object.keys(values).filter((key) => key.startsWith(methodArgPrefix))) {
        unregister(key as Path<z.infer<typeof baseFormData>>)
      }
    }
  }, [getValues, methodName, selectedMethodForm, unregister])

  useEffect(() => {
    // Set the onComplete field when the user changes the method or they are first selecting the method
    if (
      (selectedMethodForm !== undefined && methodName !== selectedMethodForm.name) ||
      (selectedMethodForm === undefined && methodName !== undefined)
    ) {
      const selectedMethodDefinition = methodDefinitions.find((method) => {
        return method.name === methodName
      })
      if (selectedMethodDefinition !== undefined) {
        const defaultOnComplete =
          appId === 0n
            ? (selectedMethodDefinition.callConfig?.create ?? []).length > 0
              ? selectedMethodDefinition.callConfig?.create[0]
              : undefined
            : (selectedMethodDefinition?.callConfig?.call ?? []).length > 0
              ? selectedMethodDefinition?.callConfig?.call[0]
              : undefined
        if (defaultOnComplete !== undefined) {
          // The setTimeout is needed to ensure the select list options have updated before setting the value, otherwise it isn't selected in the UI
          setTimeout(() => {
            setValue('onComplete', defaultOnComplete.toString())
          }, 10)
        }
      }
    }
  }, [appId, methodDefinitions, methodName, selectedMethodForm, setValue])

  const abiMethodArgs = useMemo(() => {
    return (
      selectedMethodForm?.arguments.map((arg) => ({
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
            dd: arg.struct ? (
              <StructDefinition struct={arg.struct} />
            ) : algosdk.abiTypeIsTransaction(arg.type) ? (
              <div className="flex items-center gap-1.5">
                <span>{arg.type.toString()}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="inline" size={16} />
                  </TooltipTrigger>
                  <TooltipContent>Transaction arguments are built in the top level group</TooltipContent>
                </Tooltip>
              </div>
            ) : (
              arg.type.toString()
            ),
          },
          ...(arg.defaultArgument
            ? [
                {
                  dt: 'Default',
                  dd: <DefaultArgument defaultArgument={arg.defaultArgument} />,
                },
              ]
            : []),
        ],
        field: arg.createField(helper),
      })) ?? []
    )
  }, [selectedMethodForm?.arguments, helper])

  const onCompleteOptions = useMemo(() => {
    return _onCompleteOptions.filter((x) => {
      if (!selectedMethodForm) {
        return false
      } else if (!selectedMethodForm?.callConfig) {
        return true
      } else if (appId === 0n && selectedMethodForm?.callConfig?.create.includes(Number(x.value) as algosdk.OnApplicationComplete)) {
        return true
      } else if (selectedMethodForm?.callConfig.call.includes(Number(x.value) as algosdk.OnApplicationComplete)) {
        return true
      }
      return false
    })
  }, [appId, selectedMethodForm])

  return (
    <div className="space-y-4">
      {appId !== 0n &&
        helper.numberField({
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
      {helper.addressField({
        field: 'sender',
        label: 'Sender',
        helpText: 'Account to call from. Sends the transaction and pays the fee',
      })}
      {appId === 0n &&
        helper.numberField({
          field: 'extraProgramPages',
          label: 'Extra program pages',
          helpText: 'Number of additional pages allocated to the programs. If empty this will be calculated automatically',
        })}
      {abiMethodArgs.map((arg, index) => (
        <div key={`${methodName}-arg-${index}`} className="relative space-y-1.5 text-sm [&_label]:mt-1.5">
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
