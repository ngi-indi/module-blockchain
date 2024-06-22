import { config, ethers } from "hardhat";

console.log(config.networks.bnbTestnet.accounts.mnemonic);

// Call this script inside a docker instance with: npx hardhat run --network bnbTestnet scripts/test-docker-env.ts