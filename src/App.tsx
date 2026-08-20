import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { NewSpec } from './pages/NewSpec'
import { ViewSpec } from './pages/ViewSpec'
import { EditSpec } from './pages/EditSpec'
import './App.css'

export default function App() {
  return (
    // BrowserRouter lives here, not in main.tsx — Link and Routes below need
    // router context, and without it React Router throws
    // "Cannot destructure property 'basename'" and the whole app fails to
    // mount, serving a blank page from perfectly valid HTML.
    <BrowserRouter>
      <div className="app">
        <nav className="top">
          <Link to="/" className="brand">
            spec<span>.hamdy.app</span>
          </Link>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<NewSpec />} />
            <Route path="/:id" element={<ViewSpec />} />
            <Route path="/:id/v/:version" element={<ViewSpec />} />
            <Route path="/:id/edit" element={<EditSpec />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
