import './App.css'
import { routes } from './App.routes'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './features/theme/context/theme-provider'
import { LayoutProvider } from './features/layout/context/layout-provider'

const router = createBrowserRouter(routes)

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <LayoutProvider>
        <RouterProvider router={router} />
      </LayoutProvider>
    </ThemeProvider>
  )
}

export default App
