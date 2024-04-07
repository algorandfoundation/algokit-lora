import { useLatestBlocks } from '../data'

export function LatestBlocks() {
  const latestBlocks = useLatestBlocks()

  return (
    <div>
      <h3>Latest Blocks:</h3>
      {latestBlocks.map((block, i) => (
        <p key={i}>
          {block.round} - {block.parentTransactionCount}
        </p>
      ))}
    </div>
  )
}
