import './App.css'
import { routes } from './App.routes'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { TooltipProvider } from './features/common/components/tooltip'
import { SettingsProvider } from './features/settings/components/settings-provider'

const router = createBrowserRouter(routes)

function App() {
  return (
    <SettingsProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </SettingsProvider>
  )
}

export default App
