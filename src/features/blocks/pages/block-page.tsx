import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { BlockDetails } from '../components/block-details'
import { is404 } from '@/utils/error'
import { useLoadableBlock } from '../data'
import { isInteger } from '@/utils/is-integer'
import { PageTitle } from '@/features/common/components/page-title'
import { PageLoader } from '@/features/common/components/page-loader'
import { useTitle } from '@/utils/use-title'

const transformError = (e: Error) => {
  if (is404(e)) {
    e.message = blockNotFoundMessage
    return e
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
  useTitle()
  const { round: _round } = useRequiredParam(UrlParams.Round)
  invariant(isInteger(_round), blockInvalidRoundMessage)
  const round = BigInt(_round)
  const loadableBlock = useLoadableBlock(round)

  return (
    <>
      <PageTitle title={blockPageTitle} />
      <RenderLoadable loadable={loadableBlock} transformError={transformError} fallback={<PageLoader />}>
        {(block) => <BlockDetails block={block} />}
      </RenderLoadable>
    </>
  )
}
