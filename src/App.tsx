import './App.css'
import { routes } from './App.routes'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { TooltipProvider } from './features/common/components/tooltip'
import { DataProvider } from './features/common/components/data-provider'

const router = createBrowserRouter(routes)

function App() {
  return (
    <DataProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </DataProvider>
  )
}

export default App
