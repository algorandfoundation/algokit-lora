import { Application } from '@/features/applications/models'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/features/common/components/accordion'
import algosdk from 'algosdk'
import { DescriptionList } from '@/features/common/components/description-list'
import { useMemo } from 'react'
import { invariant } from '@/utils/invariant'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { DefaultArgument, Struct as StructType } from '@/features/app-interfaces/data/types/arc-32/application'

type Props = {
  application: Application
}

type ArgumentHint = {
  struct?: StructType
  defaultValue?: DefaultArgument
}

type ArgumentDefinition = {
  index: number
  name?: string
  description?: string
  type: algosdk.ABIArgumentType
  hint?: ArgumentHint
}

type ReturnsHint = {
  struct: StructType
}

type ReturnsDefinition = {
  description?: string
  type: algosdk.ABIReturnType
  hint?: ReturnsHint
}

// TODO: refactor out to a mapper, likely merge it into the application model
type MethodDefinition = {
  name: string
  signature: string
  description?: string
  arguments: ArgumentDefinition[]
  returns: ReturnsDefinition
}

export function ApplicationAbiMethods({ application }: Props) {
  const methods = useMemo(() => {
    invariant(application.appSpec, 'application.appSpec is not set')
    return getMethodDefinitions(application.appSpec)
  }, [application.appSpec])

  return (
    <Accordion type="multiple">
      {methods.map((method, index) => (
        <Method method={method} key={index} />
      ))}
    </Accordion>
  )
}

const getMethodDefinitions = (appSpec: Arc32AppSpec): MethodDefinition[] => {
  return appSpec.contract.methods.map((method) => {
    // TODO: don't need to pass the entire method in
    const abiMethod = new algosdk.ABIMethod(method)
    const signature = abiMethod.getSignature()
    const hint = appSpec.hints ? appSpec.hints[signature] : undefined

    return {
      name: abiMethod.name,
      signature: signature,
      description: abiMethod.description,
      arguments: abiMethod.args.map((arg, index) => ({
        index: index + 1,
        name: arg.name,
        description: arg.description,
        type: arg.type,
        hint:
          hint && arg.name && (hint.structs?.[arg.name] || hint.default_arguments?.[arg.name])
            ? ({
                struct: hint.structs?.[arg.name],
                defaultValue: hint.default_arguments?.[arg.name],
              } satisfies ArgumentHint)
            : undefined,
      })),
      returns: {
        ...abiMethod.returns,
        hint:
          hint && hint.structs?.['output']
            ? {
                struct: hint.structs?.['output'],
              }
            : undefined,
      },
    } satisfies MethodDefinition
  })
}

export function Method({ method }: { method: MethodDefinition }) {
  return (
    <AccordionItem value={method.signature}>
      <AccordionTrigger>
        <h3>{method.name}</h3>
      </AccordionTrigger>
      <AccordionContent>
        {method.description && <p className="mb-4">{method.description}</p>}
        <div className="space-y-2">
          <h4 className="text-primary">Arguments</h4>
          {method.arguments.length > 0 && method.arguments.map((argument) => <Argument argument={argument} key={argument.index} />)}
          {method.arguments.length === 0 && <p>No arguments</p>}
        </div>
        <div className="mt-4">
          <Returns returns={method.returns} />
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export function Argument({ argument }: { argument: ArgumentDefinition }) {
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
    ],
    [argument.description, argument.hint, argument.name, argument.type]
  )

  return (
    <>
      <h5 className="text-primary">Argument {argument.index}</h5>
      <DescriptionList items={items} />
    </>
  )
}

export function Returns({ returns }: { returns: ReturnsDefinition }) {
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

export function Struct({ struct }: { struct: StructType }) {
  return (
    <div>
      <span>{struct.name}</span>
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
