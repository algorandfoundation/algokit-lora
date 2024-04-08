import { LayoutProvider } from '@/features/layout/context/layout-provider'
import { ThemeProvider } from '@/features/theme/context/theme-provider'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { queries, render, renderHook, screen, within } from '@testing-library/react'
import type { createStore } from 'jotai'
import { Provider as JotaiProvider } from 'jotai'
import type { PropsWithChildren } from 'react'
import { MemoryRouter } from 'react-router'
import * as getDescriptionQueries from './custom-queries/get-description'
import { transactionsAtom } from '@/features/transactions/data'

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
    if (store) {
      console.log(store.get(transactionsAtom))
    }

    return (
      <JotaiProvider store={store}>
        <ThemeProvider>
          <TooltipProvider>
            <LayoutProvider>
              <MemoryRouter>{children}</MemoryRouter>
            </LayoutProvider>
          </TooltipProvider>
        </ThemeProvider>
      </JotaiProvider>
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
