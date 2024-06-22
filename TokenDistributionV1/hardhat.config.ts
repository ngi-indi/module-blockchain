import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import hre from "hardhat";  // hre = Hardhat Runtime Environment
import {ethers} from "hardhat"; 

import {bscscanApiKey} from './secrets.json';

const config: HardhatUserConfig  = {
	solidity: "0.8.25",
  	networks: {
		bnbTestnet: {
			url: "https://bsc-testnet-dataseed.bnbchain.org",
			chainId: 97,
			gasPrice: 20000000000,
			accounts: {mnemonic: process.env.PRIVATE_KEY},
		},
	},
	etherscan: {
		apiKey: bscscanApiKey
	}
};

export default config;