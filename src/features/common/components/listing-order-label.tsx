type Props = {
  oldestToNewest?: boolean
}
export function ListingOrderLabel({ oldestToNewest = true }: Props) {
  return (
    <div className="mt-3">
      <small>Note: This listing is {oldestToNewest ? 'oldest to newest' : 'newest to oldest'}.</small>
    </div>
  )
}
