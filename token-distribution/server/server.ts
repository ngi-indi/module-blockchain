import { ITokenDistribution, IIndiToken } from "./scripts/interface.ts";
import { ethers } from "hardhat";

const DEPLOYMENT_FILE_PATH = "/.deployment.json";

import express from 'express';

const app = express();
const port = 5000;

// parse JSON
app.use(express.json());

// Check my status
app.get('/check-server', (req, res) => {
    res.json({ status: 'Server is up and running' });
});

// Check the contract
app.get('/check-contract', async (req, res) => {
    const [myAddress] = await ethers.getSigners();
    
    // TODO: read these once (global/static values)
    const tokenDistribution = new ITokenDistribution(DEPLOYMENT_FILE_PATH); 
    await tokenDistribution.setup(myAddress);

    const indiToken = new IIndiToken(await tokenDistribution.getManagedTokenAddress());
    await indiToken.setup();
    
    try {
        const owner = await tokenDistribution.getOwner();
        const recipient = await tokenDistribution.getRecipient();
        const timeout = await tokenDistribution.getTimeout();
        const validatorsThreshold = await tokenDistribution.getValidatorsThreshold();
        const tokenAddress = await tokenDistribution.getManagedTokenAddress();
        const currentRequestValidators = await tokenDistribution.getNumberOfValidatorsInCurrentRequest();
        const currentRequestBlock = await tokenDistribution.getBlockNumberInCurrentRequest();

        res.json({
          owener: owner,
          recipient: recipient,
          timeout: timeout,
          validators_threshold: validatorsThreshold,
          token_address: tokenAddress,
          current_request_validators: currentRequestValidators,
          current_request_block: currentRequestBlock,
        });
      } catch (error) {
        console.error("Error fetching token info:", error);
        res.status(500).json({ error: 'Failed to fetch token information' });
      }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
