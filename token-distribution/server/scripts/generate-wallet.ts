import {ethers, Wallet} from "ethers";

const wallet = Wallet.createRandom(ethers.getDefaultProvider());
console.log(wallet)