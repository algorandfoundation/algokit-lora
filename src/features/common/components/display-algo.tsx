import SvgAlgorand from './icons/algorand'
import { cn } from '../utils'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'

export type Props = {
  amount: AlgoAmount
}

export function DisplayAlgo({ amount }: Props) {
  return (
    <div className={cn('flex items-center')}>
      {amount.algos}
      <SvgAlgorand />
    </div>
  )
}
