import { useState, useEffect, useCallback } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { AnimatePresence } from "framer-motion";
import abi from "../../abi.json";

const CONTRACT_ADDRESS = "0x0AE8919C1403A1b681E4C4588885957Aa044Fa4A";

// Quick bet presets
const QUICK_BET_AMOUNTS = ["0.01", "0.05", "0.1", "0.5"];

export default function EnhancedMarketCard({ id, onNavigateToChallenge, onStatusUpdate }) {
  const { writeContractAsync } = useWriteContract();
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [notification, setNotification] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [marketData, setMarketData] = useState(null);

  const { data, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "markets",
    args: [BigInt(id)],
  });

  const { data: userYesStake, refetch: refetchYesStake } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "yesStake",
    args: [BigInt(id), address],
  });

  const { data: userNoStake, refetch: refetchNoStake } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "noStake",
    args: [BigInt(id), address],
  });

  // Update market data when contract data changes
  useEffect(() => {
    if (data) {
      const m = data;
      if (m && typeof m === "object") {
        const [
          question,
          createdAt,
          endTime,
          status,
          outcome,
          yesPool,
          noPool,
          creator,
          evidenceUri,
          proposedAt,
          proposedOutcome,
          aiSupportStake,
          opposeStake,
          aiSupportVotes,
          opposeVotes,
        ] = m;

        const processedMarket = {
          question: question || "No question available",
          createdAt: createdAt ? Number(createdAt) * 1000 : Date.now(),
          endTime: endTime ? Number(endTime) * 1000 : Date.now(),
          status: status ?? "Unknown",
          outcome: Number(outcome ?? -1),
          yesPool: yesPool ? BigInt(yesPool) : 0n,
          noPool: noPool ? BigInt(noPool) : 0n,
          creator: creator || "Unknown",
          evidenceUri: evidenceUri || "",
          proposedAt: proposedAt ? Number(proposedAt) * 1000 : 0,
          proposedOutcome: Number(proposedOutcome ?? -1),
          aiSupportStake: aiSupportStake ? BigInt(aiSupportStake) : 0n,
          opposeStake: opposeStake ? BigInt(opposeStake) : 0n,
          aiSupportVotes: aiSupportVotes ? BigInt(aiSupportVotes) : 0n,
          opposeVotes: opposeVotes ? BigInt(opposeVotes) : 0n,
        };
        setMarketData(processedMarket);
        
        // Notify parent component of status change
        if (onStatusUpdate && status !== undefined) {
          onStatusUpdate(Number(status));
        }
      }
    }
  }, [data, onStatusUpdate]);

  const showNotification = useCallback((message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(""), 3000);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!data) return;

    const updateCountdown = () => {
      const endTime = Number(data[2]) * 1000; // endTime is at index 2
      const now = Date.now();
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeLeft("Market ended");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [data]);

  const refreshCard = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([refetch(), refetchYesStake(), refetchNoStake()]);
      showNotification("Market data refreshed", "success");
    } catch (err) {
      console.error("Error refreshing:", err);
      showNotification("Failed to refresh data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [refetch, refetchYesStake, refetchNoStake, showNotification]);

  const placeBet = useCallback(
    async (isYes) => {
      if (!amount) {
        showNotification("Please enter an amount", "error");
        return;
      }

      setIsLoading(true);
      try {
        await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi,
          functionName: "bet",
          args: [BigInt(id), isYes],
          value: parseEther(amount),
        });
        setAmount("");
        showNotification(`Bet placed successfully!`, "success");
        setTimeout(refreshCard, 2000);
      } catch (err) {
        console.error(err);
        showNotification("Transaction failed", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [amount, id, writeContractAsync, showNotification, refreshCard]
  );

  const closeMarket = useCallback(async () => {
    if (!isConnected) {
      showNotification("Connect wallet first", "error");
      return;
    }

    setIsLoading(true);
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "closeMarket",
        args: [BigInt(id)],
      });
      showNotification("Market closed successfully", "success");
      setTimeout(refreshCard, 2000);
    } catch (err) {
      console.error(err);
      showNotification("Failed to close market", "error");
    } finally {
      setIsLoading(false);
      setShowConfirm(null);
    }
  }, [isConnected, id, writeContractAsync, showNotification, refreshCard]);

  const claimWinnings = useCallback(async () => {
    if (!isConnected) {
      showNotification("Connect wallet first", "error");
      return;
    }

    setIsLoading(true);
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "claim",
        args: [BigInt(id)],
      });
      showNotification("Winnings claimed successfully!", "success");
      setTimeout(refreshCard, 2000);
    } catch (err) {
      console.error(err);
      showNotification("Failed to claim winnings", "error");
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, id, writeContractAsync, showNotification, refreshCard]);

  if (!data) {
    return (
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.05)",
          borderRadius: 16,
          padding: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
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
          <div style={{ color: "var(--text-secondary)" }}>
            Loading market #{id}...
          </div>
        </div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div
        style={{
          border: "1px solid rgba(239, 83, 80, 0.3)",
          background: "rgba(239, 83, 80, 0.05)",
          borderRadius: 16,
          padding: 24,
          textAlign: "center",
        }}
      >
        <div style={{ color: "#ef5350" }}>⚠️ Invalid market data for #{id}</div>
      </div>
    );
  }

  const market = marketData;
  const userStakes = {
    yesStake: userYesStake ? BigInt(userYesStake) : 0n,
    noStake: userNoStake ? BigInt(userNoStake) : 0n,
  };

  const totalPool = market.yesPool + market.noPool;
  const yesPercentage =
    totalPool > 0n ? Number((market.yesPool * 100n) / totalPool) : 50;
  const noPercentage = 100 - yesPercentage;

  const getStatusInfo = (status) => {
    const statusMap = {
      0: {
        text: "Active",
        color: "#4caf50",
        bg: "rgba(76, 175, 80, 0.1)",
        emoji: "🟢",
      },
      1: {
        text: "Resolving",
        color: "#ff9800",
        bg: "rgba(255, 152, 0, 0.1)",
        emoji: "⏳",
      },
      2: {
        text: "Resolving",
        color: "#ff9800",
        bg: "rgba(255, 152, 0, 0.1)",
        emoji: "⏳",
      },
      3: {
        text: "Resolved",
        color: "#667eea",
        bg: "rgba(102, 126, 234, 0.1)",
        emoji: "✅",
      },
    };
    return (
      statusMap[status] || {
        text: "Unknown",
        color: "#666",
        bg: "rgba(102, 102, 102, 0.1)",
        emoji: "❓",
      }
    );
  };

  const statusInfo = getStatusInfo(market.status);
  const isActive = market.status === 0;

  return (
    <div
      style={{
        border: isActive 
          ? "2px solid rgba(76, 175, 80, 0.3)" 
          : "1px solid rgba(255,255,255,0.1)",
        background: isActive 
          ? "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(255,255,255,0.05) 100%)"
          : "rgba(255,255,255,0.05)",
        borderRadius: 16,
        padding: 20, // Fixed padding for all cards
        backdropFilter: "blur(10px)",
        position: "relative",
        overflow: "hidden",
        height: "520px", // Fixed height for all cards
        display: "flex",
        flexDirection: "column",
        boxShadow: isActive 
          ? "0 8px 32px rgba(76, 175, 80, 0.2)" 
          : "0 4px 16px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              right: 10,
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              zIndex: 10,
              background:
                notification.type === "error"
                  ? "rgba(239, 83, 80, 0.9)"
                  : notification.type === "success"
                  ? "rgba(76, 175, 80, 0.9)"
                  : "rgba(102, 126, 234, 0.9)",
              color: "white",
            }}
          >
            {notification.message}
          </div>
        )}
      </AnimatePresence>

      {/* Header with organized layout */}
      <div
        style={{
          marginBottom: 16,
          flexShrink: 0,
        }}
      >
        {/* Top row: Status badges and refresh button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          {/* Left side: Status badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Active Market Badge - moved here */}
            {isActive && (
              <div
                style={{
                  background: "linear-gradient(135deg, #4caf50, #66bb6a)",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
                }}
              >
                🔥 Live
              </div>
            )}
            
            {/* Status indicator */}
            <div
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                background: statusInfo.bg,
                color: statusInfo.color,
                fontSize: 11,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>{statusInfo.emoji}</span>
              {statusInfo.text}
            </div>
          </div>

          {/* Right side: Refresh button */}
          <div>
            {market.status !== 3 && (
              <button
                onClick={refreshCard}
                disabled={isLoading}
                title="Refresh market data"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--text-secondary)",
                  fontSize: 12,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.background = "rgba(255,255,255,0.1)";
                    e.target.style.color = "var(--text-primary)";
                    e.target.style.transform = "scale(1.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.05)";
                  e.target.style.color = "var(--text-secondary)";
                  e.target.style.transform = "scale(1)";
                }}
              >
                {isLoading ? (
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid currentColor",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  "↻"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Market question */}
        <div
          style={{
            fontSize: isActive ? 18 : 16,
            fontWeight: isActive ? 700 : 600,
            color: "var(--text-primary)",
            lineHeight: 1.4,
            marginBottom: 8,
          }}
        >
          {market.question}
        </div>

        {/* Market details and countdown */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: 12,
              opacity: 0.7,
              color: "var(--text-secondary)",
            }}
          >
            Market {id + 1} • Ends{" "}
            {new Date(market.endTime).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" "}
            IST
          </div>
          
          {/* Countdown Timer - Only show for active markets */}
          {market.status === 0 && timeLeft && (
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: timeLeft === "Market ended" ? "#ef5350" : "#ff9800",
                padding: "4px 8px",
                borderRadius: 6,
                background: timeLeft === "Market ended" 
                  ? "rgba(239, 83, 80, 0.1)" 
                  : "rgba(255, 152, 0, 0.1)",
                border: `1px solid ${timeLeft === "Market ended" 
                  ? "rgba(239, 83, 80, 0.3)" 
                  : "rgba(255, 152, 0, 0.3)"}`,
                display: "inline-block",
              }}
            >
              ⏰ {timeLeft}
            </div>
          )}
        </div>
      </div>

      {/* Pool Information with Visual Bar */}
      <div style={{ marginBottom: 16, flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Total Pool: {formatEther(totalPool)} ETH
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            {yesPercentage.toFixed(1)}% Yes • {noPercentage.toFixed(1)}% No
          </div>
        </div>

        {/* Visual Pool Bar */}
        <div
          style={{
            height: isActive ? 8 : 6,
            borderRadius: 4,
            background: "rgba(244, 67, 54, 0.3)",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${yesPercentage}%`,
              background: isActive 
                ? "linear-gradient(90deg, #4caf50, #66bb6a, #81c784)"
                : "linear-gradient(90deg, #4caf50, #66bb6a)",
              borderRadius: 4,
              transition: "width 0.3s ease",
              boxShadow: isActive ? "0 0 8px rgba(76, 175, 80, 0.3)" : "none",
            }}
          />
        </div>

        {/* Pool Details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <div
            style={{
              padding: isActive ? 16 : 12,
              borderRadius: 8,
              background: isActive 
                ? "rgba(76, 175, 80, 0.12)"
                : "rgba(76, 175, 80, 0.08)",
              border: isActive 
                ? "1px solid rgba(76, 175, 80, 0.3)"
                : "1px solid rgba(76, 175, 80, 0.2)",
            }}
          >
            <div style={{ fontSize: 12, color: "#66bb6a", marginBottom: 4 }}>
              Yes Pool
            </div>
            <div
              style={{
                fontSize: isActive ? 18 : 16,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {formatEther(market.yesPool)} ETH
            </div>
            {isConnected && userStakes.yesStake > 0n && (
              <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                Your stake: {formatEther(userStakes.yesStake)} ETH
              </div>
            )}
          </div>

          <div
            style={{
              padding: isActive ? 16 : 12,
              borderRadius: 8,
              background: isActive 
                ? "rgba(244, 67, 54, 0.12)"
                : "rgba(244, 67, 54, 0.08)",
              border: isActive 
                ? "1px solid rgba(244, 67, 54, 0.3)"
                : "1px solid rgba(244, 67, 54, 0.2)",
            }}
          >
            <div style={{ fontSize: 12, color: "#ef5350", marginBottom: 4 }}>
              No Pool
            </div>
            <div
              style={{
                fontSize: isActive ? 18 : 16,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {formatEther(market.noPool)} ETH
            </div>
            {isConnected && userStakes.noStake > 0n && (
              <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                Your stake: {formatEther(userStakes.noStake)} ETH
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Betting Section */}
      {market.status === 0 && (
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
            Place Your Bet
          </div>

          {/* Quick Amount Buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {QUICK_BET_AMOUNTS.map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  background:
                    amount === quickAmount
                      ? "rgba(102, 126, 234, 0.2)"
                      : "rgba(255,255,255,0.05)",
                  border: `1px solid ${
                    amount === quickAmount
                      ? "rgba(102, 126, 234, 0.5)"
                      : "rgba(255,255,255,0.1)"
                  }`,
                  color: "var(--text-primary)",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {quickAmount} ETH
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              gap: 10,
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Amount in ETH"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                height: 40,
                borderRadius: 8,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                padding: "0 12px",
                fontSize: 14,
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={() => placeBet(true)}
              disabled={isLoading || !amount}
              style={{
                height: 40,
                borderRadius: 8,
                padding: "0 10px",
                background: "rgba(76, 175, 80, 0.1)",
                border: "1px solid rgba(76, 175, 80, 0.3)",
                color: "#4caf50",
                fontSize: 14,
                fontWeight: 600,
                cursor: isLoading || !amount ? "not-allowed" : "pointer",
                opacity: isLoading || !amount ? 0.5 : 1,
                backdropFilter: "blur(10px)",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.background = "rgba(76, 175, 80, 0.2)";
                  e.target.style.borderColor = "rgba(76, 175, 80, 0.5)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(76, 175, 80, 0.1)";
                e.target.style.borderColor = "rgba(76, 175, 80, 0.3)";
              }}
            >
              Bet Yes
            </button>
            <button
              onClick={() => placeBet(false)}
              disabled={isLoading || !amount}
              style={{
                height: 40,
                borderRadius: 8,
                padding: "0 10px",
                background: "rgba(244, 67, 54, 0.1)",
                border: "1px solid rgba(244, 67, 54, 0.3)",
                color: "#f44336",
                fontSize: 14,
                fontWeight: 600,
                cursor: isLoading || !amount ? "not-allowed" : "pointer",
                opacity: isLoading || !amount ? 0.5 : 1,
                backdropFilter: "blur(10px)",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.background = "rgba(244, 67, 54, 0.2)";
                  e.target.style.borderColor = "rgba(244, 67, 54, 0.5)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(244, 67, 54, 0.1)";
                e.target.style.borderColor = "rgba(244, 67, 54, 0.3)";
              }}
            >
              Bet No
            </button>
          </div>
        </div>
      )}

      {/* Spacer to push action buttons to bottom */}
      <div style={{ flex: 1 }}></div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>

        {market.status === 0 && (
          <button
            onClick={() => setShowConfirm("close")}
            title="Close market"
            style={{
              height: 32,
              borderRadius: 6,
              padding: "0 12px",
              background: "rgba(239, 83, 80, 0.1)",
              border: "1px solid rgba(239, 83, 80, 0.3)",
              color: "#ef5350",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        )}

        {market.status === 2 && (
          <button
            onClick={() => onNavigateToChallenge(id)}
            title="Challenge outcome"
            style={{
              height: 32,
              borderRadius: 6,
              padding: "0 12px",
              background: "rgba(255, 152, 0, 0.1)",
              border: "1px solid rgba(255, 152, 0, 0.3)",
              color: "#ff9800",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Challenge
          </button>
        )}

        {market.status === 3 && (
          <button
            onClick={claimWinnings}
            disabled={isLoading}
            title="Claim winnings"
            style={{
              height: 32,
              borderRadius: 6,
              padding: "0 12px",
              background: "rgba(76, 175, 80, 0.1)",
              border: "1px solid rgba(76, 175, 80, 0.3)",
              color: "#4caf50",
              fontSize: 12,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.5 : 1,
              backdropFilter: "blur(10px)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.background = "rgba(76, 175, 80, 0.2)";
                e.target.style.borderColor = "rgba(76, 175, 80, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(76, 175, 80, 0.1)";
              e.target.style.borderColor = "rgba(76, 175, 80, 0.3)";
            }}
          >
            💰 Claim
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.8)",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 20,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 12,
                padding: 20,
                textAlign: "center",
                backdropFilter: "blur(10px)",
                maxWidth: 280,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 12 }}>⚠️</div>
              <div style={{ marginBottom: 16, fontSize: 14 }}>
                Are you sure you want to close this market? This action cannot
                be undone.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setShowConfirm(null)}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={closeMarket}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #f44336, #ef5350)",
                    border: "none",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.5 : 1,
                  }}
                >
                  {isLoading ? "Closing..." : "Close"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              border: "3px solid rgba(255,255,255,0.3)",
              borderTop: "3px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      )}
    </div>
  );
}
