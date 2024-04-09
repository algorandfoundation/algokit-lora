import { cn } from '@/features/common/utils'
import { asError } from '@/utils/error'
import { useRouteError } from 'react-router-dom'

type ErrorPageProps = {
  title?: string
}

export function ErrorPage({ title }: ErrorPageProps) {
  const error = asError(useRouteError())

  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>{title ?? 'Error'}</h1>
      <p>Error: {error.message}</p>
    </div>
  )
}
