import { bigIntSchema } from '@/features/forms/data/common'
import { senderFieldSchema, feeFieldSchema, validRoundsFieldSchema, noteFieldSchema } from '@/features/transaction-wizard/data/common'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { Form } from '@/features/forms/components/form'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { useFormContext } from 'react-hook-form'
import { useLoadableAbiMethodDefinitions } from '../data/application-method-definitions'
import { TransactionBuilderFeeField } from '@/features/transaction-wizard/components/transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from '@/features/transaction-wizard/components/transaction-builder-valid-round-field'
import { asField, extractArgumentIndexFromFieldPath } from '../mappers'
import { Struct as StructType, DefaultArgument as DefaultArgumentType } from '@/features/app-interfaces/data/types/arc-32/application'
import { DescriptionList } from '@/features/common/components/description-list'
import { AppClientMethodCallParamsArgs, ApplicationId } from '../data/types'
import { ArgumentFormDefinition, MethodFormDefinition } from '../models'
import { Address } from 'cluster'

type Props = {
  onSubmit: (transaction: AppCallTransaction) => void
  onCancel: () => void
}

export function TransactionBuilderForm({ onSubmit, onCancel }: Props) {
  return <AppCallForm onSubmit={onSubmit} onCancel={onCancel} />
}

const appCallZodSchema = {
  ...senderFieldSchema,
  appId: bigIntSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' })),
  // TODO: PD - JSON serialisation of app args should exclude the ids
  appArgs: zfd.repeatableOfType(
    z.object({
      id: z.string(),
      value: zfd.text(),
    })
  ),
  ...feeFieldSchema,
  ...validRoundsFieldSchema,
  ...noteFieldSchema,
}
const baseFormSchema = zfd.formData(appCallZodSchema)

type AppCallFormProps = {
  onSubmit: (transaction: AppCallTransaction) => void
  onCancel: () => void
}

export type AppCallTransaction = {
  applicationId: ApplicationId
  sender: Address
  fees: {
    setAutomatically: boolean
    value?: number
  }
  validRounds: {
    setAutomatically: boolean
    firstValid?: number
    lastValid?: number
  }
  note?: string
  methodName?: string
  methodArgs?: AppClientMethodCallParamsArgs[]
  rawArgs?: string[]
}

function AppCallForm({ onSubmit, onCancel }: AppCallFormProps) {
  const [abiMethod, setAbiMethod] = useState<MethodFormDefinition | undefined>(undefined)
  const [zodSchema, setZodSchema] = useState(appCallZodSchema)

  const formSchema = useMemo(() => {
    return zfd.formData(zodSchema)
  }, [zodSchema])

  const submit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      if (abiMethod) {
        const methodArgs = await Object.entries(values).reduce(
          async (asyncAcc, [path, value]) => {
            if (!path.startsWith('field-')) {
              return asyncAcc
            }
            const acc = await asyncAcc
            const index = extractArgumentIndexFromFieldPath(path)
            acc[index] = await abiMethod.arguments[index].getAppCallArg(value)
            return acc
          },
          Promise.resolve([] as AppClientMethodCallParamsArgs[])
        )
        const fields = Object.entries(values).reduce((acc, [path, value]) => {
          if (!path.startsWith('field-')) {
            return { ...acc, [path]: value }
          }
          return acc
        }, {})

        // TODO: fix type
        onSubmit({ ...fields, methodArgs } as unknown as AppCallTransaction)
      }
    },
    [abiMethod, onSubmit]
  )

  const updateAbiMethod = useCallback((method: MethodFormDefinition | undefined) => {
    if (!method) {
      setZodSchema(appCallZodSchema)
      setAbiMethod(undefined)
    } else {
      setZodSchema((prev) => {
        return {
          ...prev,
          ...method.schema,
        }
      })
      setAbiMethod(method)
    }
  }, [])

  return (
    <Form
      schema={formSchema}
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
      {(helper) => <AppCallFormInner helper={helper} abiMethod={abiMethod} updateAbiMethod={updateAbiMethod} />}
    </Form>
  )
}
function AppCallFormInner({
  helper,
  abiMethod,
  updateAbiMethod,
}: {
  helper: FormFieldHelper<z.infer<typeof baseFormSchema>>
  abiMethod: MethodFormDefinition | undefined
  updateAbiMethod: (method: MethodFormDefinition | undefined) => void
}) {
  const { watch } = useFormContext<z.infer<typeof baseFormSchema>>()
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
      updateAbiMethod(undefined)
      return
    }

    // TODO: PD - move to mapper
    const args = method.arguments.map((arg, index) => {
      const field = asField(method.name, arg, index)
      return {
        ...arg,
        ...field,
      } satisfies ArgumentFormDefinition
    })
    const methodSchema = args.reduce((acc, arg, index) => {
      return {
        ...acc,
        [`field-${index}`]: arg.fieldSchema,
      }
    }, {})

    const methodFormDefinition = {
      name: method.name,
      signature: method.signature,
      description: method.description,
      arguments: args,
      schema: methodSchema,
      defaultValues: {}, // TODO: PD - default values??
      returns: method.returns,
    } satisfies MethodFormDefinition

    updateAbiMethod(methodFormDefinition)
  }, [method, updateAbiMethod])

  const abiMethodArgs = useMemo(() => {
    return (
      abiMethod?.arguments.map((arg) => ({
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
  }, [abiMethod?.arguments, helper])

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
      <TransactionBuilderFeeField helper={helper} path={'fee'} field={{ label: 'Fee' }} />
      <TransactionBuilderValidRoundField helper={helper} path={'validRounds'} field={{ label: 'Valid Rounds' }} />
    </div>
  )
}

function Struct({ struct }: { struct: StructType }) {
  return (
    <div>
      <span>{struct.name}:</span>
      <ul className="pl-4">
        {struct.elements.map((element, index) => (
          <li key={index}>
            {element[0]}: {element[1]}
          </li>
        ))}
      </ul>
    </div>
  )
}

function DefaultArgument({ defaultArgument }: { defaultArgument: DefaultArgumentType }) {
  return (
    <DescriptionList
      items={[
        {
          dt: 'Source',
          dd: defaultArgument.source,
        },
        {
          dt: 'Data',
          dd: defaultArgument.source === 'abi-method' ? defaultArgument.data.name : defaultArgument.data,
        },
      ]}
    />
  )
}
