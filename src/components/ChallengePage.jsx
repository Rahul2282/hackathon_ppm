import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useReadContract,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import abi from "../abi.json";

const CONTRACT_ADDRESS = "0x241a40c355641Fec8e8b11E5197c9a3C90896132";

// Quick stake presets
const QUICK_STAKE_AMOUNTS = ["0.001", "0.01", "0.05", "0.1"];

export default function ChallengePage({ marketId, onBack }) {
  const { writeContractAsync } = useWriteContract();
  const { address, isConnected } = useAccount();
  const [outcome, setOutcome] = useState("");
  const [stakeAmount, setStakeAmount] = useState("0.001");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  // Get market data
  const { data: marketData, refetch: refetchMarket } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "markets",
    args: [BigInt(marketId)],
  });

  // Get window closed timestamp
  const { data: windowClosedData, refetch: refetchWindowClosed } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "windowClosed",
    args: [BigInt(marketId)],
  });

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(""), 3000);
  };

  // Countdown timer effect
  useEffect(() => {
    if (!windowClosedData) return;
    
    const challengeWindowClosing = Number(windowClosedData) * 1000;
    const updateTimer = () => {
      const now = Date.now();
      const timeRemaining = Math.max(0, challengeWindowClosing - now);
      setTimeLeft(timeRemaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [windowClosedData]);

  useEffect(() => {
    refetchMarket();
    refetchWindowClosed();
  }, [marketId]);

  // Format time remaining
  const formatTimeLeft = (milliseconds) => {
    if (milliseconds <= 0) return "00:00:00";
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!marketData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          width: "100%",
          padding: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid rgba(102, 126, 234, 0.3)",
              borderTop: "3px solid #667eea",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Loading challenge data...
          </div>
        </div>
      </motion.div>
    );
  }

  // Parse market data
  const [
    question,
    createdAt,
    endTime,
    status,
    finalOutcome,
    yesPool,
    noPool,
    creator,
    evidenceUri,
    proposedAtTime,
    proposedOutcomeData,
    aiSupportStakeData,
    opposeStakeData,
    aiSupportVotesData,
    opposeVotesData
  ] = marketData;

  const market = {
    question: question || "No question available",
    status: status ?? "Unknown",
    yesPool: yesPool ? BigInt(yesPool) : 0n,
    noPool: noPool ? BigInt(noPool) : 0n,
    creator: creator || "Unknown",
    proposedAt: proposedAtTime ? Number(proposedAtTime) * 1000 : 0,
    proposedOutcome: Number(proposedOutcomeData ?? -1),
    aiSupportStake: aiSupportStakeData ? BigInt(aiSupportStakeData) : 0n,
    opposeStake: opposeStakeData ? BigInt(opposeStakeData) : 0n,
    aiSupportVotes: aiSupportVotesData ? BigInt(aiSupportVotesData) : 0n,
    opposeVotes: opposeVotesData ? BigInt(opposeVotesData) : 0n,
  };

  const challengeWindowClosing = windowClosedData ? Number(windowClosedData) * 1000 : 0;
  const isChallengeWindowClosed = challengeWindowClosing > 0 && Date.now() > challengeWindowClosing;

  async function submitChallenge() {
    if (!isConnected) return showNotification("Connect wallet first", "error");
    if (!outcome) return showNotification("Please select an outcome", "error");
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return showNotification("Please enter a valid stake amount", "error");
    
    const outcomeNum = parseInt(outcome);
    if (outcomeNum !== 0 && outcomeNum !== 1) {
      showNotification("Invalid outcome. Please select 0 for No or 1 for Yes.", "error");
      return;
    }

    setIsLoading(true);
    try {
      let functionName;
      if(market.proposedOutcome == 1){
        functionName = outcomeNum === 1 ? "stakeSupport" : "stakeOppose";
      } else {
        functionName = outcomeNum === 1 ? "stakeOppose" : "stakeSupport";
      }
      
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: functionName,
        args: [BigInt(marketId)],
        value: parseEther(stakeAmount),
      });
      
      showNotification("Challenge submitted successfully!", "success");
      setOutcome("");
      setStakeAmount("0.001");
      
      setTimeout(() => {
        refetchMarket();
        refetchWindowClosed();
      }, 2000);
    } catch (err) {
      console.error("Error submitting challenge:", err);
      showNotification("Failed to submit challenge. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function finalizeOutcome() {
    if (!isConnected) return showNotification("Connect wallet first", "error");
    
    setIsLoading(true);
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "finalOutcome",
        args: [BigInt(marketId)],
      });
      
      showNotification("Outcome finalized successfully! Redirecting to markets...", "success");
      
      // Redirect to markets after a short delay
      setTimeout(() => {
        onBack(); // This will navigate back to the markets list
      }, 2000);
      
    } catch (err) {
      console.error("Error finalizing outcome:", err);
      showNotification("Failed to finalize outcome. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  const getOutcomeText = (outcomeNum) => {
    return outcomeNum === 1 ? "Yes" : outcomeNum === 0 ? "No" : "Not Proposed";
  };

  const getOutcomeColor = (outcomeNum) => {
    return outcomeNum === 1 ? "#4caf50" : outcomeNum === 0 ? "#f44336" : "var(--text-secondary)";
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      0: { text: "Active", color: "#4caf50", emoji: "🟢" },
      1: { text: "Resolving", color: "#ff9800", emoji: "⏳" },
      2: { text: "Proposed", color: "#ff9800", emoji: "⏳" },
      3: { text: "Resolved", color: "#667eea", emoji: "✅" },
    };
    return statusMap[status] || { text: "Unknown", color: "#666", emoji: "❓" };
  };

  const statusInfo = getStatusInfo(market.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        width: "100%",
        padding: "1.5rem",
      }}
    >
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              padding: "12px 20px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 500,
              zIndex: 1000,
              backdropFilter: "blur(20px)",
              background:
                notification.type === "error"
                  ? "rgba(239, 83, 80, 0.9)"
                  : notification.type === "success"
                  ? "rgba(76, 175, 80, 0.9)"
                  : "rgba(102, 126, 234, 0.9)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Single Consolidated Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 20,
          padding: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <button
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 10,
              background: "transparent",
              border: "1px solid rgba(102, 126, 234, 0.4)",
              color: "var(--text-primary)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(102, 126, 234, 0.08)";
              e.target.style.borderColor = "rgba(102, 126, 234, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.borderColor = "rgba(102, 126, 234, 0.4)";
            }}
          >
            ← Back
          </button>

          

          <div style={{ width: 80 }}></div>
        </div>

        {/* Market Question */}
        <div
          style={{
            padding: "16px 20px",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: 12,
            marginBottom: 20,
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: "var(--text-primary)",
              lineHeight: 1.4,
              fontWeight: 500,
            }}
          >
            {market.question}
          </div>
        </div>

        {/* Stats & Status Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {/* Proposed Outcome */}
          <div
            style={{
              padding: 12,
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: 10,
              textAlign: "center",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>Proposed</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: getOutcomeColor(market.proposedOutcome),
              }}
            >
              {getOutcomeText(market.proposedOutcome)}
            </div>
          </div>

          {/* AI Support */}
          <div
            style={{
              padding: 12,
              background: "rgba(76, 175, 80, 0.08)",
              borderRadius: 10,
              textAlign: "center",
              border: "1px solid rgba(76, 175, 80, 0.15)",
            }}
          >
            <div style={{ fontSize: 11, color: "#66bb6a", marginBottom: 4 }}>AI Support</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
              {formatEther(market.aiSupportStake)} ETH
            </div>
            <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>
              {Number(market.aiSupportVotes)} votes
            </div>
          </div>

          {/* Oppose */}
          <div
            style={{
              padding: 12,
              background: "rgba(244, 67, 54, 0.08)",
              borderRadius: 10,
              textAlign: "center",
              border: "1px solid rgba(244, 67, 54, 0.15)",
            }}
          >
            <div style={{ fontSize: 11, color: "#ef5350", marginBottom: 4 }}>Oppose</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
              {formatEther(market.opposeStake)} ETH
            </div>
            <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>
              {Number(market.opposeVotes)} votes
            </div>
          </div>
        </div>

        {/* Challenge Window Status with Countdown Timer */}
        <div
          style={{
            padding: "16px 20px",
            background: isChallengeWindowClosed 
              ? "rgba(255, 152, 0, 0.1)" 
              : timeLeft < 3600000 // Less than 1 hour
              ? "rgba(244, 67, 54, 0.1)"
              : "rgba(76, 175, 80, 0.1)",
            borderRadius: 12,
            marginBottom: 20,
            border: `1px solid ${isChallengeWindowClosed 
              ? "rgba(255, 152, 0, 0.2)" 
              : timeLeft < 3600000
              ? "rgba(244, 67, 54, 0.2)"
              : "rgba(76, 175, 80, 0.2)"}`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: isChallengeWindowClosed 
                ? "#ff9800" 
                : timeLeft < 3600000
                ? "#f44336"
                : "#4caf50",
              marginBottom: 8,
            }}
          >
            {challengeWindowClosing > 0 ? (
              isChallengeWindowClosed ? "⏰ Challenge Window Closed" : "🟢 Challenge Window Open"
            ) : "⏳ Challenge Window Not Started"}
          </div>
          
          {challengeWindowClosing > 0 && !isChallengeWindowClosed && (
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: timeLeft < 3600000 ? "#f44336" : "#4caf50",
                fontFamily: "monospace",
                letterSpacing: "2px",
                marginBottom: 4,
                textShadow: timeLeft < 3600000 ? "0 0 10px rgba(244, 67, 54, 0.5)" : "0 0 10px rgba(76, 175, 80, 0.5)",
              }}
            >
              {formatTimeLeft(timeLeft)}
            </div>
          )}
          
          {challengeWindowClosing > 0 && (
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {isChallengeWindowClosed ? "Closed" : "Closes"} at {new Date(challengeWindowClosing).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Challenge Form */}
        {!isChallengeWindowClosed ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Outcome Selection */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 8 }}>
                Select your predicted outcome:
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 16px",
                    background: outcome === "1" ? "rgba(76, 175, 80, 0.15)" : "rgba(255, 255, 255, 0.03)",
                    border: `1px solid ${outcome === "1" ? "rgba(76, 175, 80, 0.3)" : "rgba(255, 255, 255, 0.08)"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    flex: 1,
                  }}
                >
                  <input
                    type="radio"
                    name="outcome"
                    value="1"
                    checked={outcome === "1"}
                    onChange={(e) => setOutcome(e.target.value)}
                    style={{ accentColor: "#4caf50" }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>✅ Yes</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 16px",
                    background: outcome === "0" ? "rgba(244, 67, 54, 0.15)" : "rgba(255, 255, 255, 0.03)",
                    border: `1px solid ${outcome === "0" ? "rgba(244, 67, 54, 0.3)" : "rgba(255, 255, 255, 0.08)"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    flex: 1,
                  }}
                >
                  <input
                    type="radio"
                    name="outcome"
                    value="0"
                    checked={outcome === "0"}
                    onChange={(e) => setOutcome(e.target.value)}
                    style={{ accentColor: "#f44336" }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>❌ No</span>
                </label>
              </div>
            </div>

            {/* Stake Amount */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 8 }}>
                Stake amount (ETH):
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                {QUICK_STAKE_AMOUNTS.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setStakeAmount(quickAmount)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      background: stakeAmount === quickAmount ? "rgba(102, 126, 234, 0.2)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${stakeAmount === quickAmount ? "rgba(102, 126, 234, 0.4)" : "rgba(255,255,255,0.08)"}`,
                      color: "var(--text-primary)",
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {quickAmount}
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.001"
                style={{
                  width: "100%",
                  height: 36,
                  padding: "0 12px",
                  borderRadius: 8,
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  fontWeight: 500,
                  transition: "all 0.3s ease",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(102, 126, 234, 0.5)";
                  e.target.style.background = "rgba(255, 255, 255, 0.05)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  e.target.style.background = "rgba(255, 255, 255, 0.03)";
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={submitChallenge}
              disabled={!outcome || !stakeAmount || parseFloat(stakeAmount) <= 0 || isLoading}
              style={{
                height: 40,
                borderRadius: 10,
                background: isLoading ? "rgba(102, 126, 234, 0.3)" : "linear-gradient(135deg, #6b79e6, #7a5aa9)",
                color: "white",
                border: "none",
                fontSize: 14,
                fontWeight: 600,
                cursor: isLoading || !outcome || !stakeAmount || parseFloat(stakeAmount) <= 0 ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: isLoading || !outcome || !stakeAmount || parseFloat(stakeAmount) <= 0 ? 0.6 : 1,
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
              }}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.2)";
              }}
            >
              {isLoading ? (
                <>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid white",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Submitting...
                </>
              ) : (
                <>🚀 Submit Challenge ({stakeAmount} ETH)</>
              )}
            </button>
          </div>
        ) : (
          /* Finalize Section */
          <div
            style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(16, 185, 129, 0.08))",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              borderRadius: 12,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
              🎯 Challenge Window Closed
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.4 }}>
              The challenge window has closed. You can now finalize the market outcome based on the majority of challenges.
            </div>
            <button
              onClick={finalizeOutcome}
              disabled={isLoading}
              style={{
                background: "linear-gradient(135deg, #42b883, #14c8a8)",
                border: "none",
                color: "white",
                padding: "10px 20px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(20, 200, 168, 0.2)",
                opacity: isLoading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(20, 200, 168, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(20, 200, 168, 0.2)";
              }}
            >
              {isLoading ? "Finalizing..." : "🎯 Finalize Outcome"}
            </button>
          </div>
        )}

        {/* Quick Instructions */}
        <div
          style={{
            marginTop: 20,
            padding: "12px 16px",
            background: "rgba(255, 255, 255, 0.02)",
            borderRadius: 8,
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <div style={{ fontSize: 11, color: "var(--text-secondary)", textAlign: "center", lineHeight: 1.4 }}>
            💡 <strong>How it works:</strong> Select your predicted outcome, stake ETH, and submit your challenge. 
            The market will be resolved based on the majority of challenges.
          </div>
        </div>
      </motion.div>

      {/* Loading Overlay */}
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid rgba(255, 255, 255, 0.3)",
              borderTop: "3px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      )}
    </motion.div>
  );
}
