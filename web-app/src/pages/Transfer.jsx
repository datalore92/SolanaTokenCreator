import React, { useState, useEffect } from 'react';
import { getTokenBalance, transferTokens } from '../utils/solanaUtils';

function Transfer({ wallet, connection }) {
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    tokenMintAddress: ''
  });
  
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [recentRecipients, setRecentRecipients] = useState([]);
  const [deployedTokens, setDeployedTokens] = useState([]);
  
  // Load deployed tokens and recent recipients from localStorage
  useEffect(() => {
    if (!wallet) return;
    
    // Load deployed tokens
    const deploymentResult = localStorage.getItem('deploymentResult');
    if (deploymentResult) {
      try {
        const deployment = JSON.parse(deploymentResult);
        setDeployedTokens([deployment]);
        setFormData(prev => ({
          ...prev,
          tokenMintAddress: deployment.tokenMintAddress
        }));
        
        // Fetch balance
        getTokenBalance(deployment.tokenMintAddress)
          .then(amount => {
            setBalance(amount);
          })
          .catch(console.error);
      } catch (error) {
        console.error("Error loading deployment data:", error);
      }
    }
    
    // Load recent recipients
    const savedRecipients = localStorage.getItem('recentRecipients');
    if (savedRecipients) {
      try {
        setRecentRecipients(JSON.parse(savedRecipients));
      } catch (error) {
        console.error("Error loading recent recipients:", error);
      }
    }
  }, [wallet]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error message when form changes
    setErrorMessage('');
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const setMaxAmount = () => {
    setFormData(prev => ({
      ...prev,
      amount: balance.toString()
    }));
  };
  
  const selectRecipient = (address) => {
    setFormData(prev => ({
      ...prev,
      recipient: address
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear messages
    setErrorMessage('');
    setSuccessMessage('');
    
    // Validate form
    if (!formData.recipient.trim()) {
      setErrorMessage('Recipient address is required');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setErrorMessage('Amount must be greater than 0');
      return;
    }
    
    if (parseFloat(formData.amount) > balance) {
      setErrorMessage('Amount exceeds your balance');
      return;
    }
    
    if (!formData.tokenMintAddress) {
      setErrorMessage('No token selected for transfer');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Send transfer transaction
      const result = await transferTokens(
        formData.recipient,
        parseFloat(formData.amount),
        formData.tokenMintAddress
      );
      
      // Add recipient to recent recipients if not already in the list
      const existingIndex = recentRecipients.findIndex(r => r.address === formData.recipient);
      const updatedRecipients = [...recentRecipients];
      
      if (existingIndex >= 0) {
        // Move to top of list if already exists
        const [recipient] = updatedRecipients.splice(existingIndex, 1);
        updatedRecipients.unshift(recipient);
      } else {
        // Add new recipient
        updatedRecipients.unshift({
          address: formData.recipient,
          name: `Recipient ${updatedRecipients.length + 1}`,
          lastUsed: new Date().toISOString()
        });
        
        // Keep only last 5 recipients
        if (updatedRecipients.length > 5) {
          updatedRecipients.pop();
        }
      }
      
      // Save updated recipients
      setRecentRecipients(updatedRecipients);
      localStorage.setItem('recentRecipients', JSON.stringify(updatedRecipients));
      
      // Update balance
      const newBalance = balance - parseFloat(formData.amount);
      setBalance(newBalance);
      
      // Show success message
      setSuccessMessage(`Successfully transferred ${formData.amount} tokens to ${formData.recipient.substr(0, 8)}...`);
      
      // Clear form
      setFormData(prev => ({
        ...prev,
        recipient: '',
        amount: ''
      }));
    } catch (error) {
      console.error("Transfer error:", error);
      setErrorMessage(error.message || 'Transfer failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="transfer-page">
      <h1>Transfer Tokens</h1>
      <p>Send your custom tokens to other Solana wallets.</p>
      
      {!wallet ? (
        <div className="connect-wallet-prompt">
          <p>Please connect your wallet first to transfer tokens.</p>
        </div>
      ) : deployedTokens.length === 0 ? (
        <div className="no-tokens-message">
          <p>You haven't deployed any tokens yet that you can transfer.</p>
        </div>
      ) : (
        <>
          <div className="balance-info">
            <h3>Your Token Balance</h3>
            <p className="balance-amount">{balance.toLocaleString()} {deployedTokens[0]?.symbol || 'tokens'}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="transfer-form">
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            <div className="form-group">
              <label htmlFor="recipient">Recipient Address*</label>
              <input
                id="recipient"
                name="recipient"
                type="text"
                value={formData.recipient}
                onChange={handleChange}
                placeholder="Enter Solana wallet address"
                disabled={isLoading}
              />
              <small>The Solana wallet address that will receive the tokens</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="amount">Amount*</label>
              <div className="amount-input-container">
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="How many tokens to send"
                  min="1"
                  max={balance.toString()}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="max-button"
                  onClick={setMaxAmount}
                  disabled={isLoading}
                >
                  MAX
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="transfer-button"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Send Tokens'}
            </button>
          </form>
          
          {recentRecipients.length > 0 && (
            <div className="recent-recipients">
              <h3>Recent Recipients</h3>
              <div className="recipients-list">
                {recentRecipients.map((recipient, index) => (
                  <div
                    key={index}
                    className="recipient-item"
                    onClick={() => selectRecipient(recipient.address)}
                  >
                    <div className="recipient-avatar">
                      {recipient.name.charAt(0)}
                    </div>
                    <div className="recipient-info">
                      <div className="recipient-name">{recipient.name}</div>
                      <div className="recipient-address">
                        {`${recipient.address.substring(0, 4)}...${recipient.address.substring(recipient.address.length - 4)}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Transfer;