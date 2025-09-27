import { useState } from "react";
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

  // Function to update market status
  const updateMarketStatus = (marketId, status) => {
    setMarketStatuses(prev => ({
      ...prev,
      [marketId]: status
    }));
  };

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
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
                  ? "0 2px 8px rgba(102, 126, 234, 0.15)" 
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = "rgba(255,255,255,0.06)";
                  e.target.style.color = "var(--text-primary)";
                  e.target.style.transform = "translateY(-0.5px)";
                  e.target.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.08)";
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
            boxShadow: "0 2px 8px rgba(102, 126, 234, 0.25)",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = "0 3px 12px rgba(102, 126, 234, 0.35)";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.25)";
            e.target.style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: "14px" }}>➕</span>
          <span>Create</span>
        </motion.button>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        variants={tabVariants}
        initial="hidden"
        animate="visible"
        style={{
          minHeight: 300,
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
              gap: "12px",
            }}
          >
            <AnimatePresence mode="wait">
              {filteredMarkets.map((marketId, index) => (
                <motion.div
                  key={`${activeTab}-${marketId}`}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <EnhancedMarketCard
                    id={marketId}
                    onNavigateToChallenge={onNavigateToChallenge}
                    onStatusUpdate={(status) => updateMarketStatus(marketId, status)}
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
