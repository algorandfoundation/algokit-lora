import { RefreshButton } from './refresh-button'

type Props = {
  title: string
  canRefreshPage?: boolean
  onRefresh?: () => void
}

export function PageTitle({ title, canRefreshPage = false, onRefresh }: Props) {
  return (
    <div className="mt-2 mb-4 flex h-10 items-center">
      <h1 className="text-nowrap">{title}</h1>
      {canRefreshPage && onRefresh && <RefreshButton onClick={onRefresh} />}
    </div>
  )
}
