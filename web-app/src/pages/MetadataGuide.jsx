import React from 'react';
import { Link } from 'react-router-dom';

function MetadataGuide() {
  return (
    <div className="metadata-guide-container">
      <h2>Assigning Metadata to Your Solana Token</h2>
      <p>
        The current version of our token creator creates standard SPL tokens but doesn't automatically
        attach metadata using the Metaplex Token Metadata program. Here's how to add metadata to make
        your token appear with its logo and description in wallets and explorers.
      </p>

      <div className="guide-section">
        <h3>Why Token Metadata Matters</h3>
        <p>
          Metadata helps your token stand out with:
        </p>
        <ul>
          <li>Logo/image displayed in wallets and explorers</li>
          <li>Description explaining your token's purpose</li>
          <li>External links to your project website</li>
          <li>Additional attributes and properties</li>
        </ul>
      </div>

      <div className="guide-section">
        <h3>Metaplex Token Metadata Standard</h3>
        <p>
          Solana uses the Metaplex Token Metadata program to associate additional data with SPL tokens.
          This is what allows tokens and NFTs to display images and other information in wallets.
        </p>
      </div>

      <div className="guide-section">
        <h3>Option 1: Using the Metaplex CLI (For Developers)</h3>
        <div className="guide-step">
          <h4>Step 1: Install Metaplex CLI</h4>
          <div className="code-block">
            <pre><code>npm install -g @metaplex-foundation/mpl-token-metadata</code></pre>
          </div>
        </div>
        
        <div className="guide-step">
          <h4>Step 2: Prepare Your Metadata JSON</h4>
          <p>Create a metadata.json file with your token information:</p>
          <div className="code-block">
            <pre>{`{
  "name": "Your Token Name",
  "symbol": "TOKEN",
  "description": "Description of your token",
  "image": "https://your-image-url.com/image.png",
  "external_url": "https://your-project-website.com"
}`}</pre>
          </div>
        </div>
        
        <div className="guide-step">
          <h4>Step 3: Upload Your Image</h4>
          <p>
            Upload your token image to a permanent storage like Arweave or IPFS. 
            Services like <a href="https://nft.storage" target="_blank" rel="noopener noreferrer">NFT.Storage</a> 
            or <a href="https://www.pinata.cloud" target="_blank" rel="noopener noreferrer">Pinata</a> can help.
          </p>
        </div>
        
        <div className="guide-step">
          <h4>Step 4: Update Your Metadata JSON</h4>
          <p>Replace "https://your-image-url.com/image.png" with your permanent image URL.</p>
        </div>
        
        <div className="guide-step">
          <h4>Step 5: Upload Your Metadata JSON</h4>
          <p>Upload the metadata JSON file to a permanent storage and get its URL.</p>
        </div>
        
        <div className="guide-step">
          <h4>Step 6: Create Metadata for Your Token</h4>
          <p>Use the Metaplex CLI to create the metadata account:</p>
          <div className="code-block">
            <pre><code>metaplex token metadata create --token-address YOUR_TOKEN_ADDRESS --uri YOUR_METADATA_URI</code></pre>
          </div>
          <p>Replace YOUR_TOKEN_ADDRESS with your token's mint address and YOUR_METADATA_URI with the URL to your metadata JSON file.</p>
        </div>
      </div>

      <div className="guide-section">
        <h3>Option 2: Using Third-Party Tools</h3>
        <div className="guide-step">
          <h4>SPL Token Studio</h4>
          <p>
            <a href="https://www.spl-token-ui.com" target="_blank" rel="noopener noreferrer">SPL Token Studio</a> is a 
            web application that lets you add metadata to existing tokens with a simple interface.
          </p>
          <ol>
            <li>Visit the website and connect your wallet</li>
            <li>Enter your token mint address</li>
            <li>Upload your token image</li>
            <li>Add description and other metadata</li>
            <li>Submit to create the metadata account</li>
          </ol>
        </div>
      </div>

      <div className="guide-section">
        <h3>Option 3: Using Solana Developer Tools</h3>
        <p>For a more programmatic approach, you can use the Metaplex JavaScript SDK:</p>
        <div className="code-block">
          <pre>{`import { Metaplex } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("mainnet-beta"));
const metaplex = new Metaplex(connection);

async function createTokenMetadata(mintAddress, name, symbol, uri) {
  const mintPublicKey = new PublicKey(mintAddress);
  
  await metaplex
    .tokens()
    .createTokenMetadata({
      mint: mintPublicKey,
      name: name,
      symbol: symbol,
      uri: uri, // URI pointing to your metadata JSON
      sellerFeeBasisPoints: 0,
    })
    .run();
}

// Example usage:
createTokenMetadata(
  "YOUR_TOKEN_MINT_ADDRESS",
  "Your Token Name",
  "TOKEN",
  "https://your-metadata-uri.com/metadata.json"
);`}</pre>
        </div>
      </div>

      <div className="guide-note">
        <h3>Important Notes</h3>
        <ul>
          <li>You must be the token mint authority to add metadata</li>
          <li>Metadata is permanent once created, so verify all information</li>
          <li>All data and images should be stored on permanent storage</li>
          <li>The process requires a small amount of SOL to pay for the transaction</li>
        </ul>
      </div>

      <div className="guide-section">
        <h3>Future Updates</h3>
        <p>
          In future versions of our token creator app, we plan to fully automate the metadata creation process.
          Stay tuned for updates!
        </p>
      </div>

      <div className="guide-actions">
        <Link to="/deploy" className="primary-btn">Back to Deployment</Link>
        <a 
          href="https://docs.metaplex.com/programs/token-metadata/overview" 
          target="_blank" 
          rel="noopener noreferrer"
          className="secondary-btn"
        >
          Metaplex Documentation
        </a>
      </div>
    </div>
  );
}

export default MetadataGuide;