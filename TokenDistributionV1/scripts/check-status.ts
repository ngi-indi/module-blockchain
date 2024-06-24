import { ITokenDistribution, IOntologyToken } from "./interface.ts";
import { ethers } from "hardhat";

const DEPLOYMENT_FILE_PATH = __dirname + "/../deployment.json";

async function main() {
    const [myAddress] = await ethers.getSigners();
    
    // -------------------------------------------------------------------
    // Contracts
    // -------------------------------------------------------------------

    const tokenDistribution = new ITokenDistribution(DEPLOYMENT_FILE_PATH); 
    await tokenDistribution.setup(myAddress);

    const ontologyToken = new IOntologyToken(await tokenDistribution.getManagedTokenAddress());
    await ontologyToken.setup();

    // -------------------------------------------------------------------


    // -------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------
    
    // Getters
    console.log(`Owner: ${await tokenDistribution.getOwner()}`);
    console.log(`Recipient: ${await tokenDistribution.getRecipient()}`);
    console.log(`Timeout: ${await tokenDistribution.getTimeout()}`);
    console.log(`Validators threshold: ${await tokenDistribution.getValidatorsThreshold()}`);
    console.log(`Token address: ${await tokenDistribution.getManagedTokenAddress()}`);
    console.log(`Validators in current request: ${await tokenDistribution.getNumberOfValidatorsInCurrentRequest()}`);
    console.log(`Block number in current request: ${await tokenDistribution.getBlockNumberInCurrentRequest()}`);
    
    // -------------------------------------------------------------------

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})