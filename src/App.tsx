import './App.css'
import { routes } from './App.routes'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './features/theme/context/theme-provider'
import { LayoutProvider } from './features/layout/context/layout-provider'
import { TooltipProvider } from './features/common/components/tooltip'

const router = createBrowserRouter(routes)

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <LayoutProvider>
          <RouterProvider router={router} />
        </LayoutProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
