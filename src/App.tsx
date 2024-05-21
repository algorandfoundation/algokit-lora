import './App.css'
import { routes } from './App.routes'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './features/theme/context/theme-provider'
import { LayoutProvider } from './features/layout/context/layout-provider'
import { TooltipProvider } from './features/common/components/tooltip'
import { SettingsProvider } from './features/common/components/settings-provider'

const router = createBrowserRouter(routes)

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <SettingsProvider>
          <LayoutProvider>
            <RouterProvider router={router} />
          </LayoutProvider>
        </SettingsProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
