import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CityProvider } from './context/CityContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import RouteExplorer from './pages/RouteExplorer'
import AlertsCenter from './pages/AlertsCenter'
import TripAnalytics from './pages/TripAnalytics'
import PredictDelay from './pages/PredictDelay'
import Reports from './pages/Reports'

function App() {
  return (
    <BrowserRouter>
      <CityProvider>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/map" element={<RouteExplorer />} />
              <Route path="/alerts" element={<AlertsCenter />} />
              <Route path="/trips" element={<TripAnalytics />} />
              <Route path="/predict" element={<PredictDelay />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </CityProvider>
    </BrowserRouter>
  )
}

export default App