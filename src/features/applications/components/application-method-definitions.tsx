import { ApplicationAbiMethods, ArgumentDefinition, MethodDefinition, ReturnsDefinition } from '@/features/applications/models'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/features/common/components/accordion'
import { DescriptionList } from '@/features/common/components/description-list'
import { useCallback, useMemo, useState } from 'react'
import { ApplicationId } from '../data/types'
import { Button } from '@/features/common/components/button'
import { DialogBodyProps, useDialogForm } from '@/features/common/hooks/use-dialog-form'
import { TransactionBuilderForm } from './transaction-builder-form'
import { Struct } from '@/features/abi-methods/components/struct'
import { DefaultArgument } from '@/features/abi-methods/components/default-value'
import { AppCallTransactionBuilderResult } from '@/features/transaction-wizard/models'

type Props = {
  applicationId: ApplicationId
  abiMethods: ApplicationAbiMethods // TODO: NC - Get the naming right
}

// TODO: NC - ABI Methods?
export function ApplicationMethodDefinitions({ abiMethods }: Props) {
  return (
    <Accordion type="multiple">
      {abiMethods.methods.map((method, index) => (
        <Method method={method} key={index} />
      ))}
    </Accordion>
  )
}

type MethodProps = {
  method: MethodDefinition
}

function Method({ method }: MethodProps) {
  const [transactions, setTransactions] = useState<AppCallTransactionBuilderResult[]>([])

  const { open, dialog } = useDialogForm({
    dialogHeader: 'Transaction Builder',
    dialogBody: (props: DialogBodyProps<number, AppCallTransactionBuilderResult>) => (
      <TransactionBuilderForm onCancel={props.onCancel} onSubmit={props.onSubmit} />
    ),
  })

  const openDialog = useCallback(async () => {
    const foo = await open(1)
    console.log('foo', foo)
    if (foo) {
      setTransactions((prev) => [...prev, foo])
    }
  }, [open])

  const send = useCallback(() => {}, [])

  return (
    <AccordionItem value={method.signature}>
      <AccordionTrigger>
        <h3>{method.name}</h3>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        {method.description && <p className="mb-4">{method.description}</p>}
        <div>
          <h4 className="text-primary">Arguments</h4>
          {method.arguments.map((argument, index) => (
            <Argument key={index} index={index} argument={argument} />
          ))}
        </div>
        <Returns returns={method.returns} />
        <div className="flex justify-end">
          {transactions.length === 0 && (
            <Button variant="default" onClick={openDialog}>
              Call
            </Button>
          )}
          {transactions.length > 0 && (
            <Button variant="default" onClick={send}>
              Send
            </Button>
          )}
        </div>
        {dialog}
      </AccordionContent>
    </AccordionItem>
  )
}

type ArgumentProps = {
  index: number
  argument: ArgumentDefinition
}

function Argument({ index, argument }: ArgumentProps) {
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
    <div>
      <h4 className="text-primary">Return</h4>
      <DescriptionList items={items} />
    </div>
  )
}
