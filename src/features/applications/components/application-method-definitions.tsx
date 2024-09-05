import { ApplicationAbiMethods, ArgumentDefinition, MethodDefinition, ReturnsDefinition } from '@/features/applications/models'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/features/common/components/accordion'
import { DescriptionList } from '@/features/common/components/description-list'
import { useCallback, useMemo } from 'react'
import { Struct as StructType, DefaultArgument as DefaultArgumentType } from '@/features/app-interfaces/data/types/arc-32/application'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { Button } from '@/features/common/components/button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { algorandClient } from '@/features/common/data/algo-client'
import { useWallet } from '@txnlab/use-wallet'
import { ApplicationId } from '../data/types'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { invariant } from '@/utils/invariant'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'
import { ABIAppCallArg } from '@algorandfoundation/algokit-utils/types/app'
import { extractArgumentIndexFromFieldPath } from '../mappers'

type Props<TSchema extends z.ZodSchema> = {
  applicationId: ApplicationId
  abiMethods: ApplicationAbiMethods<TSchema> // TODO: NC - Get the naming right
}

// TODO: NC - ABI Methods?
export function ApplicationMethodDefinitions<TSchema extends z.ZodSchema>({ applicationId, abiMethods }: Props<TSchema>) {
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

type MethodProps<TSchema extends z.ZodSchema> = {
  applicationId: ApplicationId
  method: MethodDefinition<TSchema>
  appSpec?: Arc32AppSpec // TODO: NC - We don't really need to support ARC4 here, so think about this, we need to support arc56 though
}

function Method<TSchema extends z.ZodSchema>({ applicationId, method, appSpec }: MethodProps<TSchema>) {
  const { activeAddress, signer } = useWallet()

  type TData = z.infer<typeof method.schema>

  const sendMethodCall = useCallback(
    async (data: TData) => {
      invariant(appSpec, 'An ARC-32 app spec is required when calling ABI methods')

      const methodArgs = Object.entries(data).reduce((acc, [path, value]) => {
        const index = extractArgumentIndexFromFieldPath(path)
        acc[index] = method.arguments[index].getAppCallArg(value)
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
    [activeAddress, appSpec, applicationId, method.arguments, method.name, signer]
  )

  return (
    <AccordionItem value={method.signature}>
      <AccordionTrigger>
        <h3>{method.name}</h3>
      </AccordionTrigger>
      <AccordionContent>
        {method.description && <p className="mb-4">{method.description}</p>}
        <Form
          schema={method.schema}
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
                  method.arguments.map((argument, index) => <Argument key={index} index={index} argument={argument} helper={helper} />)
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
  argument: ArgumentDefinition<TSchema>
  helper: FormFieldHelper<z.infer<TSchema>>
}

function Argument<TSchema extends z.ZodSchema>({ index, argument, helper }: ArgumentProps<TSchema>) {
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
      {argument.createField(helper)}
    </div>
  )
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
