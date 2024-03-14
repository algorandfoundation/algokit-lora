import './App.css'
import { routes } from './App.routes'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'

const router = createBrowserRouter(routes)

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
