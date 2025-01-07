import { routes } from './App.routes'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { TooltipProvider } from './features/common/components/tooltip'
import { PlatformProvider } from './features/common/components/platform-provider'
import { checkForAppUpdates } from './features/tauri/updater'
import { useEffect } from 'react'

const router = createBrowserRouter(routes)

function App() {
  useEffect(() => {
    ;(async () => {
      if (window.__TAURI_INTERNALS__) {
        await checkForAppUpdates()
      }
    })()
  }, [])

  return (
    <PlatformProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </PlatformProvider>
  )
}

export default App
