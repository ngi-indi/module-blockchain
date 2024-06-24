import { ethers } from "hardhat";
import fs from 'fs'; // filesystem (for JSON files)

const DEPLOYMENT_FILE_PATH = __dirname + "/../deployment.json";

async function main() {
    const [owner] = await ethers.getSigners();
    
    const data = fs.readFileSync(DEPLOYMENT_FILE_PATH, 'utf-8');

    let deploymentJSON = JSON.parse(data);

    const validatorsThreshold = deploymentJSON['validatorsThreshold'];
    const timeout = deploymentJSON['timeout']; // blocks
    const recipientAddress = deploymentJSON['recipientAddress'];

    // Deploy the OntologyToken contract
    const ontologyTokenFactory = await ethers.getContractFactory("OntologyToken");
    const ontologyToken = await ontologyTokenFactory.deploy(); 
    
    // Deploy the TokenDistribution contract
    const ontologyTokenAddress = ontologyToken.target;
    
    const tokenDistributionFactory = await ethers.getContractFactory("TokenDistribution");
    const tokenDistribution = await tokenDistributionFactory.deploy(
        ontologyTokenAddress, 
        recipientAddress, 
        validatorsThreshold, 
        timeout
    );

    // Add the network name property associated to the contract address
    deploymentJSON['networkName'] = (await ethers.provider.getNetwork()).name;

    // Add the property for the TokenDistribution contract address
    deploymentJSON['contractAddress'] = tokenDistribution.target;

    // Overwrite the JSON file
    fs.writeFileSync(DEPLOYMENT_FILE_PATH, JSON.stringify(deploymentJSON, null, '\t'));

    console.log(`Ontology token contract address: ${ontologyTokenAddress}`);
    console.log(`Token distribution contract address: ${tokenDistribution.target}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});