# TokenDistribution V1

## Specification

The Token Distribution contract involves a user and a set of validators.
The contract ensures that a user can withdraw a required amount of tokens only if the transfer is approved by a specified number of validators.

The owner creates the contract and initializes it by setting:
- the address of the recipient;
- the minimum number of validators that must approve a withdraw request;
- a relative timeout after which the withdraw request is no longer valid.

After the creation, the contract supports the following actions:
- **deposit**: the contract owner deposits a given amount of tokens into the contract;
- **addValidator**: the contract owner adds a validator;
- **removeValidator**: the contract owner removes a validator;
- **request**: the recipient issues a withdraw request for a given token amount. This is only possible if there are not other pending requests. The request expires after the timeout;
- **approve**: a validator can vote for the withdrawal request;
- **withdraw**: if the withdraw request is approved, this action transfers the tokens to the recipient.

## Commands

The following commands are defined in the [```package.json```](./package.json) file.

**README**: All the commands require a wallet passphrase defined in the environment as ```$PRIVATE_KEY```.

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

In this execution scenario, we will deploy the IndiToken and the  TokenDistribution contracts on the BNB Smart Chain testnet by using Docker. \
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

### Participants

| Address | Role  |
|-------------------------------------------------------------------------------------------------------------------------------|-----------|
| [0x3C0B8E61a8016EF9536273A7987a539BB2Bb8184](https://testnet.bscscan.com/address/0x3C0B8E61a8016EF9536273A7987a539BB2Bb8184)  |  Owner |
| [0x60FC3E6Ad91Fc02Efa77E91b207603C4C397532f](https://testnet.bscscan.com/address/0x60FC3E6Ad91Fc02Efa77E91b207603C4C397532f)  | Recipient |
| [0xe62A590450E97A3021D23ca4236eE24cfb3C08d7](https://testnet.bscscan.com/address/0xe62A590450E97A3021D23ca4236eE24cfb3C08d7)  | Validator |
| [0x5af498d1f321F811c27baba59F0E97152986d356](https://testnet.bscscan.com/address/0x5af498d1f321F811c27baba59F0E97152986d356)  | Validator |
| [0xa29E7a55f24E477D8ea204862CbFf44D0a0913da](https://testnet.bscscan.com/address/0xa29E7a55f24E477D8ea204862CbFf44D0a0913da)  | Validator |



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

>Indi token contract address: [0x3D72F805Bd60cEAEe59B20e32e4A411842750fD8](https://testnet.bscscan.com/address/0x3D72F805Bd60cEAEe59B20e32e4A411842750fD8) \
>Token distribution contract address: [0xBA7F0a81aa2809112805FF9ab6a8f7a27Be36a40](https://testnet.bscscan.com/address/0xBA7F0a81aa2809112805FF9ab6a8f7a27Be36a40)

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
    "contractAddress": "0xBA7F0a81aa2809112805FF9ab6a8f7a27Be36a40"
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

>Owner: [0x3C0B8E61a8016EF9536273A7987a539BB2Bb8184](https://testnet.bscscan.com/address/0x3C0B8E61a8016EF9536273A7987a539BB2Bb8184) \
>Recipient: [0x60FC3E6Ad91Fc02Efa77E91b207603C4C397532f](https://testnet.bscscan.com/address/0x60FC3E6Ad91Fc02Efa77E91b207603C4C397532f) \
>Timeout: 200 \
>Validators threshold: 3 \
>Token address: [0x3D72F805Bd60cEAEe59B20e32e4A411842750fD8](https://testnet.bscscan.com/address/0x3D72F805Bd60cEAEe59B20e32e4A411842750fD8) \
>Validators in current request: 0 \
>Block number in current request: 0

#### ERC-20 management

From the owner instance, run the [```erc20.ts```](./scripts/erc20.ts) script responsible for minting the tokens and call the ERC20 approve method for the contract address.

```bash
npx hardhat run --network bnbTestnet scripts/erc20.ts
```

Output:

>Mint tx hash:  [0x0c4dc37a0181e3d489e54f40de95ea1ab64f8d74564eb5380da3ca1ebc593f6d](https://testnet.bscscan.com/tx/0x0c4dc37a0181e3d489e54f40de95ea1ab64f8d74564eb5380da3ca1ebc593f6d) \
>Approve tx hash:  [0xf5ffd35ff915e1059fc4352e37d1d3f561b1c631cd17c65d1db3855393fcce0d](https://testnet.bscscan.com/tx/0xf5ffd35ff915e1059fc4352e37d1d3f561b1c631cd17c65d1db3855393fcce0d)

#### Add validators

We add three validator addresses to our contract:

- [0xe62A590450E97A3021D23ca4236eE24cfb3C08d7](https://testnet.bscscan.com/address/0xe62A590450E97A3021D23ca4236eE24cfb3C08d7)
- [0x5af498d1f321F811c27baba59F0E97152986d356](https://testnet.bscscan.com/address/0x5af498d1f321F811c27baba59F0E97152986d356)
- [0xa29E7a55f24E477D8ea204862CbFf44D0a0913da](https://testnet.bscscan.com/address/0xa29E7a55f24E477D8ea204862CbFf44D0a0913da)

From the owner instance, create a temporary file named ```validators.txt``` containing all the addresses we want to add separated by a new line:

```bash
touch validators.txt
nano validators.txt
```

```
0xe62A590450E97A3021D23ca4236eE24cfb3C08d7
0x5af498d1f321F811c27baba59F0E97152986d356
0xa29E7a55f24E477D8ea204862CbFf44D0a0913da
```

Run the [```add-validators.ts```](./scripts/add-validators.ts) script: 

```bash
npx hardhat run --network bnbTestnet scripts/add-validators.ts
```

Output:

>Add validator [0xe62A590450E97A3021D23ca4236eE24cfb3C08d7](https://testnet.bscscan.com/address/0xe62A590450E97A3021D23ca4236eE24cfb3C08d7) tx hash: [0xd5e3d2270dd9ecbe747d1dac9177c5cf753b516ad86542162a5221418838df02](https://testnet.bscscan.com/tx/0xd5e3d2270dd9ecbe747d1dac9177c5cf753b516ad86542162a5221418838df02) \
>Add validator [0x5af498d1f321F811c27baba59F0E97152986d356](https://testnet.bscscan.com/address/0x5af498d1f321F811c27baba59F0E97152986d356) tx hash: [0x033b4ea5899689d67399305d0b02c192f153092934426d32353211610eccd867](https://testnet.bscscan.com/tx/0x033b4ea5899689d67399305d0b02c192f153092934426d32353211610eccd867) \
>Add validator [0xa29E7a55f24E477D8ea204862CbFf44D0a0913da](https://testnet.bscscan.com/address/0xa29E7a55f24E477D8ea204862CbFf44D0a0913da) tx hash: [0x2ecfa4af5c40839c44b74881d6559f1731cbc916f877e7937df4d537ec8c266f](https://testnet.bscscan.com/tx/0x2ecfa4af5c40839c44b74881d6559f1731cbc916f877e7937df4d537ec8c266f)


### Deposit

From the owner instance, fund the contract by running the [```deposit.ts```](./scripts/deposit.ts) script:

```bash
npx hardhat run --network bnbTestnet scripts/deposit.ts
```

Output:

>Deposit tx hash:  [0x61cf853c7df29c81794a0ab37e1d1b9a8da6006e02da144f1a4408be0cfa9f89](https://testnet.bscscan.com/tx/0x61cf853c7df29c81794a0ab37e1d1b9a8da6006e02da144f1a4408be0cfa9f89)


### Withdrawal request

From the recipient instance, peform a withdrawal request by running the [```request.ts```](./scripts/request.ts) script: 

```bash
npx hardhat run --network bnbTestnet scripts/request.ts
```

Output:

>Request tx hash:  [0x38800078a30633ae2d23689937de1429dd01176f372a8309958d4edff89f1517](https://testnet.bscscan.com/tx/0x38800078a30633ae2d23689937de1429dd01176f372a8309958d4edff89f1517)


### Approve the request

From each validators console, execute the [```approve.ts```](./scripts/approve.ts) script:

```bash
npx hardhat run --network bnbTestnet scripts/approve.ts
```

Outputs:

>Validator [0xe62A590450E97A3021D23ca4236eE24cfb3C08d7](https://testnet.bscscan.com/address/0xe62A590450E97A3021D23ca4236eE24cfb3C08d7), approve tx hash: [0x7349529c3f21ff528ad49bfc33815cf42342d399bf3f14ba39bbf3ca0ff6f0cd](https://testnet.bscscan.com/tx/0x7349529c3f21ff528ad49bfc33815cf42342d399bf3f14ba39bbf3ca0ff6f0cd)\
>Validator [0x5af498d1f321F811c27baba59F0E97152986d356](https://testnet.bscscan.com/address/0x5af498d1f321F811c27baba59F0E97152986d356), approve tx hash: [0x5155b38a91eaa7098aa593c84c0b32205c78a2e097d6bea475ac8a889e1073c0](https://testnet.bscscan.com/tx/0x5155b38a91eaa7098aa593c84c0b32205c78a2e097d6bea475ac8a889e1073c0)\
>Validator [0xa29E7a55f24E477D8ea204862CbFf44D0a0913da](https://testnet.bscscan.com/address/0xa29E7a55f24E477D8ea204862CbFf44D0a0913da), approve tx hash: [0x889a233d3d8f423a58e219998779aa06d5a06521f642389684410e32ab16be45](https://testnet.bscscan.com/tx/0x889a233d3d8f423a58e219998779aa06d5a06521f642389684410e32ab16be45)

### Withdraw

Finally, the recipient performs the withdraw from the corresponding console running: 

```bash
npx hardhat run --network bnbTestnet scripts/withdraw.ts
```

Output:

>Withdraw tx hash:  [0x6803fb5745276aa7b49ee12ee38912e915e909ec870bb7be6d6f744e201c3ef4](https://testnet.bscscan.com/tx/0x6803fb5745276aa7b49ee12ee38912e915e909ec870bb7be6d6f744e201c3ef4)
