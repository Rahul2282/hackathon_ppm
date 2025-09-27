# Ethereum Integration with Wagmi

This project is now configured to use Wagmi for Ethereum interactions with a custom RPC endpoint at `http://localhost:8545`.

## What's Been Set Up

1. **Wagmi Configuration** (`src/wagmi.js`)
   - Configured for Mainnet, Sepolia, and Localhost networks
   - Custom RPC URL: `http://localhost:8545` (Chain ID: 31337)
   - Multiple wallet connectors: MetaMask, WalletConnect, Coinbase Wallet

2. **WalletConnect Component** (`src/components/WalletConnect.jsx`)
   - Connect/disconnect wallets
   - Display wallet information (address, chain, balance)
   - Switch between networks
   - Support for multiple wallet types

3. **App Integration**
   - Wrapped with `WagmiConfig` provider
   - Wallet component integrated into the main app

## Prerequisites

Make sure you have a local Ethereum node running at `http://localhost:8545`. You can use:

- **Hardhat**: `npx hardhat node`
- **Ganache**: Desktop app or CLI
- **Anvil**: `anvil` (from Foundry)

## Usage

1. **Start your local Ethereum node** at `http://localhost:8545`
2. **Run the frontend**: `npm run dev`
3. **Connect your wallet** using the WalletConnect component
4. **Switch to Localhost network** (Chain ID: 31337)

## Available Wagmi Hooks

The following hooks are available throughout your app:

- `useAccount()` - Get connected account information
- `useConnect()` - Connect to wallets
- `useDisconnect()` - Disconnect from wallet
- `useBalance()` - Get account balance
- `useNetwork()` - Get current network
- `useSwitchNetwork()` - Switch between networks
- `useContractRead()` - Read from smart contracts
- `useContractWrite()` - Write to smart contracts
- `useSignMessage()` - Sign messages
- `useSignTypedData()` - Sign typed data

## Example Usage

```jsx
import { useAccount, useBalance } from 'wagmi'

function MyComponent() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  
  if (!isConnected) return <div>Please connect your wallet</div>
  
  return (
    <div>
      <p>Address: {address}</p>
      <p>Balance: {balance?.formatted} {balance?.symbol}</p>
    </div>
  )
}
```

## Customization

- **Add more networks**: Edit `src/wagmi.js` to include additional chains
- **Custom RPC URLs**: Modify the `rpcUrls` in the localhost chain configuration
- **Wallet connectors**: Add or remove connectors in the `createConfig` call
- **Styling**: Modify the CSS in `src/App.css`

## Troubleshooting

- **Wallet not connecting**: Ensure your local node is running and accessible
- **Wrong network**: Make sure to switch to the Localhost network (Chain ID: 31337)
- **RPC errors**: Verify the RPC URL is correct and the node is responding

## Next Steps

- Add smart contract interactions using `useContractRead` and `useContractWrite`
- Implement transaction signing and sending
- Add more sophisticated wallet management features
- Integrate with your specific smart contracts

