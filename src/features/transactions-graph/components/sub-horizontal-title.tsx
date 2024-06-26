import { cn } from '@/features/common/utils'
import { graphConfig } from '@/features/transactions-graph/components/graph-config'
import { Horizontal } from '../models'

type Props = {
  horizontal: Horizontal
}
export function SubHorizontalTitle({ horizontal }: Props) {
  const { hasNextSibling, ancestors, depth } = horizontal
  const parent = ancestors.length > 0 ? ancestors[ancestors.length - 1] : undefined
  const hasParent = !!parent
  // Top and second level transactions aren't indented to save space
  const marginMultiplier = depth > 0 ? depth - 1 : 0

  // Currently, we only support sub-horizontals for payments and asset transfers
  // They don't have children so we don't need to render the connection to children
  return (
    <div
      className={cn(`relative h-full p-0 flex items-center`, 'px-0')}
      style={{ marginLeft: marginMultiplier * graphConfig.indentationWidth }}
    >
      {hasParent && hasNextSibling && <ConnectionToSibling />}
    </div>
  )
}

function ConnectionToSibling() {
  // The connection between this transaction and the next sibling
  return (
    <div
      className={cn('border-primary', 'absolute left-0 h-full')}
      style={{
        width: `${graphConfig.indentationWidth + 8}px`,
        borderLeftWidth: `${graphConfig.lineWidth}px`,
      }}
    ></div>
  )
}
