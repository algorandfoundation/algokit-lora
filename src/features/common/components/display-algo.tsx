import SvgAlgorand from './icons/algorand'
import { cn } from '../utils'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/amount'
import { compactAmount } from '@/utils/compact-amount'
import { formatDecimalAmount } from '@/utils/number-format'
import Decimal from 'decimal.js'

export type Props = {
  className?: string
  amount: AlgoAmount
  short?: boolean
}

export function DisplayAlgo({ className, amount, short }: Props) {
  const amountToDisplay = short ? compactAmount(amount.algos) : formatDecimalAmount(new Decimal(amount.algos.toString()))
  return (
    <div className={cn('inline-flex gap-0.5', className)}>
      {amountToDisplay}
      <SvgAlgorand className="h-auto w-2.5" />
    </div>
  )
}
