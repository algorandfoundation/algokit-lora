import { routes } from './App.routes'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { TooltipProvider } from './features/common/components/tooltip'
import { PlatformProvider } from './features/common/components/platform-provider'

const router = createBrowserRouter(routes)

function App() {
  return (
    <PlatformProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </PlatformProvider>
  )
}

export default App

// TODO: PD - make this a dialog
// if (window.__TAURI_INTERNALS__) {
//   window.prompt = (message: string | undefined) => {
//     throw new Error('foo')
//   }
// }
