import SvgAlgorand from './icons/algorand'
import { cn } from '../utils'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'

export type Props = {
  className?: string
  amount: AlgoAmount
}

export function DisplayAlgo({ className, amount }: Props) {
  return (
    <div className={cn('inline-flex gap-0.5', className)}>
      {amount.algos}
      <SvgAlgorand className="h-auto w-2.5" />
    </div>
  )
}
