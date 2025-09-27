import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import abi from "../abi.json";
import ChallengePage from "./ChallengePage.jsx";
import MarketTabs from "./market/MarketTabs";
import CreateMarketModal from "./market/CreateMarketModal";

const CONTRACT_ADDRESS = "0x0AE8919C1403A1b681E4C4588885957Aa044Fa4A";

export default function MarketManager() {
  const [currentPage, setCurrentPage] = useState("markets");
  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const [nextId, setNextId] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const nextMarketId = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "nextMarketId",
  });

  useEffect(() => {
    if (nextMarketId.data) {
      setNextId(Number(nextMarketId.data));
    }
  }, [nextMarketId.data]);

  function navigateToChallenge(marketId) {
    setSelectedMarketId(marketId);
    setCurrentPage("challenge");
  }

  function navigateBackToMarkets() {
    setCurrentPage("markets");
    setSelectedMarketId(null);
  }

  function handleCreateSuccess() {
    // Refresh the market list or handle success
    console.log("Market created successfully!");
  }

  if (currentPage === "challenge") {
    return (
      <ChallengePage
        marketId={selectedMarketId}
        onBack={navigateBackToMarkets}
      />
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      {/* Markets with Integrated Tab Navigation */}
      <div>
        <MarketTabs
          nextId={nextId}
          onNavigateToChallenge={navigateToChallenge}
          onCreateMarket={() => setShowCreateModal(true)}
        />
      </div>

      {/* Create Market Modal */}
      <CreateMarketModal
        showModal={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}