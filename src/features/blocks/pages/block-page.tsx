import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { cn } from '@/features/common/utils'
import { BlockDetails } from '../components/block-details'
import { is404 } from '@/utils/error'
import { useLoadableBlock } from '../data'

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
  const loadableBlock = useLoadableBlock(roundNumber)

  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>{blockPageTitle}</h1>
      <RenderLoadable loadable={loadableBlock} transformError={transformError}>
        {(block) => <BlockDetails block={block} />}
      </RenderLoadable>
    </div>
  )
}
