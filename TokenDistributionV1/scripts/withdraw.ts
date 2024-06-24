import { ITokenDistribution } from "./interface.ts";
import { ethers } from "hardhat";

const DEPLOYMENT_FILE_PATH = __dirname + "/../deployment.json";

async function main() {
    const [recipient] = await ethers.getSigners();
    
    // -------------------------------------------------------------------
    // Contracts
    // -------------------------------------------------------------------

    const tokenDistribution = new ITokenDistribution(DEPLOYMENT_FILE_PATH); 
    await tokenDistribution.setup(recipient);

    // -------------------------------------------------------------------


    // -------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------

    // Withdraw
    let withdraw_tx = await tokenDistribution.withdraw();
    console.log("Withdraw tx hash: ", withdraw_tx);
    
    // -------------------------------------------------------------------

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})