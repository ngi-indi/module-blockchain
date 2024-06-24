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

```
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

Modify the contract's parameters (```timeout``` and ```validatorsThreshold```) in the ```deployment.json``` file:

```bash
nano deployment.json
```

A valid ```deployment.json``` file will look either like this: 

```json
{
    "validatorsThreshold": 3,
    "timeout": 200
}
```

or like this:

```json
{
    "validatorsThreshold": 3,
    "timeout": 200,
    "networkName": "bnbTestnet",
    "contractAddress": "0x00000000219ab540356cBB839Cbe05303d7705Fa"
}
```

In fact, when the contract is deployed, the ```networkName``` and ```contractAddress``` fields will be updated or created if they are missing. This allows for faster deployment of a new contract by overwriting the previous definitions.


Deploy the contract on the BNB Smart Chain testnet:

```bash
npm run deploy bnbTestnet
```

Output: 

```
Ontology token contract address: 0x8212cC760Dd59f419C6772bbC7aBeC7243e1245d
Token distribution contract address: 0x60Bd56D49938a995B06eCd4345ad0480e805f0Ec
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
    "networkName": "bnbTestnet",
    "contractAddress": "0x60Bd56D49938a995B06eCd4345ad0480e805f0Ec"
}
```

Currently, this file resides only in the owner's Docker instance. To share this common file with all the other instances that will be launched, we first need to copy this file from the Docker container to the host. \
Without closing the console with the owner instance, open a new console at the root of this project:

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