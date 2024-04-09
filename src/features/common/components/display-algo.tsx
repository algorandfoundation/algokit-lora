import SvgAlgorand from './icons/algorand'
import { cn } from '../utils'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'

export type Props = {
  className?: string
  amount: AlgoAmount
}

export function DisplayAlgo({ className, amount }: Props) {
  return (
    <div className={cn(className, 'flex items-center')}>
      {amount.algos}
      <SvgAlgorand />
    </div>
  )
}
