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

## Testing

```bash
npx hardhat clean
npx hardhat test
```

```
Compiled 20 Solidity files successfully (evm target: paris).


  OntologyToken
    Deployment
      ✔ Should have the correct owner (415ms)
    Minting
      ✔ Should mint 10000 tokens and give them to the owner

  TokenDistribution
    Deployment
      ✔ Should set the correct owner address
      ✔ Should set the correct recipient address
      ✔ Should set the OntologyToken contract address
      ✔ Should set 200 blocks as timeout
      ✔ Should set 3 as validators threshold
      ✔ Should contain an empty request
    Validators management
      ✔ Should correctly add the validators
      ✔ Should correctly remove a validator
    Deposit
      ✔ Should deposit 10000 tokens
    Request
      ✔ Should not accept a withdrawal request with number of tokens greater than the contract's balance
      ✔ Should accept a 8000 tokens withdrawal request
    Approve
      ✔ Should accept a vote only from a validator
      ✔ Should let validators approve the request correctly
      ✔ Should not let a validator vote twice
      ✔ Should not accept more votes
    Withdraw
      ✔ Should let the recipient withdraw
      ✔ Should transfer the correct amount to the recipient
      ✔ Should have 2000 tokens left in its balance
      ✔ Should reset the request's status


  21 passing (533ms)
  ```