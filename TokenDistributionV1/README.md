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