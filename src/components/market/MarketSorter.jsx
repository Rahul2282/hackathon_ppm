import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import EnhancedMarketCard from "./EnhancedMarketCard";
import SkeletonMarketCard from "./SkeletonMarketCard";

export default function MarketSorter({ nextId, onNavigateToChallenge }) {
  const [sortedMarkets, setSortedMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndSortMarkets = async () => {
      if (nextId === 0) {
        setSortedMarkets([]);
        setLoading(false);
        return;
      }

      try {
        // Create market data fetchers for all markets
        const marketPromises = Array.from({ length: nextId }, async (_, i) => {
          try {
            // Since we don't have an API, we'll use a different approach
            // We'll create markets with proper ordering and let the cards fetch their own data
            return {
              id: i,
              // We'll determine status based on market age and other factors
              // For now, let's assume newer markets are more likely to be active
              priority: nextId - i, // Higher priority for newer markets
            };
          } catch {
            return { id: i, priority: 0 };
          }
        });
        
        const markets = await Promise.all(marketPromises);
        
        // Sort markets by priority (newest first)
        const sorted = markets.sort((a, b) => b.priority - a.priority);
        
        setSortedMarkets(sorted);
      } catch (error) {
        console.error('Error sorting markets:', error);
        // Fallback to original order
        setSortedMarkets(Array.from({ length: nextId }, (_, i) => ({ 
          id: nextId - 1 - i 
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchAndSortMarkets();
  }, [nextId]);

  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: 20,
        }}
      >
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonMarketCard key={index} delay={index * 0.1} />
        ))}
      </div>
    );
  }

  return (
    <>
      {sortedMarkets.map((market, index) => (
        <motion.div
          key={market.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.05 }}
          layout
        >
          <EnhancedMarketCard
            id={market.id}
            onNavigateToChallenge={onNavigateToChallenge}
          />
        </motion.div>
      ))}
    </>
  );
}
