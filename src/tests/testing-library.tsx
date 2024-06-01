import { TooltipProvider } from '@radix-ui/react-tooltip'
import { queries, render, renderHook, screen, within } from '@testing-library/react'
import type { createStore } from 'jotai'
import type { PropsWithChildren } from 'react'
import { MemoryRouter } from 'react-router'
import { ErrorBoundary } from './error-boundary'
import * as getDescriptionQueries from './custom-queries/get-description'
import { TestPlatformProvider } from './test-platform-provider'

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
    return (
      <TestPlatformProvider store={store}>
        <TooltipProvider>
          <ErrorBoundary>
            <MemoryRouter>{children}</MemoryRouter>
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
