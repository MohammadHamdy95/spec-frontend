import { Link, Route, Routes } from 'react-router-dom'
import { NewSpec } from './pages/NewSpec'
import { ViewSpec } from './pages/ViewSpec'
import { EditSpec } from './pages/EditSpec'
import './App.css'

export default function App() {
  return (
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
  )
}
