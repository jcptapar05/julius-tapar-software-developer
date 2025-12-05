# julius-tapar-software-developer
SIMPLE Minting App

Requirements
Node V20^

# Installation
# Frontend
cd frontend
npm install
add .env file
add NEXT_PUBLIC_ETHERSCAN_API_KEY= (get it from https://etherscan.io/)
add NEXT_PUBLIC_CONTRACT_ADDRESS= (get it from deployment)
npm run dev or npm run build && npm run start

# Backend
cd backend
npm install
node index.js

# Sample Hardhat Project (v2)
add .env file

GOERLI_RPC_URL=https://goerli.infura.io/v3/api_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/api_key
PRIVATE_KEY=
ETHERSCAN_API_KEY=

npx hardhat node
npx hardhat run scripts/deploy.js --network localhost or sepolia