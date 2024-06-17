import { PageTitle } from '@/features/common/components/page-title'

export const appStudioPageTitle = 'App Studio'

export function AppStudioPage() {
  return (
    <>
      <PageTitle title={appStudioPageTitle} />
      <div>
        <p>
          Comming soon!
          <br />
          In the meantime, we recommend{' '}
          <a href="https://app.dappflow.org/beaker-studio/" className="text-primary underline" rel="nofollow" target="_blank">
            Dappflow
          </a>{' '}
          for your application needs.
        </p>
      </div>
    </>
  )
}
