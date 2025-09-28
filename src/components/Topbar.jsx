import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet } from './WalletConnect'
import logo from '../assets/logo.jpg'

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
          // className="header-left"
          whileHover={{ scale: 1.02 }}
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <img src={logo} style={{ width: '50px', height: '50px' }} alt="Lucida" className="app-logo" />
          <Link to="/" style={{ textDecoration: 'none' }}>
            <motion.h1 className="app-title" style={{ fontFamily: 'Montserrat' }}>Lucida</motion.h1>
          </Link>
          
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


