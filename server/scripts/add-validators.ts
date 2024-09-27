import { ITokenDistribution } from "./interface.ts";
import { ethers } from "hardhat";
import * as fs from 'fs';

const DEPLOYMENT_FILE_PATH = __dirname + "/../deployment.json";
const VALIDATORS_FILE_PATH = __dirname + "/../validators.txt";

async function main() {
    const [owner] = await ethers.getSigners();
    
    // -------------------------------------------------------------------
    // Contracts
    // -------------------------------------------------------------------

    const tokenDistribution = new ITokenDistribution(DEPLOYMENT_FILE_PATH); 
    await tokenDistribution.setup(owner);

    // -------------------------------------------------------------------


    // -------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------

    const fileContent = fs.readFileSync(VALIDATORS_FILE_PATH, 'utf-8');
    const lines = fileContent.split(/\r?\n/); // split each line

    // For each line
    for (const val of lines) {
        if (val.trim()) {  // line not empty (after removing spaces)
            try {
                // Add a validator
                const current_tx = await tokenDistribution.addValidator(val);
                console.log(`Add validator ${val} tx hash: ${current_tx}`);
            } catch (error) {
                console.error(`Failed to add validator ${val}:`, error);
            }
        }
    }
    
    // -------------------------------------------------------------------

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})