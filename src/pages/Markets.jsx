import { motion } from 'framer-motion'
import MarketManager from '../components/MarketManaget'
import AiAssistant from '../components/AiAssistant'

export default function Markets() {
  const walletAddress = "0x5edb03076fCd7347Da720aa2A3E518159Fc51b08";
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <MarketManager />
      <AiAssistant walletAddress={walletAddress} />
    </motion.div>
  )
}


