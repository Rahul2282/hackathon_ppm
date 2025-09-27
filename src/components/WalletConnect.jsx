import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { useState, useEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SelfVerificationModal from "./SelfVerificationModal.jsx";

export function Wallet() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [showZKModal, setShowZKModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Function to truncate wallet address
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Function to format balance to 3 decimal places with ellipsis
  const formatBalance = (balance) => {
    if (!balance?.formatted) return '';
    const num = parseFloat(balance.formatted);
    const formatted = num.toFixed(3);
    return `${formatted}...`;
  };

  // Check if user is already verified on component mount
  useEffect(() => {
    if (address) {
      const verifiedAddresses = JSON.parse(localStorage.getItem('verifiedAddresses') || '[]');
      setIsVerified(verifiedAddresses.includes(address));
    }
  }, [address]);

  // Open ZK modal immediately when wallet becomes connected (only if not verified)
  useEffect(() => {
    if (isConnected && address) {
      const verifiedAddresses = JSON.parse(localStorage.getItem('verifiedAddresses') || '[]');
      if (!verifiedAddresses.includes(address)) {
        setShowZKModal(true);
      }
    }
  }, [isConnected, address]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowWalletOptions(false);
      }
    }

    if (showWalletOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showWalletOptions]);

  const walletVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  if (isConnected) {
    return (
      <>
        <SelfVerificationModal
          isOpen={showZKModal}
          address={address}
          onClose={() => setShowZKModal(false)}
          onSuccess={() => {
            // Mark address as verified in localStorage
            const verifiedAddresses = JSON.parse(localStorage.getItem('verifiedAddresses') || '[]');
            if (!verifiedAddresses.includes(address)) {
              verifiedAddresses.push(address);
              localStorage.setItem('verifiedAddresses', JSON.stringify(verifiedAddresses));
            }
            setIsVerified(true);
            setShowZKModal(false);
            navigate("/markets");
          }}
        />

        <motion.div
          variants={walletVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="flex items-center gap-4"
        >
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <motion.div
              className="wallet-balance-compact"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {formatBalance(balance)} {balance?.symbol}
            </motion.div>
            <div className="wallet-address-compact">
              {truncateAddress(address)}
            </div>
          </motion.div>
          
          <div className="flex gap-2">
            <motion.button
              onClick={() => {
                setShowZKModal(false);
                setIsVerified(false);
                // Clear verified addresses from localStorage
                localStorage.removeItem('verifiedAddresses');
                disconnect();
                // Navigate to landing page
                navigate("/");
              }}
              className="btn btn-outline btn-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Disconnect
            </motion.button>
            {!isVerified && (
              <motion.button
                onClick={() => setShowZKModal(true)}
                className="btn btn-outline btn-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                Verify
              </motion.button>
            )}
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <motion.div
      variants={walletVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <motion.button
        onClick={() => {
          const mm = connectors.find((c) => c.name === "MetaMask");
          if (mm) connect({ connector: mm });
          else if (connectors?.[0]) connect({ connector: connectors[0] });
        }}
        className="btn btn-outline btn-sm"
        whileHover={{
          scale: 1.05,
        }}
        whileTap={{ scale: 0.97 }}
        style={{
          border: "none",
          padding: "10px 14px",
          borderRadius: "10px",
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: 700,
          letterSpacing: "0.2px",
        }}
      >
        <span style={{ fontSize: "18px" }}>🦊</span>
        Connect with MetaMask
      </motion.button>
    </motion.div>
  );
}