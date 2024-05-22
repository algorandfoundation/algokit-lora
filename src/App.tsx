import './App.css'
import { routes } from './App.routes'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { LayoutProvider } from './features/layout/context/layout-provider'
import { TooltipProvider } from './features/common/components/tooltip'
import { SettingsProvider } from './features/settings/components/settings-provider'

const router = createBrowserRouter(routes)

function App() {
  return (
    <SettingsProvider>
      <TooltipProvider>
        <LayoutProvider>
          <RouterProvider router={router} />
        </LayoutProvider>
      </TooltipProvider>
    </SettingsProvider>
  )
}

export default App
