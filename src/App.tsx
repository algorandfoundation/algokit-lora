import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { atom, useAtom } from 'jotai'

const countAtom = atom(0)

function App() {
  const [count, setCount] = useAtom(countAtom)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React on Tauri</h1>
      <div className="card">
        <button className="btn btn-neutral" onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <h1 className="bg-sky-700 text-3xl font-bold underline">Hello world!</h1>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  )
}

export default App
