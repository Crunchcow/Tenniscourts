import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CancellationPage from './pages/CancellationPage'
import AdminPanel from './pages/AdminPanel'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stornieren/:token" element={<CancellationPage />} />
        <Route path="/verwaltung" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  )
}
