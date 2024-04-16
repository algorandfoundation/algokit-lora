import { useLatestBlocks } from '../data'
import { BlockLink } from './block-link'

export function LatestBlocks() {
  const latestBlocks = useLatestBlocks()

  return (
    <div>
      <h3>Latest Blocks:</h3>
      {latestBlocks.map((block, i) => (
        <p key={i}>
          <BlockLink round={block.round} />
        </p>
      ))}
    </div>
  )
}
