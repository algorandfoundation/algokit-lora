import { asError } from '@/utils/error'
import { useRouteError } from 'react-router-dom'
import { PageTitle } from '../components/page-title'

type ErrorPageProps = {
  title?: string
}

export function ErrorPage({ title }: ErrorPageProps) {
  const error = asError(useRouteError())

  return (
    <>
      <PageTitle title={title ?? 'Error'} />
      <div>
        <p>Error: {error.message}</p>
      </div>
    </>
  )
}
