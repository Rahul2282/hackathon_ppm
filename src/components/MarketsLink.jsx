import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'

export default function MarketsLink({ children, className, onClick, ...props }) {
  const { address, isConnected } = useAccount()
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) {
      setIsVerified(false)
      return
    }

    // Check if the current address is verified
    const verifiedAddresses = JSON.parse(localStorage.getItem('verifiedAddresses') || '[]')
    setIsVerified(verifiedAddresses.includes(address))
  }, [address, isConnected])

  const handleClick = (e) => {
    // If not connected or not verified, prevent navigation and show message
    if (!isConnected) {
      e.preventDefault()
      alert('Please connect your wallet first to access markets.')
      return
    }

    if (!isVerified) {
      e.preventDefault()
      alert('Please complete ZK verification first to access markets.')
      return
    }

    // If verified, allow normal navigation
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <Link 
      to="/markets" 
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  )
}
