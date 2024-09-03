import { ApplicationAbiMethods, ArgumentDefinition, MethodDefinition, ReturnsDefinition } from '@/features/applications/models'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/features/common/components/accordion'
import { DescriptionList } from '@/features/common/components/description-list'
import { useCallback, useMemo } from 'react'
import { Struct as StructType, DefaultArgument as DefaultArgumentType } from '@/features/app-interfaces/data/types/arc-32/application'
import { Form } from '@/features/forms/components/form'
import { zfd } from 'zod-form-data'
import { FormActions } from '@/features/forms/components/form-actions'
import { Button } from '@/features/common/components/button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import algosdk from 'algosdk'
import { Path } from 'react-hook-form'
import { algorandClient } from '@/features/common/data/algo-client'
import { useWallet } from '@txnlab/use-wallet'
import { numberSchema } from '@/features/forms/data/common'
import { ApplicationId } from '../data/types'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { invariant } from '@/utils/invariant'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'
import { ABIAppCallArg } from '@algorandfoundation/algokit-utils/types/app'

type Props = {
  applicationId: ApplicationId
  abiMethods: ApplicationAbiMethods // TODO: NC - Get the naming right
}

// TODO: NC - ABI Methods?
export function ApplicationMethodDefinitions({ applicationId, abiMethods }: Props) {
  return (
    <Accordion type="multiple">
      {abiMethods.methods.map((method, index) => (
        <Method
          applicationId={applicationId}
          method={method}
          appSpec={abiMethods.type === 'arc32' ? abiMethods.appSpec : undefined}
          key={index}
        />
      ))}
    </Accordion>
  )
}

const uintSchema = z.number().min(0).max(255)

type MethodProps = {
  applicationId: ApplicationId
  method: MethodDefinition
  appSpec?: Arc32AppSpec // TODO: NC - We don't really need to support ARC4 here, so think about this, we need to support arc56 though
}

const argumentFieldPath = (methodName: string, argumentIndex: number) => `${methodName}-${argumentIndex}`
const extractArgumentIndex = (path: string) => parseInt(path.split('-')[1])

function Method({ applicationId, method, appSpec }: MethodProps) {
  const { activeAddress, signer } = useWallet()

  const schema = useMemo(() => {
    return zfd.formData(
      method.arguments.reduce(
        (acc, arg, index) => {
          let fieldSchema: z.ZodTypeAny = zfd.text()

          // TODO: NC - Handle read-only methods
          if (arg.type instanceof algosdk.ABIUintType) {
            fieldSchema = numberSchema(arg.hint?.defaultArgument ? uintSchema.optional() : uintSchema)
          }

          return {
            ...acc,
            [argumentFieldPath(method.name, index)]: fieldSchema,
          }
        },
        {} as Record<string, z.ZodTypeAny>
      )
    )
  }, [method.arguments, method.name])

  const sendMethodCall = useCallback(
    async (data: z.infer<typeof schema>) => {
      invariant(appSpec, 'An ARC-32 app spec is required when calling ABI methods')

      const methodArgs = Object.entries(data).reduce((acc, [key, value]) => {
        const index = extractArgumentIndex(key)
        acc[index] = value as ABIAppCallArg
        return acc
      }, [] as ABIAppCallArg[])

      const client = algorandClient.client.getAppClientById({
        id: applicationId,
        app: appSpec as AppSpec,
      })

      // TODO: NC - Increase valid rounds, to allow time for signing
      // TODO: NC - Move to the new AlgorandClient approach when ready
      await client.call({
        method: method.name,
        methodArgs,
        sender: {
          addr: activeAddress!, // TODO: NC - Handle this properly
          signer,
        },
      })

      // TODO: NC - Show success message
      // TODO: NC - Render the transaction ID + graph

      // TODO: NC - Do we need to allow opt-in to the app? Only needed when the app uses local state. Probably a new story.
    },
    [activeAddress, appSpec, applicationId, method.name, signer]
  )

  return (
    <AccordionItem value={method.signature}>
      <AccordionTrigger>
        <h3>{method.name}</h3>
      </AccordionTrigger>
      <AccordionContent>
        {method.description && <p className="mb-4">{method.description}</p>}
        <Form
          schema={schema}
          onSubmit={sendMethodCall}
          formAction={(ctx, resetLocalState) => (
            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetLocalState()
                  ctx.reset()
                }}
              >
                Reset
              </Button>
              <SubmitButton>Send</SubmitButton>
            </FormActions>
          )}
        >
          {(helper) => (
            <>
              <div className="space-y-4">
                <h4 className="text-primary">Arguments</h4>
                {method.arguments.length > 0 ? (
                  method.arguments.map((argument, index) => (
                    <Argument key={index} index={index} methodName={method.name} argument={argument} helper={helper} />
                  ))
                ) : (
                  <p>No arguments</p>
                )}
              </div>
              <div className="mt-4">
                <Returns returns={method.returns} />
              </div>
            </>
          )}
        </Form>
      </AccordionContent>
    </AccordionItem>
  )
}

type ArgumentProps<TSchema extends z.ZodSchema> = {
  index: number
  methodName: string
  argument: ArgumentDefinition
  helper: FormFieldHelper<z.infer<TSchema>>
}

function Argument<TSchema extends z.ZodSchema>({ index, methodName, argument, helper }: ArgumentProps<TSchema>) {
  const items = useMemo(
    () => [
      ...(argument.name
        ? [
            {
              dt: 'Name',
              dd: argument.name,
            },
          ]
        : []),
      ...(argument.description
        ? [
            {
              dt: 'Description',
              dd: argument.description,
            },
          ]
        : []),
      {
        dt: 'Type',
        dd: argument.hint?.struct ? <Struct struct={argument.hint.struct} /> : argument.type.toString(),
      },
      ...(argument.hint?.defaultArgument
        ? [
            {
              dt: 'Default Argument',
              dd: <DefaultArgument defaultArgument={argument.hint.defaultArgument} />,
            },
          ]
        : []),
    ],
    [argument.description, argument.hint, argument.name, argument.type]
  )

  return (
    <div className="space-y-2">
      <h5 className="text-primary">{`Argument ${index + 1}`}</h5>
      <DescriptionList items={items} />
      <ArgumentField index={index} methodName={methodName} argument={argument} helper={helper} />
    </div>
  )
}

function ArgumentField<TSchema extends z.ZodSchema, TData = z.infer<TSchema>>({
  index,
  methodName,
  argument,
  helper,
}: ArgumentProps<TSchema>) {
  if (argument.type instanceof algosdk.ABIUintType) {
    return helper.numberField({
      label: 'Value',
      field: argumentFieldPath(methodName, index) as Path<TData>,
      placeholder: argument.description,
    })
  }

  return undefined
}

function Returns({ returns }: { returns: ReturnsDefinition }) {
  const items = useMemo(
    () => [
      ...(returns.description
        ? [
            {
              dt: 'Description',
              dd: returns.description,
            },
          ]
        : []),
      {
        dt: 'Type',
        dd: returns.hint ? <Struct struct={returns.hint.struct} /> : returns.type.toString(),
      },
    ],
    [returns.description, returns.hint, returns.type]
  )
  return (
    <>
      <h4 className="text-primary">Return</h4>
      <DescriptionList items={items} />
    </>
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
