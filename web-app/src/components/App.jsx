import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { connectWallet, disconnectWallet, getCurrentWallet, getConnection } from '../utils/solanaUtils';
import TokenConfiguration from '../pages/TokenConfiguration';
import TokenDescription from '../pages/MetadataEditor';
import Deployment from '../pages/Deployment';
import Transfer from '../pages/Transfer';
import Dashboard from '../pages/Dashboard';
import MetadataGuide from '../pages/MetadataGuide';

function App() {
  const [wallet, setWallet] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [network, setNetwork] = useState('devnet');
  const [walletDetectionStatus, setWalletDetectionStatus] = useState({
    phantom: false,
    solflare: false
  });

  // Initialize wallet detection
  useEffect(() => {
    // Check for wallet adapters on page load
    const checkWalletAdapters = () => {
      setWalletDetectionStatus({
        phantom: !!window.solana,
        solflare: !!window.solflare
      });
      
      console.log("Wallet detection:", {
        phantom: !!window.solana,
        solflare: !!window.solflare
      });
    };
    
    // Check immediately and then on focus
    checkWalletAdapters();
    window.addEventListener('focus', checkWalletAdapters);
    
    // Also check after a short delay to ensure extensions have time to inject
    setTimeout(checkWalletAdapters, 1000);
    
    return () => {
      window.removeEventListener('focus', checkWalletAdapters);
    };
  }, []);

  // Try to restore wallet connection on app load
  useEffect(() => {
    const restoreWalletConnection = () => {
      try {
        console.log("Attempting to restore wallet connection...");
        const restoredWallet = getCurrentWallet();
        
        if (restoredWallet) {
          console.log("Wallet connection restored:", 
            restoredWallet.walletType || "local wallet");
          setWallet(restoredWallet);
        }
      } catch (error) {
        console.error("Error restoring wallet:", error);
      }
    };
    
    restoreWalletConnection();
  }, []);

  // Listen for wallet connection/disconnection events
  useEffect(() => {
    const handleWalletEvents = () => {
      // Add Solflare listeners if available
      if (window.solflare) {
        // Listen for Solflare connection events
        const handleSolflareConnect = () => {
          if (window.solflare.publicKey) {
            console.log("Solflare connected event detected");
            handleConnectClick();
          }
        };

        const handleSolflareDisconnect = () => {
          console.log("Solflare disconnected event detected");
          handleDisconnectClick();
        };

        window.solflare.on('connect', handleSolflareConnect);
        window.solflare.on('disconnect', handleSolflareDisconnect);

        return () => {
          window.solflare.off('connect', handleSolflareConnect);
          window.solflare.off('disconnect', handleSolflareDisconnect);
        };
      }
      
      // Add Phantom listeners if available
      if (window.solana) {
        // Listen for Phantom connection events
        const handlePhantomConnect = () => {
          if (window.solana.publicKey) {
            console.log("Phantom connected event detected");
            handleConnectClick();
          }
        };

        const handlePhantomDisconnect = () => {
          console.log("Phantom disconnected event detected");
          handleDisconnectClick();
        };

        window.solana.on('connect', handlePhantomConnect);
        window.solana.on('disconnect', handlePhantomDisconnect);

        return () => {
          window.solana.off('connect', handlePhantomConnect);
          window.solana.off('disconnect', handlePhantomDisconnect);
        };
      }
    };
    
    const cleanup = handleWalletEvents();
    return cleanup;
  }, []);

  const handleConnectClick = async () => {
    setConnectionError(null);
    setIsConnecting(true);
    
    try {
      console.log("Connecting wallet from App component...");
      const connectedWallet = await connectWallet();
      console.log("Wallet connected successfully:", connectedWallet);
      setWallet(connectedWallet);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setConnectionError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectClick = () => {
    disconnectWallet();
    setWallet(null);
  };

  const handleNetworkChange = (e) => {
    setNetwork(e.target.value);
  };

  // Create a connection once we have a network selected
  useEffect(() => {
    try {
      getConnection(network);
    } catch (error) {
      console.error("Error initializing connection:", error);
    }
  }, [network]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              Solana Token Creator
            </Link>
          </div>

          <nav className="main-nav">
            <ul>
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/token-config">Token Config</Link></li>
              <li><Link to="/description">Token Description</Link></li>
              <li><Link to="/deploy">Deployment</Link></li>
              <li><Link to="/transfer">Transfer</Link></li>
              <li><Link to="/metadata-guide">Metadata Guide</Link></li>
            </ul>
          </nav>

          <div className="wallet-controls">
            <select 
              value={network} 
              onChange={handleNetworkChange}
              disabled={isConnecting}
            >
              <option value="devnet">Devnet</option>
              <option value="mainnet">Mainnet</option>
            </select>
            
            {wallet ? (
              <>
                <span className="wallet-address">
                  {wallet.publicKey.toString().substring(0, 4)}...
                  {wallet.publicKey.toString().substring(wallet.publicKey.toString().length - 4)}
                </span>
                <button onClick={handleDisconnectClick} disabled={isConnecting}>
                  Disconnect
                </button>
              </>
            ) : (
              <button onClick={handleConnectClick} disabled={isConnecting}>
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>

        {connectionError && (
          <div className="error-message" style={{ textAlign: 'center', padding: '0.5rem' }}>
            Error: {connectionError}
          </div>
        )}
        
        {!wallet && !walletDetectionStatus.phantom && !walletDetectionStatus.solflare && (
          <div className="wallet-warning" style={{ backgroundColor: '#493c85', color: 'white', textAlign: 'center', padding: '0.5rem' }}>
            No wallet extension detected. Please install Solflare or Phantom to use this app.
          </div>
        )}
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard wallet={wallet} connection={getConnection(network)} />} />
          <Route path="/token-config" element={<TokenConfiguration wallet={wallet} />} />
          <Route path="/description" element={<TokenDescription wallet={wallet} />} />
          <Route path="/deploy" element={<Deployment wallet={wallet} network={network} setNetwork={setNetwork} />} />
          <Route path="/transfer" element={<Transfer wallet={wallet} connection={getConnection(network)} />} />
          <Route path="/metadata-guide" element={<MetadataGuide />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Solana Token Creator | Built with Solana Web3.js</p>
      </footer>
    </div>
  );
}

export default App;