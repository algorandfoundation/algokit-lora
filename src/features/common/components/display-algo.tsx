import { algoFormatter } from '@/utils/format'
import SvgAlgorand from './icons/algorand'
import { cn } from '../utils'

export type Props = {
  microAlgo: number
}

export function DisplayAlgo({ microAlgo }: Props) {
  return (
    <div className={cn('flex items-center')}>
      {algoFormatter.asAlgo(microAlgo)}
      <SvgAlgorand />
    </div>
  )
}
