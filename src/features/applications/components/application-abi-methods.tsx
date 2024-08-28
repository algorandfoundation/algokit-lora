import { Application } from '@/features/applications/models'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/features/common/components/accordion'
import algosdk from 'algosdk'
import { DescriptionList } from '@/features/common/components/description-list'
import { useMemo } from 'react'

type Props = {
  application: Application
}

export function ApplicationAbiMethods({ application }: Props) {
  return (
    <Accordion type="multiple">
      {application.abiMethods.map((abiMethod, index) => (
        <Method abiMethod={abiMethod} key={index} />
      ))}
    </Accordion>
  )
}

export function Method({ abiMethod }: { abiMethod: algosdk.ABIMethod }) {
  const signature = abiMethod.getSignature()
  return (
    <AccordionItem value={signature}>
      <AccordionTrigger>
        <h3>{abiMethod.name}</h3>
      </AccordionTrigger>
      <AccordionContent>
        {abiMethod.description && <p className="mb-4">{abiMethod.description}</p>}
        <div className="space-y-2">
          <h4 className="text-primary">Arguments</h4>
          {abiMethod.args.length > 0 && (
            <>
              {abiMethod.args.map((argument, index) => (
                <Argument argument={argument} key={index} index={index + 1} />
              ))}
            </>
          )}
          {abiMethod.args.length === 0 && <p>No arguments</p>}
        </div>
        <div className="mt-4">
          <Return returnType={abiMethod.returns} />
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export function Argument({ argument, index }: { argument: algosdk.ABIMethod['args'][0]; index: number }) {
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
        dd: argument.type.toString(),
      },
    ],
    [argument.description, argument.name, argument.type]
  )

  return (
    <>
      <h5 className="text-primary">Argument {index}</h5>
      <DescriptionList items={items} />
    </>
  )
}

export function Return({ returnType }: { returnType: algosdk.ABIMethod['returns'] }) {
  const items = useMemo(
    () => [
      ...(returnType.description
        ? [
            {
              dt: 'Description',
              dd: returnType.description,
            },
          ]
        : []),
      {
        dt: 'Type',
        dd: returnType.type.toString(),
      },
    ],
    [returnType.description, returnType.type]
  )
  return (
    <>
      <h4 className="text-primary">Return</h4>
      <DescriptionList items={items} />
    </>
  )
}
