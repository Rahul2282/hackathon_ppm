import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedMarketCard from "./EnhancedMarketCard";
import SkeletonMarketCard from "./SkeletonMarketCard";

const STATUS_TABS = [
  { id: "active", label: "Active", status: 0, emoji: "🟢", count: 0 },
  { id: "resolving", label: "Resolving", status: [1, 2], emoji: "⏳", count: 0 },
  { id: "resolved", label: "Resolved", status: 3, emoji: "✅", count: 0 },
];

export default function MarketTabs({ nextId, onNavigateToChallenge, onCreateMarket }) {
  const [activeTab, setActiveTab] = useState("active");
  const [marketStatuses, setMarketStatuses] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [cardRefreshCallbacks, setCardRefreshCallbacks] = useState({});

  // Function to register card refresh callback
  const registerCardRefresh = useCallback((marketId, refreshCallback) => {
    setCardRefreshCallbacks(prev => ({
      ...prev,
      [marketId]: refreshCallback
    }));
  }, []);

  // Function to update market status
  const updateMarketStatus = (marketId, status) => {
    setMarketStatuses(prev => ({
      ...prev,
      [marketId]: status
    }));
  };

  // Function to refresh all markets
  const refreshAllMarkets = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Trigger refresh for all registered cards
      const refreshPromises = Object.values(cardRefreshCallbacks).map(callback => 
        callback ? callback() : Promise.resolve()
      );
      
      // Wait for all card refreshes to complete
      await Promise.all(refreshPromises);
      
      // Trigger a refresh by updating the refresh trigger
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error refreshing markets:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [cardRefreshCallbacks]);

  // Auto-refresh on component mount
  useEffect(() => {
    // Add a small delay to ensure all cards are registered before refreshing
    const timer = setTimeout(() => {
      refreshAllMarkets();
    }, 500);

    return () => clearTimeout(timer);
  }, [refreshAllMarkets]); // Include refreshAllMarkets in dependencies

  // Calculate tab counts
  const tabCounts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab.id] = Object.values(marketStatuses).filter(status => {
      if (Array.isArray(tab.status)) {
        return tab.status.includes(status);
      }
      return status === tab.status;
    }).length;
    return acc;
  }, {});

  // Filter markets based on active tab
  const getFilteredMarkets = () => {
    if (nextId === 0) return [];
    
    return Array.from({ length: nextId }, (_, i) => {
      const marketId = i;
      const status = marketStatuses[marketId] ?? 0; // Default to active if not loaded yet
      
      if (activeTab === "active" && status === 0) return marketId;
      if (activeTab === "resolving" && (status === 1 || status === 2)) return marketId;
      if (activeTab === "resolved" && status === 3) return marketId;
      
      return null;
    }).filter(Boolean);
  };

  const filteredMarkets = getFilteredMarkets();

  const tabVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth feel
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.25,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      scale: 0.9,
      rotateX: -15,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    exit: {
      opacity: 0,
      y: -30,
      scale: 0.9,
      rotateX: 15,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Sleek Tab Navigation with Add Market Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          marginBottom: "12px",
          padding: "2px",
          background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
          borderRadius: "6px",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Tabs Section */}
        <div
          style={{
            display: "flex",
            gap: "1px",
            flex: 1,
          }}
        >
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "4px",
                background: activeTab === tab.id 
                  ? "linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(102, 126, 234, 0.1))" 
                  : "transparent",
                border: activeTab === tab.id 
                  ? "1px solid rgba(102, 126, 234, 0.3)" 
                  : "1px solid transparent",
                color: activeTab === tab.id 
                  ? "var(--text-primary)" 
                  : "var(--text-secondary)",
                fontSize: "12px",
                fontWeight: activeTab === tab.id ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                position: "relative",
                boxShadow: activeTab === tab.id 
                  ? "0 1px 3px rgba(102, 126, 234, 0.08)" 
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = "rgba(255,255,255,0.06)";
                  e.target.style.color = "var(--text-primary)";
                  e.target.style.transform = "translateY(-0.5px)";
                  e.target.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = "transparent";
                  e.target.style.color = "var(--text-secondary)";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }
              }}
            >
              {/* <span style={{ fontSize: "14px" }}>{tab.emoji}</span> */}
              <span>{tab.label}</span>
              {tabCounts[tab.id] > 0 && (
                <span
                  style={{
                    background: activeTab === tab.id 
                      ? "rgba(102, 126, 234, 0.3)" 
                      : "rgba(255,255,255,0.1)",
                    color: activeTab === tab.id 
                      ? "var(--text-primary)" 
                      : "var(--text-secondary)",
                    padding: "2px 6px",
                    borderRadius: "8px",
                    fontSize: "10px",
                    fontWeight: 600,
                    minWidth: "16px",
                    textAlign: "center",
                    letterSpacing: "0.3px",
                  }}
                >
                  {tabCounts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <motion.button
          onClick={refreshAllMarkets}
          disabled={isRefreshing}
          whileHover={{ scale: isRefreshing ? 1 : 1.01, y: isRefreshing ? 0 : -0.5 }}
          whileTap={{ scale: isRefreshing ? 1 : 0.99 }}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            background: isRefreshing 
              ? "rgba(102, 126, 234, 0.3)" 
              : "linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)",
            border: "none",
            color: "white",
            fontSize: "12px",
            fontWeight: 600,
            cursor: isRefreshing ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            boxShadow: isRefreshing 
              ? "0 1px 3px rgba(102, 126, 234, 0.1)" 
              : "0 1px 4px rgba(102, 126, 234, 0.15)",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
            opacity: isRefreshing ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isRefreshing) {
              e.target.style.boxShadow = "0 2px 6px rgba(102, 126, 234, 0.2)";
              e.target.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = isRefreshing 
              ? "0 1px 3px rgba(102, 126, 234, 0.1)" 
              : "0 1px 4px rgba(102, 126, 234, 0.15)";
            e.target.style.transform = "translateY(0)";
          }}
        >
          {isRefreshing ? (
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
          ) : (
            <span style={{ fontSize: "14px" }}>🔄</span>
          )}
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </motion.button>

        {/* Add Market Button */}
        <motion.button
          onClick={onCreateMarket}
          whileHover={{ scale: 1.01, y: -0.5 }}
          whileTap={{ scale: 0.99 }}
          style={{
            padding: "8px 16px",
            borderRadius: "4px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            color: "white",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            boxShadow: "0 1px 4px rgba(102, 126, 234, 0.15)",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = "0 2px 6px rgba(102, 126, 234, 0.2)";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = "0 1px 4px rgba(102, 126, 234, 0.15)";
            e.target.style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: "14px" }}>➕</span>
          <span>Create</span>
        </motion.button>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={`${activeTab}-${refreshTrigger}`}
        variants={tabVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{
          minHeight: 300,
          perspective: "1000px", // Enable 3D transforms
        }}
      >
        {/* Empty State */}
        {filteredMarkets.length === 0 && nextId === 0 ? (
          <motion.div
            variants={cardVariants}
            style={{
              textAlign: "center",
              padding: "24px",
              borderRadius: "8px",
              border: "1px dashed rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📊</div>
            <h3
              style={{
                color: "var(--text-primary)",
                marginBottom: "4px",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              No markets yet
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                margin: 0,
                opacity: 0.8,
              }}
            >
              Be the first to create a prediction market!
            </p>
          </motion.div>
        ) : filteredMarkets.length === 0 ? (
          <motion.div
            variants={cardVariants}
            style={{
              textAlign: "center",
              padding: "24px",
              borderRadius: "8px",
              border: "1px dashed rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>
              {STATUS_TABS.find(tab => tab.id === activeTab)?.emoji}
            </div>
            <h3
              style={{
                color: "var(--text-primary)",
                marginBottom: "4px",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              No {STATUS_TABS.find(tab => tab.id === activeTab)?.label.toLowerCase()} markets
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                margin: 0,
                opacity: 0.8,
              }}
            >
              {activeTab === "active" && "All markets are currently resolved or resolving."}
              {activeTab === "resolving" && "No markets are currently in the resolution phase."}
              {activeTab === "resolved" && "No markets have been resolved yet."}
            </p>
          </motion.div>
        ) : (
          /* Markets Grid */
          <motion.div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
              gap: "16px",
              padding: "8px 0", // Add some padding for better spacing
            }}
          >
            <AnimatePresence mode="popLayout">
              {filteredMarkets.map((marketId) => (
                <motion.div
                  key={`${activeTab}-${marketId}-${refreshTrigger}`}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover="hover"
                  layout
                  style={{
                    transformStyle: "preserve-3d", // Enable 3D transforms
                  }}
                >
                  <EnhancedMarketCard
                    id={marketId}
                    onNavigateToChallenge={onNavigateToChallenge}
                    onStatusUpdate={(status) => updateMarketStatus(marketId, status)}
                    onRegisterRefresh={(refreshCallback) => registerCardRefresh(marketId, refreshCallback)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
