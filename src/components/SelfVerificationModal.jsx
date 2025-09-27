import { useEffect, useState, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { SelfQRcodeWrapper, SelfAppBuilder } from '@selfxyz/qrcode'
import { getUniversalLink ,countries} from '@selfxyz/core'
import { ethers } from 'ethers'

export default function SelfVerificationModal({ isOpen, onClose, onSuccess, address }) {
  const [selfApp, setSelfApp] = useState(null)
  const [universalLink, setUniversalLink] = useState('')
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  const excludedCountries = useMemo(() => [countries.UNITED_STATES], []);

  //   console.log("---<",import.meta.env.NEXT_PUBLIC_SELF_APP_NAME)

  useEffect(() => {
    if (!isOpen) return

    // reset error and previous state on each attempt/open
    setError(null)
    setSelfApp(null)
    setUniversalLink('')

    const userId = address || ethers.ZeroAddress

    const config = {
      version: 2,
      appName: "Self Workshop",
      scope: "self-workshop",
      endpoint:"0xAD58a623E047e3F57F9631AfDd32Bc1F3A28325F",
      logoBase64:
        "https://i.postimg.cc/mrmVf9hm/self.png", // url of a png image, base64 is accepted but not recommended
      userId: userId,
      endpointType: "staging_celo",
      userIdType: "hex", // use 'hex' for ethereum address or 'uuid' for uuidv4
      userDefinedData: "0xF7396A1435cc2D7Db01EF395786A1083C708d1E1",
      disclosures: {
        // what you want to verify from users' identity
        minimumAge: 18,
        ofac: false,
        excludedCountries: excludedCountries,
      },
    };

    const app = new SelfAppBuilder(config).build()
    setSelfApp(app)

    const link = getUniversalLink(config)
    setUniversalLink(link)
  }, [isOpen, address, attempt, excludedCountries])

  if (!isOpen) return null

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        width: 520,
        maxWidth: '95%',
        background: '#0b1020',
        color: '#fff',
        borderRadius: 12,
        padding: 20,
        border: '1px solid rgba(255,255,255,0.08)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Verify with Self</h3>
          <button onClick={onClose} className="btn btn-outline btn-sm">Close</button>
        </div>

        <div style={{ marginTop: 16 }}>
          {/* Error Toast */}
          {error && (
            <div style={{
              background: 'rgba(220, 38, 38, 0.15)',
              color: '#fecaca',
              border: '1px solid rgba(220,38,38,0.35)',
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                !
              </div>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>ZK Proof Verification Failed</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  {error === 'Verification failed' ? 'Unable to verify your identity. Please try again.' : error}
                </div>
              </div>
              <button 
                onClick={() => setError(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fecaca',
                  cursor: 'pointer',
                  fontSize: '18px',
                  marginLeft: 'auto'
                }}
              >
                ×
              </button>
            </div>
          )}

          {/* QR Code Section */}
          {selfApp && !error && (
            <div style={{ marginBottom: 16 }}>
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={() => {
                  onSuccess?.()
                }}
                onError={(e) => {
                  console.error('Failed to verify identity', e)
                  setError('Verification failed')
                }}
              />
            </div>
          )}

          {/* Retry Section - Show when there's an error */}
          {error && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: 20,
              borderRadius: 8,
              marginBottom: 16,
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 8 }}>
                  Verification Failed
                </div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  Your ZK proof could not be verified. This might be due to network issues or verification requirements.
                </div>
              </div>
              <button
                onClick={() => {
                  setError(null)
                  setAttempt(prev => prev + 1)
                }}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Mobile App Button - Only show when no error */}
          {!error && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => universalLink && window.open(universalLink, '_blank', 'noopener,noreferrer')}
                disabled={!universalLink}
                className="btn btn-outline btn-sm"
                style={{
                  opacity: !universalLink ? 0.5 : 1,
                  cursor: !universalLink ? 'not-allowed' : 'pointer'
                }}
              >
                Open Self App (Mobile)
              </button>
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  )
}
