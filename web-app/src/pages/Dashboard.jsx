import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getConnection } from '../utils/solanaUtils';

function Dashboard({ wallet, connection }) {
  const [solBalance, setSolBalance] = useState(0);
  const [deployedTokens, setDeployedTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!wallet) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch SOL balance
        const balance = await connection.getBalance(wallet.publicKey);
        setSolBalance(balance / 1000000000); // Convert lamports to SOL
        
        // Check if we have any deployed tokens stored in localStorage
        const deploymentResult = localStorage.getItem('deploymentResult');
        if (deploymentResult) {
          setDeployedTokens([JSON.parse(deploymentResult)]);
        }
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [wallet, connection]);

  return (
    <div className="dashboard-container">
      <h2>Token Dashboard</h2>
      <p>Welcome to your Solana Token dashboard.</p>

      {!wallet ? (
        <div className="connect-wallet-prompt">
          <p>Please connect your wallet to view your dashboard.</p>
        </div>
      ) : isLoading ? (
        <div className="loading">Loading dashboard data...</div>
      ) : (
        <>
          <div className="dashboard-section wallet-section">
            <h3>Wallet Overview</h3>
            <div className="wallet-info">
              <div className="info-item">
                <span className="info-label">Address:</span>
                <span className="info-value">{wallet.publicKey.toString()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">SOL Balance:</span>
                <span className="info-value">{solBalance.toFixed(4)} SOL</span>
              </div>
            </div>
          </div>

          <div className="dashboard-section tokens-section">
            <h3>Your Tokens</h3>
            
            {deployedTokens.length > 0 ? (
              <div className="tokens-list">
                {deployedTokens.map((token, index) => (
                  <div key={index} className="token-item">
                    <div className="token-icon">🪙</div>
                    <div className="token-details">
                      <h4>{token.tokenName || "Custom Token"}</h4>
                      <p className="token-address">{token.tokenMintAddress}</p>
                      <p>Deployed on: {new Date(token.deployTime).toLocaleDateString()}</p>
                      <div className="token-actions">
                        <Link to="/transfer" className="secondary-btn">Transfer</Link>
                        <a 
                          href={`https://explorer.solana.com/address/${token.tokenMintAddress}?cluster=${token.network}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="secondary-btn"
                        >
                          View on Explorer
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-tokens">
                <p>You haven't deployed any tokens yet.</p>
                <Link to="/token-config" className="primary-btn">Create Token</Link>
              </div>
            )}
          </div>

          <div className="dashboard-section quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <Link to="/token-config" className="action-card">
                <div className="action-icon">⚙️</div>
                <div className="action-details">
                  <h4>Configure Token</h4>
                  <p>Set up your token parameters</p>
                </div>
              </Link>
              
              <Link to="/metadata" className="action-card">
                <div className="action-icon">🖼️</div>
                <div className="action-details">
                  <h4>Edit Metadata</h4>
                  <p>Add images and details</p>
                </div>
              </Link>
              
              <Link to="/deployment" className="action-card">
                <div className="action-icon">🚀</div>
                <div className="action-details">
                  <h4>Deploy Token</h4>
                  <p>Launch your token to a network</p>
                </div>
              </Link>
              
              <Link to="/transfer" className="action-card">
                <div className="action-icon">↗️</div>
                <div className="action-details">
                  <h4>Transfer Tokens</h4>
                  <p>Send tokens to others</p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;