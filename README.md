# module-blockchain (experimental)

## List

- [TokenDistribution V1](TokenDistributionV1)

## Get started

### Install Hardhat

Install Node.js LTS:

```bash
sudo apt update
sudo apt install curl git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Create the project folder:

```bash
mkdir hardhat-project
cd hardhat-project
```

Initialize a Node.js project:

```bash
npm init
```

Compile all the metadata forms related to the Hardhat project. \
Download the Hardhat modules:

```bash
npm install --save-dev hardhat
```

Create a Hardhat project

```bash
npx hardhat init
```

Create an empty project since the JavaScript and the TypeScript ones come with already existing contracts.

Download the toolbox module:

```bash
npm i @nomicfoundation/hardhat-toolbox
```

Create the essential project folders:

```bash
mkdir contracts scripts test
```

The [```contracts```](contracts) folder will contain the Solidity contracts.\
The [```scripts```](scripts) folder will contain the deployment scripts.\
The [```test```](test) folder will contain the test scripts.

Download the OpenZeppelin template contracts:

```bash
npm i @openzeppelin/contracts
```

Modify the compiler version in the [```hardhat.config.js```](hardhat.config.js) file.


> [Configure TypeScript](https://hardhat.org/hardhat-runner/docs/guides/typescript) if needed.

### Install Echidna

Download the latest version from Echidna's [GitHub releases page](https://github.com/crytic/echidna/releases). 

Here, the version is ```2.2.3```:

```bash
cd ~
wget https://github.com/crytic/echidna/releases/download/v2.2.3/echidna-2.2.3-x86_64-linux.tar.gz
```

Extract the archive:

```bash
tar -xvf echidna-2.2.3-x86_64-linux.tar.gz
rm echidna-2.2.3-x86_64-linux.tar.gz
```

Move it to the programs folder:

```bash
sudo mv echidna /usr/local/bin/
```

Install the ```crytic-compile``` and ```slither-analyzer``` libraries:

```bash
pip install crytic-compile
pip3 install slither-analyzer --user
```

Install a Solidity compiler specific version:

```bash
solc-select install 0.8.25
```

In this example, the compiler version is ```0.8.25```.

## Compile the contracts

```bash
npx hardhat compile
```

This action generates the [```artifacts```](artifacts) folder.

## Clear cache and compiled contracts files

```bash
npx hardhat clean
```

## Unit and integration testing (Hardhat)

The libraries used for testing the Solidity code are [```Mocha```](https://mochajs.org/) and [```Chai```](https://www.chaijs.com/). To install them run:


```bash
npm install --save-dev mocha chai
```

<!-- 
In case of "Error HH19"
(Error HH19: Your project is an ESM project (you have "type": "module" set in your package.json) but your Hardhat config file uses the .js extension)

https://ethereum.stackexchange.com/a/158991
-->

To run the tests, execute:

```bash
npx hardhat test
```

Or, alternatively: 

```bash
npm run test:hardhat
```

<!--
Run tests on a specific network

```bash
npx hardhat test --network bnbTestnet
```

Some testing features such as before(), beforeAll(), etc. do not work outside the Hardhat testnet...
-->

## Fuzz testing (Echidna) <!-- Property-based testing -->

Before running the tests, make sure:
- The Echidna npm script is defined in the ```package.json``` file.
- The Echidna ```echidna.config.yaml``` configuration file exists and is correctly set.
- The Solidity compiler versions are coherent and correct (in ```package.json```, ```echidna.config.yaml```, ```hardhat,config.ts```, the Solidity code, etc.)

To execute, run:

```bash
npm run test:echidna
``` 

## Deploy the contract

```bash
npm run deploy:<networkName>
```

```<networkName>``` must be defined in the ```hardhat.config.ts``` file and the npm command must be defined in the ```package.json``` file.

### Example where ```<networkName>``` is ```bnbTestnet```

```bash
npm run deploy:bnbTestnet
```

>```hardhat.config.ts```:

```
const config: HardhatUserConfig  = {
	solidity: "0.8.25",
  	networks: {
		bnbTestnet: {
			url: "https://bsc-testnet-dataseed.bnbchain.org",
			chainId: 97,
			gasPrice: 20000000000,
			accounts: {mnemonic: mnemonic},
		},
	},
	etherscan: {
		apiKey: bscscanApiKey
	}
};
```

## Interact with a deployed contract

```ts
const contractName = "MyContract";
const contractAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const myContract = await (await ethers.getContractFactory(contractName)).attach(contractAddress);

await myContract.myAction();
```