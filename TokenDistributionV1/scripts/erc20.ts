import { ITokenDistribution, IOntologyToken } from "./interface.ts";
import { ethers } from "hardhat";

const DEPLOYMENT_FILE_PATH = __dirname + "/../deployment.json";

const MINT_AMOUNT = 50000;

async function main() {
    const [owner] = await ethers.getSigners();
    
    // -------------------------------------------------------------------
    // Contracts
    // -------------------------------------------------------------------

    const tokenDistribution = new ITokenDistribution(DEPLOYMENT_FILE_PATH); 
    await tokenDistribution.setup(owner);

    const ontologyToken = new IOntologyToken(await tokenDistribution.getManagedTokenAddress());
    await ontologyToken.setup();

    // -------------------------------------------------------------------


    // -------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------

    // Mint
    let mint_tx = await ontologyToken.mint(MINT_AMOUNT);
    console.log("Mint tx hash: ", mint_tx);
    
    // Approve (ERC-20)
    let approve_tx = await ontologyToken.approve(tokenDistribution.contractAddress, MINT_AMOUNT);
    console.log("Approve tx hash: ", approve_tx);

    // -------------------------------------------------------------------

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})