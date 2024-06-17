import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ITokenDistribution, IOntologyToken } from "./interface.ts";
import { ethers } from "hardhat";
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const DEPLOYMENT_FILE_PATH = __dirname + "/../deployment.json";

async function main() {
    const [owner, recipient, val_0, val_1, val_2] = await ethers.getSigners();
    const validators = [val_0, val_1, val_2];
    
    // -------------------------------------------------------------------
    // Contracts
    // -------------------------------------------------------------------

    const tokenDistribution = new ITokenDistribution(DEPLOYMENT_FILE_PATH); 
    await tokenDistribution.setup();

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
    
    // All the actions in TokenDistribution are performed by the owner until a new changeUser() call
    tokenDistribution.changeUser(owner);
    
    // Mint
    ontologyToken.mint(50000);
    await sleep(2000);
    console.log("Owner balance: ", (await ontologyToken.getBalanceOf(owner.address)));
    console.log("Contract balance: ", (await ontologyToken.getBalanceOf(tokenDistribution.contractAddress)));
    
    // Approve
    let approve_tx = await ontologyToken.approve(tokenDistribution.contractAddress, 50000);
    console.log("Approve tx hash: ", approve_tx);

    await sleep(2000);
        
    // Deposit
    let deposit_tx = await tokenDistribution.deposit(50000);
    console.log("Deposit tx hash: ", deposit_tx);

    await sleep(2000);
    
    // Add validators
    for(let i=0; i<validators.length; i++) {
        let current_tx = await tokenDistribution.addValidator(validators[i]);
        console.log(`Add validator ${i} tx hash: ${current_tx}`);
    }
    
    await sleep(2000);
    
    for(let i=0; i<validators.length; i++) {
        console.log(`Is ${validators[i].address} a validator? `, await tokenDistribution.isValidator(validators[i]));
    }

    // Request
    tokenDistribution.changeUser(recipient);
    let request_tx = await tokenDistribution.request(4000);
    console.log("Request tx hash: ", request_tx);
    
    await sleep(2000);

    // Approve
    for(let i=0; i<validators.length; i++) {
        tokenDistribution.changeUser(validators[i]);
        let current_tx = await tokenDistribution.approve();
        console.log(`Validator ${i}, approve tx hash: ${current_tx}`);
        await sleep(2000);
    }

    await sleep(2000);

    console.log(`Number of validators in the current request: ${await tokenDistribution.getNumberOfValidatorsInCurrentRequest()}`);

    // Withdraw
    tokenDistribution.changeUser(recipient);
    let withdraw_tx = await tokenDistribution.withdraw();
    console.log("Withdraw tx hash: ", withdraw_tx);

    // -------------------------------------------------------------------

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})