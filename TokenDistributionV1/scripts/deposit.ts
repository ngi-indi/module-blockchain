import { ITokenDistribution, IIndiToken } from "./interface.ts";
import { ethers } from "hardhat";

const DEPLOYMENT_FILE_PATH = __dirname + "/../deployment.json";

const DEPOSIT_AMOUNT = 50000

async function main() {
    const [owner] = await ethers.getSigners();
    
    // -------------------------------------------------------------------
    // Contracts
    // -------------------------------------------------------------------

    const tokenDistribution = new ITokenDistribution(DEPLOYMENT_FILE_PATH); 
    await tokenDistribution.setup(owner);

    const indiToken = new IIndiToken(await tokenDistribution.getManagedTokenAddress());
    await indiToken.setup();

    // -------------------------------------------------------------------


    // -------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------
        
    // Deposit
    let deposit_tx = await tokenDistribution.deposit(DEPOSIT_AMOUNT);
    console.log("Deposit tx hash: ", deposit_tx);

    // -------------------------------------------------------------------

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})