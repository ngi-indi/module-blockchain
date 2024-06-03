import { ethers } from "hardhat";

const contractAddress = "0x5D2D968eEa19DC5FC23e6268055af62c65219eF6";

async function main() {
    const [owner] = await ethers.getSigners();

    const tokenDistribution = await (await ethers.getContractFactory("TokenDistribution")).attach(contractAddress);

    console.log("Contract's owner: " + await tokenDistribution.owner());
    console.log("Recipient's address: " + await tokenDistribution.recipient());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})