import { ethers } from "hardhat";
import fs from 'fs'; // filesystem (for JSON files)

const DEPLOYMENT_FILE_PATH = __dirname + "/../deployment.json";

async function main() {
    const [owner, recipient, val_0, val_1, val_2, val_3] = await ethers.getSigners();
    
    const data = fs.readFileSync(DEPLOYMENT_FILE_PATH, 'utf-8');

    let deploymentJSON = JSON.parse(data);

    const validatorsThreshold = deploymentJSON['validatorsThreshold'];
    const timeout = deploymentJSON['timeout']; // blocks

    // Deploy the OntologyToken contract
    const ontologyTokenFactory = await ethers.getContractFactory("OntologyToken");
    const ontologyToken = await ontologyTokenFactory.deploy(); 
    
    // Deploy the TokenDistribution contract
    const ontologyTokenAddress = ontologyToken.target;
    const recipientAddress = recipient.address;
    
    const tokenDistributionFactory = await ethers.getContractFactory("TokenDistribution");
    const tokenDistribution = await tokenDistributionFactory.deploy(
        ontologyTokenAddress, 
        recipientAddress, 
        validatorsThreshold, 
        timeout
    );

    // Add the network name property associated to the contracts addresses
    deploymentJSON['networkName'] = (await ethers.provider.getNetwork()).name;

    // Add the properties for the two contract addresses
    deploymentJSON['ontologyTokenAddress'] = ontologyTokenAddress;
    deploymentJSON['tokenDistributionAddress'] = tokenDistribution.target;

    // Overwrite the JSON file
    fs.writeFileSync(DEPLOYMENT_FILE_PATH, JSON.stringify(deploymentJSON, null, '\t'));

    console.log(`Ontology token contract address: ${ontologyTokenAddress}`);
    console.log(`Token distribution contract address: ${tokenDistribution.target}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});