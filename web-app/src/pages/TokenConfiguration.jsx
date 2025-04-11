import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TokenConfiguration({ wallet }) {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    initialSupply: '1000000',
    decimals: '9'
  });
  
  const [errors, setErrors] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  
  // Load saved configuration from localStorage if available
  useEffect(() => {
    const savedConfig = localStorage.getItem('tokenConfig');
    if (savedConfig) {
      setFormData(JSON.parse(savedConfig));
    }
  }, []);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Token name is required';
    } else if (formData.name.length > 32) {
      newErrors.name = 'Token name must be 32 characters or less';
    }
    
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Token symbol is required';
    } else if (formData.symbol.length > 10) {
      newErrors.symbol = 'Token symbol must be 10 characters or less';
    }
    
    const initialSupply = Number(formData.initialSupply);
    if (isNaN(initialSupply) || initialSupply <= 0) {
      newErrors.initialSupply = 'Initial supply must be a positive number';
    } else if (initialSupply > Number.MAX_SAFE_INTEGER) {
      newErrors.initialSupply = 'Initial supply is too large';
    }
    
    const decimals = Number(formData.decimals);
    if (isNaN(decimals) || decimals < 0 || decimals > 9 || !Number.isInteger(decimals)) {
      newErrors.decimals = 'Decimals must be an integer between 0 and 9';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Save configuration to localStorage
      const configToSave = {
        ...formData,
        initialSupply: Number(formData.initialSupply),
        decimals: Number(formData.decimals)
      };
      
      localStorage.setItem('tokenConfig', JSON.stringify(configToSave));
      
      setIsSaved(true);
      
      // Navigate to metadata editor after a brief delay
      setTimeout(() => {
        navigate('/description');
      }, 1500);
    }
  };
  
  return (
    <div className="token-configuration-container">
      <h2>Token Configuration</h2>
      <p>Configure the parameters for your new Solana token.</p>
      
      {!wallet ? (
        <div className="connect-wallet-prompt">
          <p>Please connect your wallet first to configure your token.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="token-config-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Token Name*</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., My Awesome Token"
                className={errors.name ? "error" : ""}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
              <small>The full name of your token (max 32 characters)</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="symbol">Token Symbol*</label>
              <input
                id="symbol"
                name="symbol"
                type="text"
                value={formData.symbol}
                onChange={handleChange}
                placeholder="e.g., MAT"
                className={errors.symbol ? "error" : ""}
              />
              {errors.symbol && <div className="error-message">{errors.symbol}</div>}
              <small>The ticker symbol for your token (max 10 characters)</small>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Token Economics</h3>
            
            <div className="form-group">
              <label htmlFor="initialSupply">Initial Supply*</label>
              <input
                id="initialSupply"
                name="initialSupply"
                type="text"
                value={formData.initialSupply}
                onChange={handleChange}
                placeholder="e.g., 1000000"
                className={errors.initialSupply ? "error" : ""}
              />
              {errors.initialSupply && <div className="error-message">{errors.initialSupply}</div>}
              <small>The initial amount of tokens to create</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="decimals">Decimals*</label>
              <input
                id="decimals"
                name="decimals"
                type="number"
                min="0"
                max="9"
                value={formData.decimals}
                onChange={handleChange}
                className={errors.decimals ? "error" : ""}
              />
              {errors.decimals && <div className="error-message">{errors.decimals}</div>}
              <small>Divisibility of the token (0-9, typically 9 for Solana tokens)</small>
            </div>
            
            <div className="info-box">
              <p>
                <strong>What are decimals?</strong> Decimals determine how divisible a token can be. 
                For example, with 2 decimals, 1 token can be divided into 100 smaller units (like cents to a dollar).
                Most Solana tokens use 9 decimals.
              </p>
            </div>
            
            <div className="info-box">
              <p>
                <strong>Note about SPL tokens:</strong> Standard SPL tokens are created with you (the creator's wallet)
                as both the mint authority and freeze authority. This means you can mint more tokens or freeze token accounts
                in the future if needed.
              </p>
            </div>
          </div>
          
          <div className="form-actions">
            {isSaved && <div className="success-message">Configuration saved successfully!</div>}
            <button type="submit" className="primary-btn">
              Continue to Token Description
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default TokenConfiguration;