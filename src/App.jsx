// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import './App.css'
import Topbar from './components/Topbar.jsx'
import Footer from './components/Footer.jsx'
import Landing from './pages/Landing.jsx'
import Markets from './pages/Markets.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'


function App() {
  const { VITE_APP_NAME } = import.meta.env

  useEffect(() => {
    if (VITE_APP_NAME) {
      document.title = VITE_APP_NAME
    }
  }, [VITE_APP_NAME])

  return (
    <AnimatePresence>
      <div className="app-container">
        <div className="animated-background" />
        <BrowserRouter>
          <Topbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route 
                path="/markets" 
                element={
                  <ProtectedRoute>
                    <Markets />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
          <div className="floating-particles">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="particle"
                animate={{
                  y: [0, -20, 0],
                  x: [0, Math.random() * 10 - 5, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.5,
                }}
                style={{
                  left: `${10 + i * 15}%`,
                  top: `${20 + (i % 3) * 30}%`,
                }}
              />
            ))}
          </div>
        </BrowserRouter>
      </div>
    </AnimatePresence>
  )
}

export default App
