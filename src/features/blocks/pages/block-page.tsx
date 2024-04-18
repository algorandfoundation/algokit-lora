import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { useLoadableBlockModel } from '../data'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { cn } from '@/features/common/utils'
import { Block } from '../components/block'
import { is404 } from '@/utils/error'

const validRoundRegex = /^\d+$/
const isValidRound = (round: string) => round.match(validRoundRegex)

const transformError = (e: Error) => {
  if (is404(e)) {
    return new Error(blockNotFoundMessage)
  }

  // eslint-disable-next-line no-console
  console.error(e)
  return new Error(blockFailedToLoadMessage)
}

export const blockPageTitle = 'Block'
export const blockNotFoundMessage = 'Block not found'
export const blockInvalidRoundMessage = 'Round is invalid'
export const blockFailedToLoadMessage = 'Block failed to load'

export function BlockPage() {
  const { round } = useRequiredParam(UrlParams.Round)
  invariant(isValidRound(round), blockInvalidRoundMessage)
  const roundNumber = parseInt(round, 10)
  const loadableTransaction = useLoadableBlockModel(roundNumber)

  return (
    <RenderLoadable loadable={loadableTransaction} transformError={transformError}>
      {(data) => (
        <div>
          <h1 className={cn('text-2xl text-primary font-bold')}>{blockPageTitle}</h1>
          <Block block={data} />
        </div>
      )}
    </RenderLoadable>
  )
}
