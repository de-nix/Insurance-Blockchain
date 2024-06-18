# InsuranceChain

## Overview

InsuranceChain is a decentralized application (dApp) designed to streamline and enhance the insurance claims process using blockchain technology and smart contracts. This application leverages the Ethereum blockchain to provide a transparent, efficient, and secure platform for both insurers and insured parties.

## Features

- **Smart Contracts**: Automate insurance policy management, claims submission, and processing.
- **Real-Time Updates**: Track the status of insurance claims in real-time.
- **User-Friendly Interface**: Intuitive design for easy navigation and interaction.
- **Personalized Policies**: Customizable insurance policies based on individual risk profiles.
- **Decentralized and Transparent**: Ensures data integrity and trust among all parties involved.

## Architecture

InsuranceChain consists of three main components:

1. **Smart Contract**: Written in Solidity, deployed on the Ethereum Sepolia testnet. It handles the core business logic, including policy registration, management, and claims processing.
2. **Backend Service**: Developed using Node.js, it manages user registrations and logins, storing user information such as wallet addresses, usernames, and roles.
3. **Frontend Client**: Built with React, it allows users to interact with the smart contract through the MetaMask browser extension.

## Installation

### Prerequisites

- Node.js
- MetaMask Extension
- Sepolia Testnet Ethereum Coins

### Steps

1. **Clone the Repository**:
   git clone https://github.com/yourusername/InsuranceChain.git
   cd InsuranceChain
2. **Install Dependencies**:
   npm install
3. **Deploy Smart Contract**: Use Hardhat to compile and deploy the smart contract to the Sepolia testnet.
  npx hardhat compile
  npx hardhat run scripts/deploy.js --network sepolia
4. **Start Backend Server**:
  node backend/server.js
5. **Start Frontend Application**:
   npm start
## Usage

### MetaMask Setup

1. Install the MetaMask browser extension from [MetaMask](https://metamask.io/).
2. Connect MetaMask to the Sepolia testnet and obtain Sepolia Ethereum from a faucet.

### User Roles

- **Insurer**: Can create insurance policies, assess risks, and manage claims.
- **Insured**: Can accept or deny policy requests, pay premiums, and file claims.

### Interactions

#### Create Policy (Insurer)

- Provide policy name, description, insured party, risk assessment, duration, and premium frequency.
- Deploy the policy to the blockchain.

#### Accept/Deny Policy (Insured)

- Review policy details and accept or deny the policy request.
- Make the initial premium payment upon acceptance.

#### File Claim (Insured)

- Submit a claim with a description and requested amount.
- Track the claim status in real-time.

#### Process Claim (Insurer)

- Review submitted claims and either accept or deny them.
- Approved claims trigger a transfer of the claim amount from the insurer to the insured.

## Development

### Smart Contract

- Written in Solidity, the smart contract enforces rules and automates processes through 'require' statements to ensure compliance.

### Backend

- Handles user authentication and stores user information securely.

### Frontend

- Utilizes React and ethers.js to interact with the Ethereum blockchain.
- MetaMask integration for secure transactions.

## Contributing

- Fork the repository.
- Create a new branch (`git checkout -b feature-branch`).
- Commit your changes (`git commit -am 'Add new feature'`).
- Push to the branch (`git push origin feature-branch`).
- Create a new Pull Request.
