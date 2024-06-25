import SvgAlgorand from './icons/algorand'
import { cn } from '../utils'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { compactAmount } from '@/utils/compact-amount'

export type Props = {
  className?: string
  amount: AlgoAmount
  short?: boolean
}

export function DisplayAlgo({ className, amount, short }: Props) {
  const amountToDisplay = short ? compactAmount(amount.algos) : amount.algos.toString()
  return (
    <div className={cn('inline-flex gap-0.5', className)}>
      {amountToDisplay}
      <SvgAlgorand className="h-auto w-2.5" />
    </div>
  )
}
