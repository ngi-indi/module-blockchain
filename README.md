<div align="center">
  <img src="./assets/logo.jpg" alt="Logo" width="150"/>

  # Blockchain Manager

  ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
  ![Version 0.1](https://img.shields.io/badge/version-0.1-green.svg)
  ![Status: Stable](https://img.shields.io/badge/status-stable-brightgreen.svg)
    
  <p>
     The <strong>Blockchain Manager</strong> provides a comprehensive framework for developing, testing, and deploying blockchain-based solutions. Built using tools like <strong>Hardhat</strong>, <strong>Echidna</strong>, and <strong>Docker</strong>, it enables efficient contract compilation, testing, and deployment on various blockchain networks. It supports smart contract development with advanced fuzz testing and security auditing tools, ensuring robust and secure blockchain applications. This module offers developers an integrated solution to manage blockchain projects with reusable templates, network configuration, and contract deployment automation.
  </p>

</div>

## Table of Contents

- [Installation](#installation)
  - [Prerequisites](#requirements)
  - [Setup](#setup)
- [Usage](#docker-commands)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)


---

## Installation

### Requirements

- Node.js
- Hardhat
- Docker
- Echidna

### Setup

1. Clone the repository:

	```bash
	git clone --branch experimental https://github.com/ngi-indi/module-blockchain.git
	```

2. Install Node.js LST:

	```bash
	sudo apt update
	sudo apt install curl git
	curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
	sudo apt-get install -y nodejs
	```

3. Install the Node.js dependencies:

	```
	npm install
	```

4. Install Docker:

	```bash
	sudo apt update
	sudo apt install apt-transport-https ca-certificates curl software-properties-common
	curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
	sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
	apt-cache policy docker-ce
	sudo apt install docker-ce

	sudo apt  install docker-compose
	```

5. Install Echidna:

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

## Create a new Hardhat project

1. Create the project folder:

	```bash
	mkdir hardhat-project
	cd hardhat-project
	```

2. Initialize a Node.js project:

	```bash
	npm init
	```

3. Fill all the metadata fields in.

4. Download the Hardhat modules:

	```bash
	npm install --save-dev hardhat
	```

5. Create the project:

	```bash
	npx hardhat init
	```

6. Select empty project since the JavaScript and the TypeScript ones come with already existing contracts.

7. Download the toolbox module:

	```bash
	npm i @nomicfoundation/hardhat-toolbox
	```

8. Create the essential project folders:

	```bash
	mkdir contracts scripts test
	```

	The ```contracts``` folder will contain the Solidity contracts.\
	The ```scripts``` folder will contain the deployment scripts.\
	The ```test``` folder will contain the test scripts.

9. Download the OpenZeppelin template contracts:

	```bash
	npm i @openzeppelin/contracts
	```

10. Select a compiler version editing the ```hardhat.config.js``` file.


11. [```Configure TypeScript```](https://hardhat.org/hardhat-runner/docs/guides/typescript) if needed.

12. Install the TypeScript libraries for testing:

	```bash
	npm install --save-dev mocha chai
	```
	
<!-- 
In case of "Error HH19"
(Error HH19: Your project is an ESM project (you have "type": "module" set in your package.json) but your Hardhat config file uses the .js extension)

https://ethereum.stackexchange.com/a/158991
-->

## Hardhat commands

#### Compile the contracts

```bash
npx hardhat compile
```

This action generates the [```artifacts```](artifacts) folder.

#### Clear cache and compiled contracts files

```bash
npx hardhat clean
```

#### Run the tests

1. Place the TypeScript files in the ```test``` folder.

2. Execute the tests:

	```bash
	npx hardhat test
	```

<!--
Run tests on a specific network

```bash
npx hardhat test --network bnbTestnet
```

Some testing features such as before(), beforeAll(), etc. do not work outside the Hardhat testnet...
-->

#### Deploy a contract

1. Define the network properties in the ```hardhat.config.ts```.

	> Example where ```<networkName>``` is ```bnbTestnet```:

	```ts
	// hardhat.config.ts
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

2. Place the TypeScript file in the ```scripts``` folder.

3. Execute the deployment script:

	```bash
	npx hardhat run --network <networkName> scripts/deploy.ts
	```

	> Example where ```<networkName>``` is ```bnbTestnet```:

	```bash
	npx hardhat run --network bnbTestnet scripts/deploy.ts
	```

#### Interact with a deployed contract

1. Define the network properties in the ```hardhat.config.ts```.

	> Example where ```<networkName>``` is ```bnbTestnet```:

	```ts
	// hardhat.config.ts
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

2. Place the TypeScript file in the ```scripts``` folder.

	> Interaction code template: 

	```ts
	const contractName = "MyContract";
	const contractAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

	const myContract = await (await ethers.getContractFactory(contractName)).attach(contractAddress);

	await myContract.myAction();
	```

3. Execute the script:

	```bash
	npx hardhat run --network <networkName> scripts/interact.ts
	```

## Echidna

1. 	Before running the tests, make sure:

	- The Echidna ```echidna.config.yaml``` configuration file exists and it is correctly set.
	- The Solidity compiler versions are coherent and correct (accross ```package.json```, ```echidna.config.yaml```, ```hardhat.config.ts```, the Solidity code, etc.)

2. Start the fuzz testing:

	```bash
	solc-select use 0.8.25 && echidna --contract Echidna<ContractName> echidna/Echidna<ContractName>.sol --config echidna/echidna.config.yaml
	```

## Usage

#### Build all the instances

```bash
sudo docker compose up --build
```

#### Build a specific instance 

```<MyInstance>``` must be declared in the ```compose.yaml``` file:

```bash
sudo docker compose up --build <MyInstance>
```

#### Clear the instances

```bash
sudo docker compose rm -f
```

<!-- 
```bash
sudo docker system prune
```
-->

#### Interact with an instance

1. Add the ```tty: true``` property to the instance's definition in the ```compose.yaml``` file.\
	
2. Run the instance:

	```bash
	sudo docker compose up -d <MyInstance>
	```

3. In another shell, run:

	```bash
	sudo docker ps
	```

4. Copy the ```CONTAINER ID``` or ```NAMES``` values down.

5. Execute:

	```bash
	sudo docker exec -it <CONTAINER ID> /bin/bash
	```

#### Stop a running instance

```bash
sudo docker stop <CONTAINER ID>
```


## Contributing

### Reporting bugs and requesting features
- If you find a bug, please open an issue.
- To request a feature, feel free to open an issue as well.

### Developing a new feature

1. **Fork the repository** by clicking the "Fork" button at the top right of this page.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/ngi-indi/module-bias-manager.git
   ```
3. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature-branch
   ```
4. **Make your changes.** Please follow the existing code style and conventions.
5. **Commit your changes** with a descriptive commit message:
   ```bash
   git commit -m "Add new feature: explanation of bias model predictions"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature-branch
   ```
7. **Open a pull request** from your fork’s branch to the main branch of this repository.
- Describe the changes you’ve made in the PR description.
- Ensure that your PR references any relevant issues.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
For any questions or support, please reach out to:
- Email: support@ngi-indi.com
- Website: NGI Search INDI