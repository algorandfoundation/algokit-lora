import { ResourceReference } from '@algorandfoundation/algokit-utils/transact'

export const hasUnifiedAccessReferences = (accessReferences: ResourceReference[] | undefined) => {
  return (accessReferences?.length ?? 0) > 0
}
