import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CancellationPage from './pages/CancellationPage'
import AdminPanel from './pages/AdminPanel'
import { fetchAuthStatus } from './api/client'

export default function App() {
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    fetchAuthStatus().then((data) => {
      if (!data.authenticated) {
        window.location.href = '/api/auth/login/'
      } else {
        setAuthChecked(true)
      }
    })
  }, [])

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#555' }}>
        Weiterleitung zu ClubAuth…
      </div>
    )
  }

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
