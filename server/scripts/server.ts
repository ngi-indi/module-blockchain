import { ITokenDistribution, IIndiToken } from "./interface.ts";
import { ethers } from "hardhat";

import * as path from 'path';
import express from 'express';
import fs from 'fs'; // filesystem (for JSON files)

const DEPLOYMENT_FILE_PATH = path.resolve(__dirname, '../deployment.json');

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
	const [myAddress] = await ethers.getSigners(); // TODO: manage this (.env file and Docker)

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

		console.log()
		res.json({
			owner: owner,
			recipient: recipient,
			timeout: timeout.toString(),
			validators_threshold: validatorsThreshold.toString(),
			token_address: tokenAddress,
			current_request_validators: currentRequestValidators.toString(),
			current_request_block: currentRequestBlock.toString(),
		});
	} catch (error) {
		console.error("Error fetching token info:", error);
		res.status(500).json({ error: 'Failed to fetch token information' });
	}
});

// Deploy the contract
app.get('/deploy', async (req, res) => {
	try {
		const [owner] = await ethers.getSigners(); // TODO: the server itself? - Manage the other private keys differently and leave this one (aka the first one ethers sees) for the server

		const data = fs.readFileSync(DEPLOYMENT_FILE_PATH, 'utf-8');
		let deploymentJSON = JSON.parse(data);

		// TODO: validate user input
		const params = req.query;
		const validatorsThreshold = params.validatorsThreshold;
		const timeout = params.timeout; // blocks
		const recipientAddress = params.recipientAddress;

		// Deploy the IndiToken contract // TODO: [!!!] this one should be deployed only once and not everytime with the TokenDistribution contract together...
		const indiTokenFactory = await ethers.getContractFactory("IndiToken");
		const indiToken = await indiTokenFactory.deploy();

		// Deploy the TokenDistribution contract
		const indiTokenAddress = indiToken.target;

		const tokenDistributionFactory = await ethers.getContractFactory("TokenDistribution");
		const tokenDistribution = await tokenDistributionFactory.deploy(
			indiTokenAddress,
			recipientAddress,
			validatorsThreshold,
			timeout
		);

		// Add the network name property associated to the contract address
		deploymentJSON['networkName'] = (await ethers.provider.getNetwork()).name;

		// Add the property for the TokenDistribution contract address
		deploymentJSON['contractAddress'] = tokenDistribution.target;

		// Update the old properties with the params oness
		deploymentJSON['validatorsThreshold'] = validatorsThreshold.toString();
		deploymentJSON['timeout'] = timeout.toString();
		deploymentJSON['recipientAddress'] = recipientAddress.toString();

		// Overwrite the JSON file
		fs.writeFileSync(DEPLOYMENT_FILE_PATH, JSON.stringify(deploymentJSON, null, '\t'));

		console.log(`Indi token contract address: ${indiTokenAddress}`);
		console.log(`Token distribution contract address: ${tokenDistribution.target}`);

		res.json({ 
			status: 'Success',
			message: 'Contract sucessfully deployed on the network.',
			contractAddress: tokenDistribution.target
		});		
	} catch (error) {
		console.error("Error deploying the contract:", error);
		res.status(500).json({ error: 'Failed to deploy the contract' });
	}
});

// Start the server
app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
