import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { metaMask } from '@wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { sepolia } from 'wagmi/chains'
const queryClient = new QueryClient()

import './index.css'
import App from './App.jsx'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { createClient, fallback } from 'viem'

// const localhost = {
//   id: 1337, // or 31337 for Hardhat, match your local node
//   name: 'Localhost',
//   network: 'localhost',
//   nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
//   rpcUrls: {
//     default: { http: ['http://localhost:8545'] },
//     public: { http: ['http://localhost:8545'] },
//   },
// }
export const config = createConfig({
  chains: [sepolia],
  connectors: [metaMask()],
  transports: {
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/oIYpahzrgNt5HRj3VtqwTwdYsJyc9ymZ'), // 👈 your custom RPC
  },
})
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
       <QueryClientProvider client={queryClient}>
        <App />
       </QueryClientProvider>
      
    </WagmiProvider>
  </StrictMode>,
)
