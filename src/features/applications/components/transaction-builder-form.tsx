import { BuildableTransactionType } from '@/features/transaction-wizard/models'
import { Arc32AppSpec, Arc4AppSpec } from '@/features/app-interfaces/data/types'
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
import { createApplicationMethodDefinitionsAtom, useLoadableAbiMethodDefinitions } from '../data/application-method-definitions'
import { useAtomValue } from 'jotai'
import { loadable } from 'jotai/utils'
import { TransactionBuilderFeeField } from '@/features/transaction-wizard/components/transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from '@/features/transaction-wizard/components/transaction-builder-valid-round-field'
import { asField } from '../mappers'
import { Struct as StructType, DefaultArgument as DefaultArgumentType } from '@/features/app-interfaces/data/types/arc-32/application'
import { DescriptionList, DescriptionListProps } from '@/features/common/components/description-list'
import { isDefined } from '@/utils/is-defined'

type Props = {
  onSubmit: (n: number) => void
  onCancel: () => void
}

export function TransactionBuilderForm({ onSubmit, onCancel }: Props) {
  return <AppCallForm onSubmit={() => {}} onCancel={onCancel} />
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
  onSubmit: () => Promise<void> | void
  onCancel: () => void
}

function AppCallForm({ onSubmit, onCancel }: AppCallFormProps) {
  const [zodSchema, setZodSchema] = useState(appCallZodSchema)
  console.log(zodSchema)

  const formSchema = useMemo(() => {
    return zfd.formData(zodSchema)
  }, [zodSchema])

  const submit = useCallback((values: z.infer<typeof formSchema>) => {
    console.log('submit', values)
  }, [])

  const updateMethodArgsSchema = useCallback((fieldsSchema: Record<string, z.ZodTypeAny>) => {
    console.log('updateMethodArgsSchema', fieldsSchema)
    setZodSchema((prev) => {
      return {
        ...prev,
        ...fieldsSchema,
      }
    })
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
      {(helper) => <AppCallFormInner helper={helper} schema={formSchema} updateMethodArgsSchema={updateMethodArgsSchema} />}
    </Form>
  )
}
function AppCallFormInner({
  helper,
  schema,
  updateMethodArgsSchema,
}: {
  helper: FormFieldHelper<z.infer<typeof baseFormSchema>>
  schema: z.ZodEffects<any, typeof baseFormSchema, unknown>
  updateMethodArgsSchema: (fieldsSchema: Record<string, z.ZodTypeAny>) => void
}) {
  const [args, setArgs] = useState<
    {
      descriptions: DescriptionListProps['items']
      field: ReturnType<typeof asField>
    }[]
  >([])

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
      setArgs([])
      updateMethodArgsSchema({})
      return
    }

    const methodArgs = method.arguments.map((arg, index) => ({
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
      field: asField(method.name, arg, index),
    }))

    console.log('methodArgs', methodArgs)

    if (methodArgs.length > 0) {
      const fieldsSchema = methodArgs.reduce((acc, arg, index) => {
        return {
          ...acc,
          [`field-${index}`]: arg.field.fieldSchema,
        }
      }, {})
      console.log('call update')
      setArgs(methodArgs)
      updateMethodArgsSchema(fieldsSchema)
    } else {
      setArgs([])
      updateMethodArgsSchema({})
    }
  }, [method, updateMethodArgsSchema])

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
      {args.map((arg, index) => (
        <div key={index}>
          <h5 className="text-primary">{`Argument ${index + 1}`}</h5>
          <DescriptionList items={arg.descriptions} />
          <Fragment>{arg.field.createField(helper)}</Fragment>
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
