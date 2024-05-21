import './App.css'
import { routes } from './App.routes'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './features/theme/context/theme-provider'
import { LayoutProvider } from './features/layout/context/layout-provider'
import { TooltipProvider } from './features/common/components/tooltip'
import { NetworkProvider } from './features/common/components/network-provider'

const router = createBrowserRouter(routes)

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <NetworkProvider>
          <LayoutProvider>
            <RouterProvider router={router} />
          </LayoutProvider>
        </NetworkProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
