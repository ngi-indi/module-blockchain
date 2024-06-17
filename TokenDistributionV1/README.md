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

## Interact 

```bash
npx hardhat run --network <networkName> scripts/interact.ts
```

Or 

```bash
npm run interact:<networkName>
```

## Execution trace (BSC Tesnet)

```bash
npm run deploy:bnbTestnet
```

```
Ontology token contract address: 0x0a7b5d84e064c6b5438ce6AAE39C00C885fd9Da3
Token distribution contract address: 0xA9E6C0C7EF2AEC3A83016E699137114015cdC75B
```


```bash
npm run interact:bnbTestnet
```

```
Owner: 0xbDf561984e2432b26f824048dfE610C0B6c8DF95
Recipient: 0x08eb8d579553d2B1849bB3850B99f9D0B9c2c4D8
Timeout: 200
Validators threshold: 3
Token address: 0x0a7b5d84e064c6b5438ce6AAE39C00C885fd9Da3
Owner balance:  50000n
Contract balance:  0n
Approve tx hash:  0x44f0a9571bb2032b6a93be960f43d3a25d6a42ff2ca2efe41f7ed1c2d72e9451
Deposit tx hash:  0xd48fca091c21b72920182d93d6d16ffbdf01567464c8c1d2166557e7889be564
Add validator 0 tx hash: 0x9ee099dd5bcad607d3ef4dc7af3a0ae921bbdc71c92e3037a4ccb9b2c3eec8ac
Add validator 1 tx hash: 0xb4f20f14b9dd14386c060125d88e06d01f0bc76627e867d5b360a88d4b6bb40c
Add validator 2 tx hash: 0xe0a65ac276b052fb5273b9af9472e179f5c0c981499af30ac33b4d1ff2962c96
Is 0xA478D11eEc9DA2b5230AEd8f8DE91Ee830EE4CbF a validator?  true
Is 0xFb3674266BaC39C6b4EDf7DD78AD40d54b7137eA a validator?  true
Is 0xA96eC9242f92e0E7Ef6b2A12427Be156A64a3743 a validator?  true
Request tx hash:  0x2298cdb21a33cbe99012f7348f4496242ab764679d7f1e075e8a33d594072bc5
Validator 0, approve tx hash: 0x3db4e62f3d28336750937b103aa9601cf26b1e5bace7d955426f295a3f3a2c28
Validator 1, approve tx hash: 0xfc061e4b543ddc3ef638c752f25f38cd26c6680969896f7f6647c75e6a286690
Validator 2, approve tx hash: 0x975ac4adf45b070e2429eb6d465a5f2170514ee23e2626d625881df4860dd9fc
Number of validators in the current request: 3
Withdraw tx hash:  0x56a3468ecd845dafe9b85619d77af532b10ae7a8991374dff472c4b68ca31c42
```
