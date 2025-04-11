# SolanaTokenCreator

A user-friendly web application for creating and managing Solana SPL tokens. This project makes it easy to deploy your own token on Solana without requiring advanced technical knowledge.

## Overview

This project provides a modern web application for creating standard Solana SPL tokens. The web app simplifies the token creation process through an intuitive interface that handles all the technical aspects of token deployment.

### Features
- Create standard SPL tokens with custom parameters
- Configure token supply, decimals, and symbol
- Add custom metadata and token images
- Deploy to Solana devnet or mainnet
- Transfer tokens between wallets
- Track token balances and transactions

## Web Application

The project includes a modern React-based web application that makes it easy to create, configure, and deploy your Solana token directly from your browser.

### Web App Features

- **Modern React Interface**: Built with React, React Router, and Vite for a fast, responsive experience
- **Solana Wallet Integration**: Seamlessly connect with Phantom, Solflare, or other Solana wallets
- **Multiple Network Support**: Switch between devnet and mainnet
- **Token Configuration**: Customize token parameters through an intuitive UI
- **Token Description**: Store token descriptions and attributes locally for reference
- **Metadata Guide**: Clear instructions for adding on-chain metadata after deployment
- **One-click Deployment**: Deploy your token to Solana with a single click
- **Transfer Management**: Send tokens to other wallets with a user-friendly interface
- **Mobile-Responsive Design**: Use on desktop or mobile devices with equal ease

### Using the Web App

1. **Access the App**: Open the web application in your browser
2. **Connect Wallet**: Click the "Connect Wallet" button to connect your Solana wallet
3. **Configure Token**: Navigate to the Token Configuration page to set up your token parameters
4. **Add Description**: Use the Token Description page to add information about your token for reference
5. **Deploy**: Deploy your token to your chosen network (devnet recommended for testing)
6. **Configure Metadata**: Follow the Metadata Guide to add on-chain metadata to your token after deployment
7. **Manage**: Use the Dashboard and Transfer pages to manage your token after deployment

### Installing and Running the Web App

#### Prerequisites
- Linux operating system (currently, the application is only tested and supported on Linux)
- Node.js 16 or later
- NPM 7 or later
- A modern web browser
- A Solana wallet browser extension (Phantom, Solflare, etc.)

#### Installation and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/CustomSolanaToken2025.git
cd CustomSolanaToken2025

# Install dependencies for the web app
cd web-app
npm install

# Start the development server
npm run dev
```

Once started, the web application will be available at http://localhost:3000/

### Installing from Release Build

If you prefer not to build the application yourself, you can download the pre-built version:

#### Download and Installation Steps

1. **Download the Build**:
   - Go to the [GitHub Releases page](https://github.com/datalore92/SolanaTokenCreator/releases)
   - Find the latest release and download `web-app-build.zip` from the Assets section

2. **Extract the Files** (Linux):
   ```bash
   # Create a directory where you want to install the application
   mkdir -p ~/solana-token-creator
   
   # Move to that directory
   cd ~/solana-token-creator
   
   # Extract the zip file (replace the path with your download location)
   unzip ~/Downloads/web-app-build.zip
   ```

3. **Serve the Application**:
   The extracted files are static assets that need to be served by a web server. You can use:
   
   - Python's built-in HTTP server:
     ```bash
     cd ~/solana-token-creator
     python3 -m http.server 8080
     ```
     Then open your browser to `http://localhost:8080`
   
   - Node.js http-server (install with `npm install -g http-server` first):
     ```bash
     cd ~/solana-token-creator
     http-server -p 8080
     ```
     Then open your browser to `http://localhost:8080`

4. **Connect Your Wallet**:
   Once the application is running in your browser, connect your Solana wallet to begin creating your token.

#### System Requirements
- Linux operating system
- Modern web browser (Chrome, Firefox, Brave, etc.)
- Solana wallet extension (Phantom, Solflare, etc.)

## Benefits of Using the Web Application

The web application provides several advantages over manual CLI deployment:

### Simplified Token Creation
- **No Command Line Knowledge Required**: Create tokens without knowing Solana CLI commands
- **Visual Parameter Configuration**: Adjust token parameters with input fields
- **Real-time Validation**: Immediate feedback on parameter validity and constraints

### Enhanced Metadata Management
- **Visual Logo Editor**: Upload and preview token logos right in the app
- **Streamlined Metadata Creation**: Fill out structured forms instead of creating JSON files manually

### Deployment Confidence
- **Network Safety**: Clear distinction between devnet and mainnet environments
- **Cost Transparency**: Upfront cost estimates before deployment (~0.01 SOL on devnet, ~0.05 SOL on mainnet)
- **Deployment Progress**: Visual progress indicators during token creation
- **Verification**: Automatic verification of successful deployments with transaction links

### Post-Deployment Features
- **Token Dashboard**: Monitor token information and balances
- **Transfer Interface**: Send tokens to other wallets with a user-friendly interface

## Project Structure

The project follows a simple architecture:

```
web-app/                # Web application
  ├── src/
  │   ├── components/   # UI components
  │   ├── pages/        # Application pages
  │   ├── styles/       # CSS styles
  │   └── utils/        # Utility functions for Solana integration
  └── public/           # Public assets
```

## Customizable Token Parameters

When creating your token, you can customize these parameters:

### 🔢 Supply & Issuance
- Initial supply: Set your desired total token supply
- Decimals: Configure decimal places for your token (0-9)
- Token symbol: Your token's ticker symbol
- Token name: Full name for your token

### 📋 Metadata
- Description: Information about your token's purpose (stored locally for reference)
- Metadata Guide: Instructions for adding on-chain metadata to your token after deployment
- Additional attributes: Custom attributes can be added for reference

## Using Standard SPL Tokens

This project creates standard SPL tokens compatible with all Solana wallets and exchanges. Here are some tips for using your token:

### Adding to Wallets

Most Solana wallets will automatically detect your token if you've sent some to that wallet address. If not, you can manually add the token using its mint address.

### Creating Liquidity

To make your token tradable, you can create a liquidity pool on a Solana DEX like:
- Raydium
- Orca
- Jupiter

### Token Explorer

After deployment, you can view your token on Solana Explorers:
```
https://explorer.solana.com/address/<TOKEN_MINT_ADDRESS>?cluster=devnet
```

Replace `<TOKEN_MINT_ADDRESS>` with your token's mint address and change `devnet` to `mainnet` if deployed to mainnet.

## Estimated Costs

Creating a standard SPL token requires a small amount of SOL to cover the blockchain storage and transaction fees:

- **Devnet**: ~0.01 SOL (free test SOL available from faucets)
- **Mainnet**: ~0.05 SOL (using real SOL)

## Future Development

Our roadmap for future development includes:

### Future Updates
- **Enhanced Analytics**: Token holder statistics and transaction metrics
- **Liquidity Pool Setup**: Guided wizards for creating liquidity on DEXes
- **Token Website Generator**: Create a landing page for your token
- **Mobile Companion App**: Manage your token on the go

## Contributing

We welcome contributions to the web application! Please feel free to open issues or submit pull requests on GitHub.

## License

[MIT License](LICENSE)