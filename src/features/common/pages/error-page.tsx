import { asError, is404 } from '@/utils/error'
import { Link, useRouteError } from 'react-router-dom'
import { PageTitle } from '../components/page-title'
import { useSelectedNetwork } from '@/features/network/data'
import { UrlTemplateObj } from '@/routes/url-template'

type ErrorPageProps = {
  title?: string
  redirectUrl?: UrlTemplateObj<unknown>
}

export function ErrorPage({ title, redirectUrl }: ErrorPageProps) {
  const error = asError(useRouteError())
  const [selectedNetwork] = useSelectedNetwork()
  return (
    <>
      <PageTitle title={title ?? 'Error'} />
      <div>
        <p>Error: {error.message}</p>
      </div>
      {is404(error) && redirectUrl && (
        <div className="mt-4">
          <p>Are you sure you have the correct network selected?</p>
          <Link to={redirectUrl.build({ networkId: selectedNetwork })} className="text-primary hover:underline">
            Go to main feature page
          </Link>
        </div>
      )}
    </>
  )
}
