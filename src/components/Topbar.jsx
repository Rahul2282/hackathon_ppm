import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet } from './WalletConnect'

export default function Topbar() {
  const location = useLocation()

  return (
    <motion.header 
      className="app-header"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
    >
      <div className="header-content">
        <motion.div 
          className="header-left"
          whileHover={{ scale: 1.02 }}
        >
          <Link to="/" style={{ textDecoration: 'none' }}>
            <motion.h1 className="app-title">PPM</motion.h1>
          </Link>
          <motion.p className="app-subtitle">
            Permissionless Prediction Market
          </motion.p>
        </motion.div>

        <nav className="header-right" aria-label="Main Navigation">
          <motion.div className="nav-links" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink> */}
            {/* <NavLink to="/markets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Markets
            </NavLink>
            <a className={`nav-link ${location.hash === '#how' ? 'active' : ''}`} href="#how">How it works</a> */}
          </motion.div>
          <Wallet />
        </nav>
      </div>
    </motion.header>
  )
}


