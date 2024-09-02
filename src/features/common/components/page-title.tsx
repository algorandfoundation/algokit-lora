import { RefreshButton } from './refresh-button'

type Props = {
  title: string
  canRefreshPage?: boolean
  onRefresh?: () => void
}

export function PageTitle({ title, canRefreshPage = false, onRefresh }: Props) {
  return (
    <div className="mb-4 mt-2 flex h-10 items-center">
      <h1 className="text-nowrap">{title}</h1>
      {canRefreshPage && onRefresh && <RefreshButton onClick={onRefresh} />}
    </div>
  )
}
