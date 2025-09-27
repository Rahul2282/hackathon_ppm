import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAccount } from 'wagmi'

export default function ProtectedRoute({ children }) {
  const { address, isConnected } = useAccount()
  const [isVerified, setIsVerified] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isConnected || !address) {
      setIsVerified(false)
      setIsChecking(false)
      return
    }

    // Check if the current address is verified
    const verifiedAddresses = JSON.parse(localStorage.getItem('verifiedAddresses') || '[]')
    const verified = verifiedAddresses.includes(address)
    setIsVerified(verified)
    setIsChecking(false)
  }, [address, isConnected])

  // Show loading state while checking verification
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // If not connected or not verified, redirect to landing page
  if (!isConnected || !isVerified) {
    return <Navigate to="/" replace />
  }

  // If verified, render the protected component
  return children
}
