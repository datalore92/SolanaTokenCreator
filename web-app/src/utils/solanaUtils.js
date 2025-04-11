import { 
  Connection, 
  clusterApiUrl, 
  PublicKey, 
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { 
  createMint, 
  getMint, 
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  getAccount,
  createInitializeMintInstruction,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import * as bip39 from 'bip39';

// Track current wallet across the application
let currentWallet = null;
let currentConnection = null;

/**
 * Get a connection to the Solana network
 */
export function getConnection(network = 'devnet') {
  try {
    if (!currentConnection || currentConnection.network !== network) {
      const endpoint = clusterApiUrl(network);
      currentConnection = new Connection(endpoint, 'confirmed');
      currentConnection.network = network;
      console.log(`Connected to Solana ${network}`);
    }
    return currentConnection;
  } catch (error) {
    console.error("Error getting connection:", error);
    throw new Error(`Failed to connect to ${network}: ${error.message}`);
  }
}

/**
 * Get the current wallet if available
 */
export function getCurrentWallet() {
  try {
    // If we already have a wallet object in memory, return it
    if (currentWallet) {
      return currentWallet;
    }
    
    // Try to get wallet from localStorage
    const walletType = localStorage.getItem('walletType');
    const walletPublicKey = localStorage.getItem('walletPublicKey');
    
    if (!walletType || !walletPublicKey) {
      return null;
    }
    
    console.log(`Restoring ${walletType} wallet from localStorage`);
    
    if (walletType === 'Phantom' && window.solana) {
      // For Phantom wallet, create a proxy to the browser extension
      currentWallet = {
        publicKey: new PublicKey(walletPublicKey),
        signTransaction: async (tx) => window.solana.signTransaction(tx),
        signAllTransactions: async (txs) => window.solana.signAllTransactions(txs),
        walletType: 'Phantom'
      };
      return currentWallet;
    } else if (walletType === 'Solflare' && window.solflare) {
      // For Solflare wallet, create a proxy to the browser extension
      currentWallet = {
        publicKey: new PublicKey(walletPublicKey),
        signTransaction: async (tx) => window.solflare.signTransaction(tx),
        signAllTransactions: async (txs) => window.solflare.signAllTransactions(txs),
        walletType: 'Solflare'
      };
      return currentWallet;
    } else if (walletType === 'local') {
      // For local wallets, reconstruct the keypair
      const keypairData = localStorage.getItem('localKeypair');
      if (keypairData) {
        const secretKey = new Uint8Array(JSON.parse(keypairData));
        currentWallet = Keypair.fromSecretKey(secretKey);
        return currentWallet;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error getting current wallet:", error);
    return null;
  }
}

/**
 * Connect to a wallet by creating a new one or using a seed phrase
 */
export async function connectWallet(seedPhrase = null) {
  try {
    console.log("connectWallet called in solanaUtils.js");
    
    // If we detect a browser wallet like Solflare
    if (typeof window !== 'undefined' && window.solflare) {
      console.log("Solflare detected in solanaUtils.js");
      try {
        // Check if already connected
        if (window.solflare.isConnected) {
          console.log("Solflare is already connected");
        } else {
          console.log("Requesting Solflare connection...");
          await window.solflare.connect();
          console.log("Solflare connect completed");
        }
        
        const publicKey = window.solflare.publicKey;
        console.log("Got Solflare public key:", publicKey?.toString());
        
        if (!publicKey) {
          throw new Error("Failed to get public key from Solflare");
        }
        
        // Create a proxy wallet object that wraps around browser wallet
        currentWallet = {
          publicKey,
          signTransaction: async (tx) => {
            console.log("Requesting Solflare to sign transaction");
            return await window.solflare.signTransaction(tx);
          },
          signAllTransactions: async (txs) => {
            console.log("Requesting Solflare to sign multiple transactions");
            return await window.solflare.signAllTransactions(txs);
          },
          walletType: 'Solflare'
        };
        
        // Save wallet information
        localStorage.setItem('walletPublicKey', publicKey.toString());
        localStorage.setItem('walletType', 'Solflare');
        
        return currentWallet;
      } catch (e) {
        console.error("Failed to connect Solflare in solanaUtils.js:", e);
        throw new Error(`Solflare connection failed: ${e.message}`);
      }
    }
    
    // If Solflare not available, try Phantom
    if (typeof window !== 'undefined' && window.solana) {
      console.log("Phantom detected in solanaUtils.js");
      try {
        // Check if already connected
        if (window.solana.isConnected) {
          console.log("Phantom is already connected");
        } else {
          console.log("Requesting Phantom connection...");
          await window.solana.connect();
          console.log("Phantom connect completed");
        }
        
        const publicKey = window.solana.publicKey;
        console.log("Got Phantom public key:", publicKey?.toString());
        
        if (!publicKey) {
          throw new Error("Failed to get public key from Phantom");
        }
        
        // Create a proxy wallet object that wraps around browser wallet
        currentWallet = {
          publicKey,
          signTransaction: async (tx) => {
            console.log("Requesting Phantom to sign transaction");
            return await window.solana.signTransaction(tx);
          },
          signAllTransactions: async (txs) => {
            console.log("Requesting Phantom to sign multiple transactions");
            return await window.solana.signAllTransactions(txs);
          },
          walletType: 'Phantom'
        };
        
        // Save wallet information
        localStorage.setItem('walletPublicKey', publicKey.toString());
        localStorage.setItem('walletType', 'Phantom');
        
        return currentWallet;
      } catch (e) {
        console.error("Failed to connect Phantom in solanaUtils.js:", e);
        throw new Error(`Phantom connection failed: ${e.message}`);
      }
    }
    
    // If we reach here, no browser wallet was available or connection failed
    console.log("No browser wallet available, falling back to local keypair");
    
    // Fallback to local keypair-based wallet if browser wallet not available
    let keypair;
    
    if (seedPhrase) {
      // Convert seed phrase to bytes
      const seed = await bip39.mnemonicToSeed(seedPhrase);
      const seedBytes = seed.slice(0, 32);
      keypair = Keypair.fromSeed(seedBytes);
    } else {
      // Generate a new wallet
      keypair = Keypair.generate();
      
      // Generate a seed phrase for the new wallet (would store securely)
      // This is just for demo - in a real app you'd use proper HD wallet derivation
      const seedBytes = keypair.secretKey.slice(0, 32);
      const mnemonic = bip39.entropyToMnemonic(Buffer.from(seedBytes));
      console.log("Seed phrase (for demo only):", mnemonic);
    }
    
    // Store the wallet for future use
    currentWallet = keypair;
    
    // In a real app, store public key and keypair data in localStorage
    localStorage.setItem('walletPublicKey', keypair.publicKey.toString());
    localStorage.setItem('walletType', 'local');
    localStorage.setItem('localKeypair', JSON.stringify(Array.from(keypair.secretKey)));
    
    return keypair;
  } catch (error) {
    console.error("Error connecting wallet in solanaUtils.js:", error);
    throw new Error(`Failed to connect wallet: ${error.message}`);
  }
}

/**
 * Disconnect the current wallet
 */
export function disconnectWallet() {
  try {
    // Clear wallet data
    currentWallet = null;
    localStorage.removeItem('walletPublicKey');
    localStorage.removeItem('walletType');
    localStorage.removeItem('localKeypair');
    console.log("Wallet disconnected");
    return true;
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
    return false;
  }
}

/**
 * Deploy a new token with specified configuration
 */
export async function deployToken(tokenConfig, tokenMetadata, network = 'devnet') {
  try {
    console.log("Deploying token with config:", tokenConfig);
    const wallet = getCurrentWallet();
    
    if (!wallet) {
      throw new Error("No wallet connected");
    }
    
    // Setup connection
    const connection = getConnection(network);
    
    console.log("Creating token with:", {
      connection,
      payer: wallet.publicKey.toString(),
      decimals: tokenConfig.decimals
    });

    let txid;
    let mintKeypair;
    const MAX_RETRIES = 3;
    
    // If using a browser wallet (like Phantom or Solflare)
    if (wallet.walletType) {
      // Implement retry logic for browser wallets
      let retryCount = 0;
      let lastError = null;
      
      while (retryCount < MAX_RETRIES) {
        try {
          // Generate a new mint keypair for each attempt
          mintKeypair = Keypair.generate();
          console.log(`Attempt ${retryCount + 1}: Generated mint keypair:`, mintKeypair.publicKey.toString());
          
          // Step 2: Create the token
          const tokenDecimals = parseInt(tokenConfig.decimals);
          const createMintAccountIx = SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: 82, // Minimum size for a mint account
            lamports: await connection.getMinimumBalanceForRentExemption(82),
            programId: TOKEN_PROGRAM_ID,
          });

          // Initialize the mint
          const initMintIx = createInitializeMintInstruction(
            mintKeypair.publicKey, 
            tokenDecimals, 
            wallet.publicKey, // Mint authority
            wallet.publicKey, // Freeze authority
            TOKEN_PROGRAM_ID
          );
          
          // Get a fresh blockhash for each attempt
          const blockHashInfo = await connection.getLatestBlockhash("finalized");
          
          // Create transaction with fresh blockhash
          const transaction = new Transaction().add(
            createMintAccountIx,
            initMintIx
          );
          transaction.feePayer = wallet.publicKey;
          transaction.recentBlockhash = blockHashInfo.blockhash;
          transaction.lastValidBlockHeight = blockHashInfo.lastValidBlockHeight;
          
          // Sign with the mint keypair first
          transaction.partialSign(mintKeypair);
          
          // Now send to wallet for signing
          const signedTransaction = await wallet.signTransaction(transaction);
          if (!signedTransaction) {
            throw new Error("Transaction was not signed properly by the wallet");
          }
          
          // Send the transaction
          txid = await connection.sendRawTransaction(signedTransaction.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'finalized'
          });
          console.log(`Attempt ${retryCount + 1}: Transaction sent, awaiting confirmation:`, txid);
          
          // Wait for confirmation with timeout
          const confirmation = await Promise.race([
            connection.confirmTransaction({
              signature: txid,
              blockhash: blockHashInfo.blockhash,
              lastValidBlockHeight: blockHashInfo.lastValidBlockHeight
            }, 'finalized'),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Transaction confirmation timeout')), 45000)
            )
          ]);
          
          if (confirmation.value?.err) {
            throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
          }
          
          console.log(`Attempt ${retryCount + 1}: Transaction confirmed:`, txid);
          break; // Success, exit the retry loop
        } catch (error) {
          lastError = error;
          console.error(`Attempt ${retryCount + 1} failed:`, error.message);
          retryCount++;
          
          if (retryCount < MAX_RETRIES) {
            console.log(`Retrying in 3 seconds... (${retryCount}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait before retrying
          }
        }
      }
      
      // If we exhausted all retries, throw the last error
      if (retryCount === MAX_RETRIES) {
        throw new Error(`Failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
      }
    } else {
      // For local keypair, implement retry logic
      let retryCount = 0;
      let lastError = null;
      
      while (retryCount < MAX_RETRIES) {
        try {
          // Generate a new mint keypair for each attempt
          mintKeypair = Keypair.generate();
          console.log(`Attempt ${retryCount + 1}: Generated mint keypair:`, mintKeypair.publicKey.toString());
          
          // Step 2: Create the token
          const tokenDecimals = parseInt(tokenConfig.decimals);
          const createMintAccountIx = SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: 82, // Minimum size for a mint account
            lamports: await connection.getMinimumBalanceForRentExemption(82),
            programId: TOKEN_PROGRAM_ID,
          });

          // Initialize the mint
          const initMintIx = createInitializeMintInstruction(
            mintKeypair.publicKey, 
            tokenDecimals, 
            wallet.publicKey, // Mint authority
            wallet.publicKey, // Freeze authority
            TOKEN_PROGRAM_ID
          );
          
          // Get a fresh blockhash for each attempt
          const blockHashInfo = await connection.getLatestBlockhash("finalized");
          
          // Create transaction with fresh blockhash
          const transaction = new Transaction().add(
            createMintAccountIx,
            initMintIx
          );
          transaction.feePayer = wallet.publicKey;
          transaction.recentBlockhash = blockHashInfo.blockhash;
          
          // Sign and send the transaction
          txid = await sendAndConfirmTransaction(
            connection,
            transaction,
            [wallet, mintKeypair],
            { 
              commitment: 'finalized',
              skipPreflight: false
            }
          );
          console.log(`Attempt ${retryCount + 1}: Transaction confirmed:`, txid);
          break; // Success, exit the retry loop
        } catch (error) {
          lastError = error;
          console.error(`Attempt ${retryCount + 1} failed:`, error.message);
          retryCount++;
          
          if (retryCount < MAX_RETRIES) {
            console.log(`Retrying in 3 seconds... (${retryCount}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait before retrying
          }
        }
      }
      
      // If we exhausted all retries, throw the last error
      if (retryCount === MAX_RETRIES) {
        throw new Error(`Failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
      }
    }

    // Step 3: Create an associated token account for the wallet and mint initial tokens
    console.log("Creating associated token account...");
    const initialSupply = parseInt(tokenConfig.initialSupply);
    const tokenDecimals = parseInt(tokenConfig.decimals);
    const mintAmount = BigInt(initialSupply * Math.pow(10, tokenDecimals));

    // Create the associated token account for the wallet
    let associatedTokenAccount;
    try {
      associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet, // payer
        mintKeypair.publicKey,
        wallet.publicKey
      );
      console.log("Created associated token account:", associatedTokenAccount.address.toString());
    } catch (ataError) {
      console.error("Error creating associated token account:", ataError);
      // Continue with deployment even if token account creation fails
      // The mint was still successful
    }

    let mintTxid = "unknown";
    
    // Only attempt to mint if we successfully created an associated token account
    if (associatedTokenAccount) {
      // Mint the initial supply with retry logic
      if (wallet.walletType) {
        // For browser wallet with retry logic
        let retryCount = 0;
        
        while (retryCount < MAX_RETRIES) {
          try {
            console.log(`Attempt ${retryCount + 1}: Minting initial supply...`);
            // Get fresh blockhash for mint transaction
            const mintBlockhash = await connection.getLatestBlockhash("confirmed");
            
            const mintTransaction = new Transaction();
            mintTransaction.add(
              mintTo(
                mintKeypair.publicKey, // mint
                associatedTokenAccount.address, // destination
                wallet.publicKey, // authority
                mintAmount // amount
              )
            );
            
            mintTransaction.feePayer = wallet.publicKey;
            mintTransaction.recentBlockhash = mintBlockhash.blockhash;
            
            const signedMintTx = await wallet.signTransaction(mintTransaction);
            mintTxid = await connection.sendRawTransaction(signedMintTx.serialize(), {
              skipPreflight: false
            });
            
            await connection.confirmTransaction(mintTxid);
            
            console.log(`Attempt ${retryCount + 1}: Minted initial supply, transaction:`, mintTxid);
            break; // Success, exit the retry loop
          } catch (error) {
            console.error(`Mint attempt ${retryCount + 1} failed:`, error.message);
            retryCount++;
            
            if (retryCount < MAX_RETRIES) {
              console.log(`Retrying mint in 2 seconds... (${retryCount}/${MAX_RETRIES})`);
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait before retrying
            }
          }
        }
      } else {
        // For local keypair with retry logic
        let retryCount = 0;
        
        while (retryCount < MAX_RETRIES) {
          try {
            console.log(`Attempt ${retryCount + 1}: Minting initial supply...`);
            mintTxid = await mintTo(
              connection,
              wallet, // payer
              mintKeypair.publicKey, // mint
              associatedTokenAccount.address, // destination
              wallet, // authority
              mintAmount, // amount
              [], // no multisig
              { commitment: 'confirmed' }
            );
            
            console.log(`Attempt ${retryCount + 1}: Minted initial supply, transaction:`, mintTxid);
            break; // Success, exit the retry loop
          } catch (error) {
            console.error(`Mint attempt ${retryCount + 1} failed:`, error.message);
            retryCount++;
            
            if (retryCount < MAX_RETRIES) {
              console.log(`Retrying mint in 2 seconds... (${retryCount}/${MAX_RETRIES})`);
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait before retrying
            }
          }
        }
      }
    }

    // Return token deployment result even if minting fails
    const deploymentResult = {
      tokenName: tokenConfig.name,
      tokenSymbol: tokenConfig.symbol,
      tokenMintAddress: mintKeypair.publicKey.toString(),
      initialSupply: tokenConfig.initialSupply,
      decimals: tokenConfig.decimals,
      owner: wallet.publicKey.toString(),
      network,
      deployTime: new Date().toISOString(),
      transactionId: txid || "unknown",
      mintTransactionId: mintTxid || "unknown"
    };
    
    console.log("Token deployed:", deploymentResult);
    return deploymentResult;
  } catch (error) {
    console.error("Error deploying token:", error);
    
    // Provide more helpful error messages for common issues
    if (error.message.includes("insufficient funds") || error.message.includes("0x1")) {
      throw new Error(`Token deployment failed: Insufficient SOL balance. Please add more SOL to your wallet.`);
    } else if (error.message.includes("blockhash") || error.message.includes("block height exceeded")) {
      throw new Error(`Token deployment failed: Transaction could not be processed by the network. Please try again.`);
    } else if (error.message.includes("User rejected")) {
      throw new Error(`Token deployment failed: Transaction was rejected in your wallet.`);
    } else {
      throw new Error(`Token deployment failed: ${error.message}`);
    }
  }
}

/**
 * Get token balance for the current wallet
 */
export async function getTokenBalance(tokenMintAddress) {
  try {
    const wallet = getCurrentWallet();
    if (!wallet) {
      throw new Error("No wallet connected");
    }
    
    const connection = getConnection();
    const tokenAccounts = await connection.getTokenAccountsByOwner(
      wallet.publicKey,
      { mint: new PublicKey(tokenMintAddress) }
    );
    
    if (tokenAccounts.value.length === 0) {
      return 0;
    }
    
    const accountInfo = await getAccount(
      connection, 
      tokenAccounts.value[0].pubkey
    );
    
    return Number(accountInfo.amount) / Math.pow(10, accountInfo.mint.decimals);
  } catch (error) {
    console.error("Error getting token balance:", error);
    return 0;
  }
}

/**
 * Transfer tokens to another wallet
 */
export async function transferTokens(recipientAddress, amount, tokenMintAddress) {
  try {
    const wallet = getCurrentWallet();
    if (!wallet) {
      throw new Error("No wallet connected");
    }
    
    const connection = getConnection();
    
    // Get or create associated token accounts
    const sourceAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      new PublicKey(tokenMintAddress),
      wallet.publicKey
    );
    
    const recipientAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      new PublicKey(tokenMintAddress),
      new PublicKey(recipientAddress)
    );
    
    // Get token decimals
    const tokenInfo = await getMint(connection, new PublicKey(tokenMintAddress));
    const adjustedAmount = amount * Math.pow(10, tokenInfo.decimals);
    
    // Execute transfer
    const signature = await transfer(
      connection,
      wallet,
      sourceAccount.address,
      recipientAccount.address,
      wallet.publicKey,
      BigInt(adjustedAmount)
    );
    
    await connection.confirmTransaction(signature, 'confirmed');
    
    return {
      success: true,
      amount: amount,
      recipient: recipientAddress,
      transactionId: signature,
    };
  } catch (error) {
    console.error("Error transferring tokens:", error);
    throw new Error(`Token transfer failed: ${error.message}`);
  }
}