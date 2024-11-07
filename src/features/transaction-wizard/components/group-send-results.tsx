import { DecodedAbiMethodReturnValue } from '@/features/abi-methods/components/decoded-abi-method-return-value'
import { Button } from '@/features/common/components/button'
import { DescriptionList } from '@/features/common/components/description-list'
import { RenderInlineAsyncAtom } from '@/features/common/components/render-inline-async-atom'
import { TransactionsGraph, TransactionsGraphData } from '@/features/transactions-graph'
import { transactionIdLabel } from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { AppCallTransaction } from '@/features/transactions/models'
import { asJson } from '@/utils/as-json'
import algosdk from 'algosdk'
import { Download } from 'lucide-react'
import { useCallback } from 'react'

export const groupSendResultsLabel = 'Send Result'
export const groupSimulateResultsLabel = 'Simulation Result'

export type SendResults = {
  transactionGraph: TransactionsGraphData
  sentAppCalls: AppCallTransaction[]
  simulateResponse?: algosdk.modelsv2.SimulateResponse
}

export type Props = SendResults & {
  transactionGraphBgClassName?: string
}

const formatTimestampUtc = (date: Date): string => {
  // Get UTC components
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0') // Months are zero-based
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  // Format the datetime string
  return `${year}${month}${day}_${hours}${minutes}${seconds}`
}

const buildSimulateTraceFilename = (simulateResponse: algosdk.modelsv2.SimulateResponse) => {
  const timestamp = formatTimestampUtc(new Date())
  const txnGroups = simulateResponse.txnGroups
  const txnTypesCount = txnGroups.reduce(
    (
      acc: Map<
        string,
        {
          type: string
          count: number
        }
      >,
      txnGroup
    ) => {
      txnGroup.txnResults.forEach(({ txnResult }) => {
        const { type } = txnResult.txn.txn
        if (!acc.has(type)) {
          acc.set(type, { type, count: 0 })
        }
        const entry = acc.get(type)!
        entry.count++
      })
      return acc
    },
    new Map()
  )

  const txnTypesStr = Array.from(txnTypesCount.values())
    .map(({ count, type }) => `${count}${type}`)
    .join('_')

  const lastRound = simulateResponse.lastRound
  return `${timestamp}_lr${lastRound}_${txnTypesStr}.trace.avm.json`
}

export function GroupSendResults({ transactionGraph, transactionGraphBgClassName, sentAppCalls, simulateResponse }: Props) {
  const downloadSimulateTrace = useCallback(() => {
    if (!simulateResponse) return

    const file = new Blob([asJson(simulateResponse.get_obj_for_encoding())], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(file)
    link.setAttribute('download', buildSimulateTraceFilename(simulateResponse))
    // TODO: This approach won't work in Tauri, so we'll need to handle with Tauri's APIs
    link.click()
  }, [simulateResponse])

  return (
    <>
      <div className="my-4 flex flex-col gap-2 text-sm">
        <h3>{simulateResponse ? groupSimulateResultsLabel : groupSendResultsLabel}</h3>

        {simulateResponse && (
          <Button variant="outline" onClick={downloadSimulateTrace} className="mr-auto" icon={<Download size={16} />}>
            Download Trace
          </Button>
        )}
        <h4>Transaction Visual</h4>
        <TransactionsGraph
          transactionsGraphData={transactionGraph}
          downloadable={false}
          bgClassName={transactionGraphBgClassName}
          isSimulated={!!simulateResponse}
        />
      </div>
      {sentAppCalls.length > 0 && (
        <div className="mt-2 space-y-2">
          <h4>App Call Results</h4>
          <div className="space-y-4 text-sm">
            {sentAppCalls.map((sentTransaction, index) => (
              <RenderInlineAsyncAtom key={index} atom={sentTransaction.abiMethod}>
                {(abiMethod) =>
                  abiMethod ? (
                    <DescriptionList
                      items={[
                        {
                          dt: transactionIdLabel,
                          dd: simulateResponse ? (
                            sentTransaction.id
                          ) : (
                            <TransactionLink transactionId={sentTransaction.id} className="text-sm text-primary underline">
                              {sentTransaction.id}
                            </TransactionLink>
                          ),
                        },
                        {
                          dt: 'Method name',
                          dd: abiMethod.name,
                        },
                        {
                          dt: 'Return value',
                          dd: <DecodedAbiMethodReturnValue return={abiMethod.return} />,
                        },
                      ]}
                    />
                  ) : undefined
                }
              </RenderInlineAsyncAtom>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
