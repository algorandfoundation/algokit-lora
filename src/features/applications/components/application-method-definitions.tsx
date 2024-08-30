import { ArgumentDefinition, MethodDefinition, ReturnsDefinition } from '@/features/applications/models'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/features/common/components/accordion'
import { DescriptionList } from '@/features/common/components/description-list'
import { useMemo } from 'react'
import { Struct as StructType } from '@/features/app-interfaces/data/types/arc-32/application'

type Props = {
  abiMethodDefinitions: MethodDefinition[]
}

export function ApplicationMethodDefinitions({ abiMethodDefinitions }: Props) {
  return (
    <Accordion type="multiple">
      {abiMethodDefinitions.map((method, index) => (
        <Method method={method} key={index} />
      ))}
    </Accordion>
  )
}

function Method({ method }: { method: MethodDefinition }) {
  return (
    <AccordionItem value={method.signature}>
      <AccordionTrigger>
        <h3>{method.name}</h3>
      </AccordionTrigger>
      <AccordionContent>
        {method.description && <p className="mb-4">{method.description}</p>}
        <div className="space-y-4">
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

function Argument({ argument }: { argument: ArgumentDefinition }) {
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
    <div className="space-y-2">
      <h5 className="text-primary">{`Argument ${argument.index}`}</h5>
      <DescriptionList items={items} />
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
