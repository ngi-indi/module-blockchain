import { ITokenDistribution } from "./interface.ts";
import { ethers } from "hardhat";

const DEPLOYMENT_FILE_PATH = __dirname + "/../deployment.json";

async function main() {
    const [validator] = await ethers.getSigners();
    
    // -------------------------------------------------------------------
    // Contracts
    // -------------------------------------------------------------------

    const tokenDistribution = new ITokenDistribution(DEPLOYMENT_FILE_PATH); 
    await tokenDistribution.setup(validator);

    // -------------------------------------------------------------------


    // -------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------

    // Approve
    let approve_tx = await tokenDistribution.approve();
    console.log(`Validator ${validator.address}, approve tx hash: ${approve_tx}`);
    
    // -------------------------------------------------------------------

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})