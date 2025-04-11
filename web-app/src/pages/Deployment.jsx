import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { deployToken, getConnection } from '../utils/solanaUtils';

function Deployment({ wallet, network, setNetwork }) {
  const navigate = useNavigate();
  
  const [tokenConfig, setTokenConfig] = useState(null);
  const [tokenMetadata, setTokenMetadata] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState(null);
  const [solBalance, setSolBalance] = useState(0);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('devnet');
  
  // Load token configuration and metadata from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('tokenConfig');
    const savedMetadata = localStorage.getItem('tokenMetadata');
    
    if (savedConfig) {
      setTokenConfig(JSON.parse(savedConfig));
    } else {
      // Redirect to configuration page if no config found
      alert('Please configure your token first');
      navigate('/token-config');
    }
    
    if (savedMetadata) {
      setTokenMetadata(JSON.parse(savedMetadata));
    }
    
    // Use network from props
    setSelectedNetwork(network);
  }, [navigate, network]);
  
  // Get SOL balance when wallet changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet && wallet.publicKey) {
        try {
          const connection = getConnection(selectedNetwork);
          const balance = await connection.getBalance(wallet.publicKey);
          setSolBalance(balance / 1_000_000_000); // Convert lamports to SOL
        } catch (error) {
          console.error("Error fetching SOL balance:", error);
        }
      }
    };
    
    fetchBalance();
  }, [wallet, selectedNetwork]);
  
  const handleNetworkChange = (e) => {
    const newNetwork = e.target.value;
    setSelectedNetwork(newNetwork);
    setNetwork(newNetwork); // Update parent component's network state
  };
  
  const handleDeployButtonClick = () => {
    // Show confirmation dialog before deploying
    setShowConfirmation(true);
  };
  
  const handleCancelDeployment = () => {
    setShowConfirmation(false);
  };
  
  const handleConfirmDeployment = async () => {
    setError(null);
    setIsDeploying(true);
    setShowConfirmation(false);
    
    try {
      // Standard token deployment
      console.log("Starting token deployment on", selectedNetwork);
      console.log("Token config:", tokenConfig);
      console.log("Token metadata:", tokenMetadata);
      
      // Deploy the token using standard SPL token program
      const result = await deployToken(tokenConfig, tokenMetadata, selectedNetwork);
      
      console.log("Deployment successful:", result);
      setDeploymentResult(result);
      
      // Save the deployment result to localStorage
      localStorage.setItem('deploymentResult', JSON.stringify(result));
    } catch (error) {
      console.error("Error deploying:", error);
      setError(error.message || "Failed to deploy. Please try again.");
    } finally {
      setIsDeploying(false);
    }
  };
  
  const getRequiredSol = () => {
    // Estimate SOL needed for deployment
    return selectedNetwork === 'mainnet' ? 0.05 : 0.01;
  };
  
  const hasEnoughSol = solBalance >= getRequiredSol();
  
  return (
    <div className="deployment-container">
      <h2>Token Deployment</h2>
      <p>Deploy your token to the Solana blockchain.</p>
      
      {!wallet ? (
        <div className="connect-wallet-prompt">
          <p>Please connect your wallet first to deploy your token.</p>
        </div>
      ) : !tokenConfig ? (
        <div className="loading-screen">Loading configuration...</div>
      ) : deploymentResult ? (
        <div className="deployment-success-section">
          <h3>🎉 Deployment Successful!</h3>
          <div className="success-message">
            Your token has been successfully deployed to the {deploymentResult.network} network.
          </div>
          
          <div className="deployment-details">
            <div className="detail-item">
              <span className="detail-label">Token Name:</span>
              <span className="detail-value">{deploymentResult.tokenName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Token Symbol:</span>
              <span className="detail-value">{deploymentResult.tokenSymbol || tokenConfig.symbol}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Token Mint Address:</span>
              <span className="detail-value">{deploymentResult.tokenMintAddress}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Transaction ID:</span>
              <span className="detail-value">{deploymentResult.transactionId}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Network:</span>
              <span className="detail-value">{deploymentResult.network}</span>
            </div>
          </div>
          
          <div className="metadata-note">
            <h4>About Token Metadata</h4>
            <p>
              Your token has been created, but to make it display with your logo and description in wallets and explorers, 
              you need to assign metadata to it using the Metaplex Token Metadata standard.
            </p>
            <p>
              <strong>⭐ Next Step:</strong> Visit our <Link to="/metadata-guide" className="metadata-guide-link">Metadata Guide</Link> to 
              learn how to assign your token's logo and description so it appears properly in wallets.
            </p>
          </div>
          
          <div className="explorer-links">
            <a
              href={`https://explorer.solana.com/address/${deploymentResult.tokenMintAddress}?cluster=${deploymentResult.network}`}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-btn"
            >
              View on Solana Explorer
            </a>
            
            <button onClick={() => navigate('/transfer')} className="secondary-btn">
              Transfer Tokens
            </button>
            
            <button onClick={() => navigate('/metadata-guide')} className="secondary-btn">
              Metadata Guide
            </button>
            
            <button onClick={() => navigate('/dashboard')} className="secondary-btn">
              Go to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="token-config-summary">
            <h3>Token Configuration Summary</h3>
            <div className="form-section">
              <p><strong>Name:</strong> {tokenConfig.name}</p>
              <p><strong>Symbol:</strong> {tokenConfig.symbol}</p>
              <p><strong>Initial Supply:</strong> {tokenConfig.initialSupply.toLocaleString()}</p>
              <p><strong>Decimals:</strong> {tokenConfig.decimals}</p>
            </div>
          </div>
          
          {tokenMetadata && (
            <div className="metadata-summary">
              <h3>Token Metadata</h3>
              <div className="form-section">
                <div className="metadata-preview">
                  {tokenMetadata.imageUrl && (
                    <img src={tokenMetadata.imageUrl} alt="Token logo" className="token-logo-preview" />
                  )}
                  <div>
                    <p><strong>Description:</strong> {tokenMetadata.description}</p>
                    {tokenMetadata.externalUrl && (
                      <p><strong>Website:</strong> {tokenMetadata.externalUrl}</p>
                    )}
                    {tokenMetadata.attributes && tokenMetadata.attributes.length > 0 && (
                      <p><strong>Attributes:</strong> {tokenMetadata.attributes.length} defined</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="deployment-controls">
            <h3>Deployment Options</h3>
            <div className="form-section">
              <h4>Select Deployment Network</h4>
              <p>Choose which Solana network to deploy your token to:</p>
              
              <div className="deployment-network-options">
                <div className="deployment-network-option">
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="devnet"
                      name="network"
                      value="devnet"
                      checked={selectedNetwork === 'devnet'}
                      onChange={handleNetworkChange}
                    />
                    <label htmlFor="devnet">Devnet (Recommended for testing)</label>
                  </div>
                  <p>Solana's development network - perfect for testing your token before going live.</p>
                  <p>Cost: ~0.01 SOL (free test SOL available from faucets)</p>
                </div>
                
                <div className="deployment-network-option">
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="mainnet"
                      name="network"
                      value="mainnet"
                      checked={selectedNetwork === 'mainnet'}
                      onChange={handleNetworkChange}
                    />
                    <label htmlFor="mainnet">Mainnet (Production)</label>
                  </div>
                  <p>The main Solana blockchain where real-value transactions happen.</p>
                  <p>Cost: ~0.05 SOL (using real SOL)</p>
                </div>
              </div>
              
              <div className="wallet-status">
                <p>Connected wallet: <strong>{wallet.publicKey.toString().substring(0, 8)}...</strong></p>
                <p className={`wallet-balance ${!hasEnoughSol ? 'insufficient-balance' : ''}`}>
                  Balance: <strong>{solBalance.toFixed(4)} SOL</strong>
                  {!hasEnoughSol && (
                    <span className="insufficient-balance-warning">
                      {' '}(Insufficient balance for deployment. You need at least {getRequiredSol()} SOL)
                    </span>
                  )}
                </p>
              </div>
              
              <div className="deployment-actions">
                <button
                  className="primary-btn"
                  onClick={handleDeployButtonClick}
                  disabled={isDeploying || !hasEnoughSol}
                >
                  {isDeploying ? 'Deploying...' : 'Deploy Token'}
                </button>
                
                <button
                  className="secondary-btn"
                  onClick={() => navigate('/metadata')}
                  disabled={isDeploying}
                >
                  Back to Metadata
                </button>
              </div>
              
              {error && <div className="error-message">{error}</div>}
            </div>
          </div>
          
          {/* Confirmation Modal */}
          {showConfirmation && (
            <div className="confirmation-modal">
              <div className="confirmation-content">
                <h3>Confirm Token Deployment</h3>
                <p>You are about to deploy your token <strong>{tokenConfig.name} ({tokenConfig.symbol})</strong> to the <strong>{selectedNetwork}</strong> network.</p>
                
                {selectedNetwork === 'mainnet' && (
                  <div className="warning-message">
                    <p>⚠️ <strong>Warning:</strong> You are deploying to Mainnet. This will use real SOL and cannot be undone.</p>
                  </div>
                )}
                
                <p>This will create a new token with an initial supply of <strong>{tokenConfig.initialSupply.toLocaleString()}</strong> tokens.</p>
                <p>Estimated cost: <strong>{getRequiredSol()} SOL</strong></p>
                
                <div className="confirmation-actions">
                  <button className="secondary-btn" onClick={handleCancelDeployment}>Cancel</button>
                  <button className="primary-btn" onClick={handleConfirmDeployment}>Confirm & Deploy</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Deployment;