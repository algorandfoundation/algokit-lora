import { LayoutProvider } from '@/features/layout/context/layout-provider'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { queries, render, renderHook, screen, within } from '@testing-library/react'
import type { createStore } from 'jotai'
import { Provider as JotaiProvider } from 'jotai'
import type { PropsWithChildren } from 'react'
import { MemoryRouter } from 'react-router'
import { ErrorBoundary } from './error-boundary'
import * as getDescriptionQueries from './custom-queries/get-description'
import { SettingsProvider } from '@/features/settings/components/settings-provider'

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
      <SettingsProvider>
        <JotaiProvider store={store}>
          <TooltipProvider>
            <LayoutProvider>
              <ErrorBoundary>
                <MemoryRouter>{children}</MemoryRouter>
              </ErrorBoundary>
            </LayoutProvider>
          </TooltipProvider>
        </JotaiProvider>
      </SettingsProvider>
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
