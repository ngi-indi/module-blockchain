# TokenDistribution V1

## Specification

The Token Distribution contract involves a user and a set of validators.
The contract ensures that a user can withdraw a determined amount of tokens only if the transfer is approved by at specified number of validators.

The owner creates the contract and initializes it by setting:

- the address of the recipient
- the number of votes required for a withdrawal request to be accepted  
- a timeout after which the withdrawal request is no longer valid

After the creation, the contract allows these actions:

- **deposit**: the contract owner deposits a specified amount of tokens into the contract
- **addValidator**: the contract owner adds a new validator
- **removeValidator**: the contract owner removes a specified validator
- **request**: the recipient makes a withdrawal request for a specified amount. This is only possible if there are not other pending requests. Each request has a deadline after which the request expires.
- **approve**: a validator can vote for the withdrawal request.
- **withdraw**: if the withdrawal request has been approved, the recipient withdraws the tokens.

## Commands

The following commands are defined in the [```package.json```](./package.json) file.

README: All the commands require a wallet passphrase defined in the environment as ```$PRIVATE_KEY```.

- ```npm run generate-wallet```\
Prints a new generated [```HDNodeWallet```](https://docs.ethers.org/v6-beta/api/wallet/#HDNodeWallet).

- ```npm run deploy <networkName>```\
Deploys the contracts into the ```<networkName>``` network.\
```<networkName>``` must be a valid network name specified in the [```hardhat.config.ts```](./hardhat.config.ts) file. \
Example: ```npm run deploy bnbTestnet```

- ```npm run docker:instance <name>```\
Runs a Docker container interactable (tty) instance with a specified ```<name>```.\
```<name>``` must be a valid participant name specified in the [```compose.yaml```](./compose.yaml) file. \
Example: ```npm run docker:instance owner```

- ```npm run test:echidna```\
Launches Echidna to fuzz test the contracts.

- ```npm run test:hardhat```\
Runs all the unit test within hardhat.

- ```npm run docker:clear```\
Removes all the Docker cached instances.

- ```npm run docker:clear-all```\
Similar to ```npm run docker:clear``` but more aggressive. It prunes all the local Docker images.

- ```npm run docker:test:echidna```\
Launches Echidna to fuzz test the contracts in a Docker container.

- ```npm run docker:test:hardhat```\
Runs all the unit test within hardhat in a Docker container.

## Execution traces with Docker

### Environment

In this execution scenario, we will deploy the OntologyToken and the  TokenDistribution contracts on the BNB Smart Chain testnet by using Docker. \
Each participant will have their own Docker instance and passphrase, as specified in the Docker [```compose.yaml```](compose.yaml) configuration file. \
To achieve this, we need to define a ```.env``` environment file at the root of this project.\
The ```.env``` file, containing all the participants' passphrases, will look like this: 

```json
# Passphrases:
PRIVATE_KEY_1="a million miles away your signal in the distance to whom it"
PRIVATE_KEY_2="may concern I think I lost my way getting good at starting"
PRIVATE_KEY_3="over every time that I return learning to walk again I believe"
PRIVATE_KEY_4="I ve waited long enough where do I begin learning to talk"
PRIVATE_KEY_5="again cant you see I ve waited long enough where do I"
```

### Deployment

Run a Docker instance for the owner (whose passphrase is ```$PRIVATE_KEY_1```):

```bash
npm run docker:instance owner
```

Verify the passphrase has been correctly set:

```bash
echo $PRIVATE_KEY
```

Modify the contract's parameters in the ```deployment.json``` file:

```bash
nano deployment.json
```

A valid ```deployment.json``` file will look either like this: 

```json
{
    "validatorsThreshold": 3,
    "timeout": 200,
    "recipientAddress": "0x60FC3E6Ad91Fc02Efa77E91b207603C4C397532f"
}
```

or like this:

```json
{
    "validatorsThreshold": 3,
    "timeout": 200,
    "recipientAddress": "0x60FC3E6Ad91Fc02Efa77E91b207603C4C397532f",
    "networkName": "bnbTestnet",
    "contractAddress": "0xffffffffffffffffffffffffffffffffffffffff"
}
```

In fact, when the contract is deployed, the ```networkName``` and ```contractAddress``` fields will be updated or created if they are missing. This allows for faster deployment of a new contract by overwriting the previous definitions.


Deploy the contract on the BNB Smart Chain testnet:

```bash
npm run deploy bnbTestnet
```

Output: 

```
Ontology token contract address: 0x173b1b094872653b1C12D191D1cF9aE925150487
Token distribution contract address: 0x64c40Ee2C39CED945e53757625De7d34253858Ab
```

Verify the ```deployment.json``` file has been correctly updated: 

```bash
cat deployment.json
```

Output:

```json
{
    "validatorsThreshold": 3,
    "timeout": 200,
    "recipientAddress": "0x60FC3E6Ad91Fc02Efa77E91b207603C4C397532f",
    "networkName": "bnbTestnet",
    "contractAddress": "0x64c40Ee2C39CED945e53757625De7d34253858Ab"
}
```

Currently, this file resides only in the owner's Docker instance. To share this common file with all the other instances that will be launched, we first need to copy this file from the Docker container to the host. \
Without closing the console with the owner instance, **open a new console** at the root of this project:

```bash
cd ./path-to/module-blockchain/TokenDistributionV1/
```

Print all the Docker running instances:

```bash
sudo docker ps
```

Identify the owner instance by the ```NAMES``` column. If this is the only instance of that kind, its name will likely be ```tokendistributionv1-owner-1```.

Copy the ```deployment.json``` file from the instance to the host:

```bash
sudo docker cp tokendistributionv1-owner-1:/usr/src/app/deployment.json ./deployment.json
```

Verify the host contains the correct file version:

```bash
cat deployment.json
```

the output of this command must be identical to the same command executed on the Docker instance.

In case of problems with the ```docker cp``` command, an alternative is to manually rewrite (or copy and paste) the content of the file from the container to the host.

Since the contract has been deployed, we can close the owner instance by typing ```exit``` in its console.

Now, we can close all the running instances with:

```bash
sudo docker rm -vf $(docker ps -aq)
```

In case we need to clear all the Docker images, we can run:  

```bash
npm run docker:clear-all
```

### Interactions

Open 5 new terminals at the root of the project. In each console, launch the corresponding container for the current participant: 

```bash
npm run docker:instance owner
```

```bash
npm run docker:instance recipient
```

```bash
npm run docker:instance validator-1
```

```bash
npm run docker:instance validator-2
```

```bash
npm run docker:instance validator-3
```

If an instance does not get launched bacause of ```Error response from daemon: network tokendistributionv1_default is ambiguous (2 matches found on name)```, delete all the docker networks and launch the instances again:

```bash 
sudo docker network prune
```

To properly interact with the deployed contract, an instance should have the correct passphrase defined in the ```.env``` file and the correct ```contractAddress``` defined in the ```deployment.json``` file. When we launched the instances, the latter file is shared from the host to all the instances as specified by the [Dockerfile](Dockerfile) as all the projects file are copied to each container.

In each console, verify what we discussed above by running: 

```bash
echo $PRIVATE_KEY
```

and

```bash
cat deployment.json
```

#### Check contracts status

Before interacting with the TokenDistribution contract, let's call the [```check-status.ts```](./scripts/check-status.ts) script from any instance to make sure the contract is alive and responding to our getter requests:

```bash
npx hardhat run --network bnbTestnet scripts/check-status.ts
```

Output:

```json
Owner: 0x3C0B8E61a8016EF9536273A7987a539BB2Bb8184
Recipient: 0x60FC3E6Ad91Fc02Efa77E91b207603C4C397532f
Timeout: 200
Validators threshold: 3
Token address: 0x9C8Dc873D9E337991F050da7282a9b4d47626b65
Validators in current request: 0
Block number in current request: 0
```

#### ERC-20 management

From the owner instance, run the [```erc20.ts```](./scripts/erc20.ts) script responsible for minting the tokens and call the ERC20 approve method for the contract address.

```bash
npx hardhat run --network bnbTestnet scripts/erc20.ts
```

Output:

```json
Mint tx hash:  0x9192c0232c293b1d898bcd8766ff86ef8c13d560936616b02d2e8d12937a4f80
Approve tx hash:  0x9dfffe8f5414ed4914fdff039214bb927366fd1539d71a1f889943c71f39fabe
```

#### Add validators

We add three validator addresses to our contract:

- 0xe62A590450E97A3021D23ca4236eE24cfb3C08d7
- 0x5af498d1f321F811c27baba59F0E97152986d356
- 0xa29E7a55f24E477D8ea204862CbFf44D0a0913da

From the owner instance, create a temporary file named ```validators.txt``` containing all the addresses we want to add separated by a new line:

```bash
touch validators.txt
nano validators.txt
```

```json
0xe62A590450E97A3021D23ca4236eE24cfb3C08d7
0x5af498d1f321F811c27baba59F0E97152986d356
0xa29E7a55f24E477D8ea204862CbFf44D0a0913da
```

Run the [```add-validators.ts```](./scripts/add-validators.ts) script: 

```bash
npx hardhat run --network bnbTestnet scripts/add-validators.ts
```

Output:

```json
Add validator 0xe62A590450E97A3021D23ca4236eE24cfb3C08d7 tx hash: 0x9b41b04a7ddb1680e1414260c59e89d5bfe861578d3a466099a099dc14ce2911
Add validator 0x5af498d1f321F811c27baba59F0E97152986d356 tx hash: 0x465eacef205d7348963263fd673c354b0e080ed23ab0739dc131f6fce27e73dd
Add validator 0xa29E7a55f24E477D8ea204862CbFf44D0a0913da tx hash: 0x2f0071bff9074a417662676a03b155ef291218507e90f61950378cc7323abe18
```

### Deposit

From the owner instance, fund the contract by running the [```deposit.ts```](./scripts/deposit.ts) script:

```bash
npx hardhat run --network bnbTestnet scripts/deposit.ts
```

Output:

```json
Deposit tx hash:  0xe3ce06e3d7587792ced4f848f504d7fc518603e89fef80064c50ed8db9a12752
```

### Withdrawal request

From the recipient instance, peform a withdrawal request by running the [```request.ts```](./scripts/request.ts) script: 

```bash
npx hardhat run --network bnbTestnet scripts/request.ts
```

Output:

```json
Request tx hash:  0xd52edf2aff4ad0b162fe506f7aebb455ba9796bb3043237f21fdcb258f73b632
```

### Approve the request

From each validators console, execute the [```approve.ts```](./scripts/approve.ts) script:

```bash
npx hardhat run --network bnbTestnet scripts/approve.ts
```

Outputs:

```json
Validator 0xe62A590450E97A3021D23ca4236eE24cfb3C08d7, approve tx hash: 0xdd842a56370594663814041ab6ee7e9e5d80d280da69f937e6d9fe50d32effe7
```

```json
Validator 0x5af498d1f321F811c27baba59F0E97152986d356, approve tx hash: 0x1531b783de77ab8f6a7df32ef3ec18aa6b9d52ff82b4c7d76279ca6bcc416e23
```

```json
Validator 0xa29E7a55f24E477D8ea204862CbFf44D0a0913da, approve tx hash: 0x2cd1b6110df4701c66f06f527eaa541cddfec8db313757b0f25e53e02995a0dd
```

### Withdraw

Finally, the recipient performs the withdraw from the corresponding console running: 

```bash
npx hardhat run --network bnbTestnet scripts/withdraw.ts
```

Output:

```json
Withdraw tx hash:  0xd9cb1efe07d2d15db7a2a8767279c339f48b184f307668c214edc3b4589a92a9
```
