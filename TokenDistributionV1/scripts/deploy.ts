import { ethers } from "hardhat";

const validatorsThreshold = 3;
const timeout = 200; // blocks

async function main() {
    const [owner, recipient, val_0, val_1, val_2, val_3] = await ethers.getSigners();
    
    const ontologyTokenFactory = await ethers.getContractFactory("OntologyToken");
    const ontologyToken = await ontologyTokenFactory.deploy(); 
    
    const ontologyTokenAddress = ontologyToken.target;
    const recipientAddress = recipient.address;

    // Deploy the TokenDistribution contract
    const tokenDistributionFactory = await ethers.getContractFactory("TokenDistribution");
    const tokenDistribution = await tokenDistributionFactory.deploy(ontologyTokenAddress, recipientAddress, validatorsThreshold, timeout);

    console.log(`Ontology token contract address: ${ontologyTokenAddress}`);
    console.log(`Token distribution contract address: ${tokenDistribution.target}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});