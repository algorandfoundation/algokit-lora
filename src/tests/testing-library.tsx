import { TooltipProvider } from '@radix-ui/react-tooltip'
import { prettyDOM, queries, render, renderHook, RenderResult, screen, within } from '@testing-library/react'
import type { createStore } from 'jotai'
import type { PropsWithChildren } from 'react'
import { ErrorBoundary } from './error-boundary'
import * as getDescriptionQueries from './custom-queries/get-description'
import { TestPlatformProvider } from './test-platform-provider'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { evalTemplates } from '@/routes/templated-route'
import { Urls } from '@/routes/urls'

const allQueries = {
  ...queries,
  ...getDescriptionQueries,
}

const customScreen = {
  ...within(document.body, allQueries),
  debug: screen.debug,
}

type JotaiStore = ReturnType<typeof createStore>

const Providers =
  (store?: JotaiStore) =>
  ({ children }: PropsWithChildren) => {
    const routes = evalTemplates([
      {
        template: Urls.Index,
        element: children,
      },
    ])
    const router = createMemoryRouter(routes)

    return (
      <TestPlatformProvider store={store}>
        <TooltipProvider>
          <ErrorBoundary>
            <RouterProvider router={router} />
          </ErrorBoundary>
        </TooltipProvider>
      </TestPlatformProvider>
    )
  }

const customRender = (ui: Parameters<typeof render>[0], options?: Parameters<typeof render>[1], store?: ReturnType<typeof createStore>) =>
  render(ui, { wrapper: Providers(store), ...options })

const customRenderHook = (
  ui: Parameters<typeof renderHook>[0],
  options?: Parameters<typeof renderHook>[1],
  store?: ReturnType<typeof createStore>
) => renderHook(ui, { wrapper: Providers(store), ...options })

// re-export everything
export * from '@testing-library/react'
// override render method
export { customRender as render, customRenderHook as renderHook, customScreen as screen }

export const dump = (component: RenderResult<typeof queries, HTMLElement, HTMLElement>) => {
  // eslint-disable-next-line no-console
  console.log(prettyDOM(component.container, 1_000_000))
}
