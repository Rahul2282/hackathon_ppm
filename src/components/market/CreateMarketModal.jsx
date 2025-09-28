import { useState, useEffect } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import abi from "../../abi.json";

const CONTRACT_ADDRESS = "0x241a40c355641Fec8e8b11E5197c9a3C90896132";

export default function CreateMarketModal({ 
  showModal, 
  onClose, 
  onSuccess 
}) {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
  const [question, setQuestion] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);

  // Form validation
  const [questionError, setQuestionError] = useState("");
  const [timeError, setTimeError] = useState("");

  // Real-time form validation
  useEffect(() => {
    if (question && question.length < 10) {
      setQuestionError("Question must be at least 10 characters");
    } else if (question && question.length > 200) {
      setQuestionError("Question must be less than 200 characters");
    } else {
      setQuestionError("");
    }
  }, [question]);

  useEffect(() => {
    if (endTime) {
      const selectedTime = new Date(endTime).getTime();
      const now = Date.now();
      const minTime = now + 5 * 60 * 1000; // 5 minutes from now
      const maxTime = now + 365 * 24 * 60 * 60 * 1000; // 1 year from now

      if (selectedTime <= minTime) {
        setTimeError("End time must be at least 5 minutes from now");
      } else if (selectedTime >= maxTime) {
        setTimeError("End time must be within 1 year");
      } else {
        setTimeError("");
      }
    }
  }, [endTime]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!showModal) {
      setQuestion("");
      setEndTime("");
      setCreateError("");
      setCreateSuccess(false);
      setQuestionError("");
      setTimeError("");
    }
  }, [showModal]);

  async function createMarket() {
    if (!isConnected) {
      setCreateError("Please connect your wallet first");
      return;
    }

    if (!question || !endTime || questionError || timeError) {
      setCreateError("Please fill all fields correctly");
      return;
    }

    setIsCreating(true);
    setCreateError("");

    const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);

    try {
      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "createMarket",
        args: [question, BigInt(endTimestamp)],
        value: parseEther("0.001"),
      });

      console.log("Transaction sent:", tx);
      setCreateSuccess(true);

      // Clear success message after 3 seconds and close modal
      setTimeout(() => {
        setCreateSuccess(false);
        onSuccess?.();
        onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
      setCreateError(err.message || "Transaction failed");
    } finally {
      setIsCreating(false);
    }
  }

  const handleClose = () => {
    setCreateError("");
    setCreateSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              padding: 24,
              width: "100%",
              maxWidth: 600,
              backdropFilter: "blur(20px)",
              position: "relative",
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
                e.target.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
                e.target.style.color = "var(--text-secondary)";
              }}
            >
              ×
            </button>

            {/* Modal Header */}
            <div
              style={{
                marginBottom: 24,
                paddingRight: 40,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 8,
                }}
              >
                Create New Market
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  opacity: 0.8,
                }}
              >
                Set up a new prediction market and start earning
              </p>
            </div>

            {/* Form Content */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 200px",
                gap: 16,
                alignItems: "start",
                marginBottom: 20,
              }}
            >
              {/* Question Input */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--text-primary)",
                  }}
                >
                  Market Question *
                </label>
                <input
                  type="text"
                  placeholder="What will happen? (e.g., Bitcoin reaches $100k by Dec 2024)"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${
                      questionError ? "#ef5350" : "rgba(255,255,255,0.15)"
                    }`,
                    padding: "0 14px",
                    fontSize: 15,
                    color: "var(--text-primary)",
                    transition: "all 0.2s ease",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(102, 126, 234, 0.6)";
                    e.target.style.background = "rgba(255,255,255,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = questionError
                      ? "#ef5350"
                      : "rgba(255,255,255,0.15)";
                    e.target.style.background = "rgba(255,255,255,0.06)";
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 6,
                    minHeight: 18,
                  }}
                >
                  {questionError ? (
                    <div
                      style={{
                        color: "#ef5350",
                        fontSize: 12,
                      }}
                    >
                      {questionError}
                    </div>
                  ) : (
                    <div></div>
                  )}
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      opacity: 0.6,
                    }}
                  >
                    {question.length}/200
                  </div>
                </div>
              </div>

              {/* Date/Time Input */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--text-primary)",
                  }}
                >
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={new Date(Date.now() + 60 * 60 * 1000)
                    .toISOString()
                    .slice(0, 16)}
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${
                      timeError ? "#ef5350" : "rgba(255,255,255,0.15)"
                    }`,
                    padding: "0 14px",
                    fontSize: 15,
                    color: "var(--text-primary)",
                    transition: "all 0.2s ease",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(102, 126, 234, 0.6)";
                    e.target.style.background = "rgba(255,255,255,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = timeError
                      ? "#ef5350"
                      : "rgba(255,255,255,0.15)";
                    e.target.style.background = "rgba(255,255,255,0.06)";
                  }}
                />
                <div
                  style={{
                    marginTop: 6,
                    minHeight: 18,
                  }}
                >
                  {timeError && (
                    <div
                      style={{
                        color: "#ef5350",
                        fontSize: 12,
                      }}
                    >
                      {timeError}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fee Info */}
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(102, 126, 234, 0.08)",
                border: "1px solid rgba(102, 126, 234, 0.2)",
                borderRadius: 8,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>Market creation fee:</span>
                <span
                  style={{
                    color: "var(--text-primary)",
                    fontWeight: 500,
                  }}
                >
                  0.001 ETH
                </span>
              </div>
            </div>

            {/* Error/Success Messages */}
            <AnimatePresence>
              {createError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    padding: "12px 16px",
                    background: "rgba(239, 83, 80, 0.1)",
                    border: "1px solid rgba(239, 83, 80, 0.3)",
                    borderRadius: 8,
                    color: "#ef5350",
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  {createError}
                </motion.div>
              )}

              {createSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    padding: "12px 16px",
                    background: "rgba(76, 175, 80, 0.1)",
                    border: "1px solid rgba(76, 175, 80, 0.3)",
                    borderRadius: 8,
                    color: "#4caf50",
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  Market created successfully! Closing in 3 seconds...
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleClose}
                style={{
                  height: 40,
                  borderRadius: 8,
                  padding: "0 20px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)";
                }}
              >
                Cancel
              </button>
              <button
                onClick={createMarket}
                disabled={
                  isCreating ||
                  !question ||
                  !endTime ||
                  questionError ||
                  timeError ||
                  !isConnected
                }
                style={{
                  height: 40,
                  borderRadius: 8,
                  padding: "0 24px",
                  background: isCreating
                    ? "rgba(102, 126, 234, 0.3)"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: isCreating ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity:
                    isCreating ||
                    !question ||
                    !endTime ||
                    questionError ||
                    timeError ||
                    !isConnected
                      ? 0.6
                      : 1,
                }}
                onMouseEnter={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(102, 126, 234, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                {isCreating ? (
                  <>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid white",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Creating...
                  </>
                ) : (
                  "Create Market"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
