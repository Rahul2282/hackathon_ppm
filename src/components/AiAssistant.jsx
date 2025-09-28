import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import abi from '../abi.json';
import './AiAssistance.css';

const CONTRACT_ADDRESS = "0x241a40c355641Fec8e8b11E5197c9a3C90896132";

const AIAssistant = ({ walletAddress }) => {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingMarket, setIsCreatingMarket] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatAIResponse = (response) => {
    // Split by double newlines to get paragraphs
    const paragraphs = response.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Handle bold text (**text**)
      const formattedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Check if it's a list item (starts with -)
      if (paragraph.trim().startsWith('-')) {
        const listItems = paragraph.split('\n').filter(item => item.trim());
        return (
          <ul key={index} className="ai-list">
            {listItems.map((item, itemIndex) => (
              <li key={itemIndex} dangerouslySetInnerHTML={{ 
                __html: item.replace(/^-\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
              }} />
            ))}
          </ul>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
      );
    });
  };

  const createMarketFromAI = async (question, endTime) => {
    if (!isConnected) {
      const errorMessage = {
        type: 'error',
        content: 'Please connect your wallet first to create a market.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    setIsCreatingMarket(true);

    try {
      const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);
      
      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "createMarket",
        args: [question, BigInt(endTimestamp)],
        value: parseEther("0.001"),
      });

      console.log("Market creation transaction sent:", tx);
      
      const successMessage = {
        type: 'ai',
        content: `✅ Market created successfully!\n\n**Question:** ${question}\n**End Time:** ${new Date(endTime).toLocaleString()}\n**Transaction:** ${tx}\n\nYour market is now live and ready for trading!`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, successMessage]);
      
    } catch (err) {
      console.error('Market creation error:', err);
      const errorMessage = {
        type: 'error',
        content: `Failed to create market: ${err.message || 'Transaction failed'}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsCreatingMarket(false);
    }
  };

  const stakeFromAI = async (marketId, isYes, amount) => {
    if (!isConnected) {
      const errorMessage = {
        type: 'error',
        content: 'Please connect your wallet first to stake.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    setIsStaking(true);

    try {
      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "bet",
        args: [BigInt(marketId), isYes],
        value: parseEther(amount.toString()),
      });

      console.log("Staking transaction sent:", tx);
      
      const stakeType = isYes ? "YES" : "NO";
      const successMessage = {
        type: 'ai',
        content: `✅ Successfully staked ${amount} ETH on ${stakeType}!\n\n**Market ID:** ${marketId}\n**Stake Type:** ${stakeType}\n**Amount:** ${amount} ETH\n**Transaction:** ${tx}\n\nYour stake has been recorded!`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, successMessage]);
      
    } catch (err) {
      console.error('Staking error:', err);
      const errorMessage = {
        type: 'error',
        content: `Failed to stake: ${err.message || 'Transaction failed'}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsStaking(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || isCreatingMarket || isStaking) return;

    const userMessage = {
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('https://finalaaa.onrender.com/api/ai-agent/general', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: walletAddress || "0x5edb03076fCd7347Da720aa2A3E518159Fc51b08",
          question: inputValue
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Check if the response has the new structure with write data
        if (data.data.write && data.data.write.classify_id === 0) {
          // This is a market creation request
          const { question, endTime } = data.data.write;
          
          const confirmationMessage = {
            type: 'ai',
            content: `I'll create a market for you!\n\n**Question:** ${question}\n**End Time:** ${new Date(endTime).toLocaleString()}\n\nCreating market now...`,
            timestamp: new Date().toLocaleTimeString()
          };
          setMessages(prev => [...prev, confirmationMessage]);
          
          // Create the market
          await createMarketFromAI(question, endTime);
        } else if (data.data.write && data.data.write.classify_id === 1) {
          // This is a staking request
          const { is_yes, amount, market_id, status } = data.data.write;
          
          // Check if market is still active (status should be true for active markets)
          if (!status) {
            const errorMessage = {
              type: 'error',
              content: '❌ Cannot stake on this market - it has already been resolved or closed.',
              timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, errorMessage]);
            return;
          }
          
          const stakeType = is_yes ? "YES" : "NO";
          const confirmationMessage = {
            type: 'ai',
            content: `I'll stake ${amount} ETH on ${stakeType} for Market #${market_id}!\n\n**Market ID:** ${market_id}\n**Stake Type:** ${stakeType}\n**Amount:** ${amount} ETH\n\nProcessing stake now...`,
            timestamp: new Date().toLocaleTimeString()
          };
          setMessages(prev => [...prev, confirmationMessage]);
          
          // Execute the stake
          await stakeFromAI(market_id, is_yes, amount);
        } else if (data.data.aiResponse) {
          // Regular AI response
          const aiMessage = {
            type: 'ai',
            content: data.data.aiResponse,
            timestamp: new Date().toLocaleTimeString()
          };
          setMessages(prev => [...prev, aiMessage]);
        } else {
          const errorMessage = {
            type: 'error',
            content: 'Sorry, I received an unexpected response format.',
            timestamp: new Date().toLocaleTimeString()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } else {
        const errorMessage = {
          type: 'error',
          content: 'Sorry, I encountered an error while processing your request.',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        type: 'error',
        content: 'Sorry, I couldn\'t connect to the server. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="ai-assistant-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          backgroundColor: isOpen ? '#3b82f6' : '#1f2937',
          rotate: isOpen ? 45 : 0 
        }}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          ) : (
            <path 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          )}
        </svg>
      </motion.button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-assistant-chat"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="ai-chat-header">
              <h3>AI Assistant</h3>
              <span className="ai-status">Online</span>
            </div>
            
            <div className="ai-chat-messages">
              {messages.length === 0 && (
                <div className="ai-welcome-message">
                  <p>👋 Hi! I'm your AI assistant. I can help you with information about your market stakes and trading activities.</p>
                  <p>Try asking me something like "How much have I staked?" or "Show me my market stats"</p>
                </div>
              )}
              
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  className={`ai-message ${message.type}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="ai-message-content">
                    {message.type === 'user' ? (
                      <p>{message.content}</p>
                    ) : message.type === 'ai' ? (
                      <div className="ai-formatted-response">
                        {formatAIResponse(message.content)}
                      </div>
                    ) : (
                      <p className="error-text">{message.content}</p>
                    )}
                  </div>
                  <span className="ai-message-time">{message.timestamp}</span>
                </motion.div>
              ))}
              
              {(isLoading || isCreatingMarket || isStaking) && (
                <motion.div
                  className="ai-message ai-loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="ai-loading-content">
                    <div className="ai-typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <p>
                      {isCreatingMarket ? 'Creating market...' : 
                       isStaking ? 'Processing stake...' : 
                       'Thinking...'}
                    </p>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className="ai-chat-input">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your stakes, markets, or trading..."
                rows="2"
                disabled={isLoading || isCreatingMarket || isStaking}
              />
              <button 
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading || isCreatingMarket || isStaking}
                className="ai-send-button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      
    </>
  );
};

export default AIAssistant;