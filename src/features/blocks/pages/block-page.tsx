import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { cn } from '@/features/common/utils'
import { BlockDetails } from '../components/block-details'
import { is404 } from '@/utils/error'
import { useLoadableBlock } from '../data'
import { isInteger } from '@/utils/is-integer'

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
  const { round: _round } = useRequiredParam(UrlParams.Round)
  invariant(isInteger(_round), blockInvalidRoundMessage)
  const round = parseInt(_round, 10)
  const loadableBlock = useLoadableBlock(round)

  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>{blockPageTitle}</h1>
      <RenderLoadable loadable={loadableBlock} transformError={transformError}>
        {(block) => <BlockDetails block={block} />}
      </RenderLoadable>
    </div>
  )
}
