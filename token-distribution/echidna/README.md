# TokenDistribution V1 Echidna

## 📕 Table of Contents

<details open>
<summary></summary>

- [Commands](#commands)
- [Properties](#properties)
- [Contracts](#contracts)
    - [EchidnaTokenDistribution_1](#echidnatokendistribution_1-for-property-1-requestamountltecontractbalance)
    - [EchidnaTokenDistribution_2](#echidnatokendistribution_2-for-property-2-preventsnewrequestsbeforetimeout)
    - [EchidnaTokenDistribution_3](#echidnatokendistribution_3-for-property-3-numberofvalidatorsltethreshold)
</details>

## Commands

All the following commands must be executed at the [root](../) of the project.

- ```npm run test:echidna``` -> Verifies all the properties with the real contract implementation on the host machine.

- ```npm run docker:test:echidna``` -> Verifies all the properties with the real contract implementation on a Docker container.

## Properties 

<!-- 
- 00: **echidnaAddresses**: the hooking of the contract is correctly performed hence Echidna has the correct addresses.
-->

1.  **requestAmountLTEcontractBalance**: when a withdrawal request is accepted, the contract should always have the token balance to satisfy it.

2. **preventsNewRequestsBeforeTimeout**: request status is not updated when a new request attempt is performed if the timeout has not been reached yet.

3. **numberOfValidatorsLTEthreshold**: the number of approvals in a withdrawal request is never greater than the validators threshold.

## Contracts

Each property has its own folder containing itself with a modified version of the TokenDistribution contract to fail the assertion property.

### EchidnaTokenDistribution_1 for property 1: requestAmountLTEcontractBalance

Execute:

```bash
solc-select use 0.8.25 && echidna --contract EchidnaTokenDistribution_1 echidna/requestAmountLTEcontractBalance/EchidnaTokenDistribution_1.sol --config echidna/echidna.config.yaml
```

Original TokenDistribution contract:

```solidity
require(token.balanceOf(address(this)) >= _amount, "Contract has not enough tokens to cover this request!");
```

Modified contract:

```solidity
This line has been removed!
```

Output:

```
assertion in echidnaRequestAmount(uint256): FAILED! with ErrorRevert

Call sequence:
requestAmountLTEcontractBalance(uint256): failed!💥
  Call sequence:
    EchidnaTokenDistribution_1.requestAmountLTEcontractBalance(40813183705584189981829683726044902612952245489041374582859839671858653513958) Time delay: 302376 seconds Block delay: 45506
```

Comment: 

Echidna called its own echidnaRequestAmount() method requesting a large value to withdraw; the request has been approved because the original contract's check is missing and the value of the current request is hence greater than the contract tokens balance which is zero  (obviously this would also have failed even with a smaller value).

### EchidnaTokenDistribution_2 for property 2: preventsNewRequestsBeforeTimeout

Execute:

```bash
solc-select use 0.8.25 && echidna --contract EchidnaTokenDistribution_2 echidna/preventsNewRequestsBeforeTimeout/EchidnaTokenDistribution_2.sol --config echidna/echidna.config.yaml
```

Original TokenDistribution contract:

```solidity
if(block.number > currentRequest.blockNumber + timeout || currentRequest.blockNumber == 0)
{
    // Creates an empty request at the current block with the specified amount.
    currentRequest = Request(_amount, block.number, new address[](validatorsThreshold));
    
    emit NewWithdrawalRequest(currentRequest);
} 
else 
{
    revert("There's an active request pending!");
}
```

Modified contract:

```solidity
if(block.number < currentRequest.blockNumber + timeout || currentRequest.blockNumber == 0)
{
    // Creates an empty request at the current block with the specified amount.
    currentRequest = Request(_amount, block.number, new address[](validatorsThreshold));
    
    emit NewWithdrawalRequest(currentRequest);
} 
else 
{
    revert("There's an active request pending!");
}
```

Output:

```
preventsNewRequestsBeforeTimeout(uint256): failed!💥
  Call sequence:
    EchidnaTokenDistribution_2.request(35) Time delay: 136392 seconds Block delay: 33357
    EchidnaTokenDistribution_2.preventsNewRequestsBeforeTimeout(30) Time delay: 115085 seconds Block delay: 32
```

Comment:

Echidna performed a request and after 18 blocks (hence when the request was not expireed yet), performed a newer one that modified the request status. This mean a bad request has been accepted by the modified contract. 

### EchidnaTokenDistribution_3 for property 3: numberOfValidatorsLTEthreshold

Execute:

```bash
solc-select use 0.8.25 && echidna --contract EchidnaTokenDistribution_3 echidna/numberOfValidatorsLTEthreshold/EchidnaTokenDistribution_3.sol --config echidna/echidna.config.yaml
```

Original TokenDistribution contract:

```solidity
// In the constructor:
currentRequest.approvalValidators = new address[](validatorsThreshold);

// When creating an empty request
currentRequest = Request(_amount, block.number, new address[](validatorsThreshold));

// When checking the approve
require(getNumberOfValidatorsInCurrentRequest() < validatorsThreshold, "Number of approvals exceed!");

// In getNumberOfValidatorsInCurrentRequest() method (if the value is not modified by the for loop, returns the threshold)
uint firstFreeIndex = validatorsThreshold;
```

Modified contract:

```solidity
// In the constructor:
currentRequest.approvalValidators = new address[](validatorsThreshold+1);

// When creating an empty request
currentRequest = Request(_amount, block.number, new address[](validatorsThreshold+1));

// When checking the approve
This line has been removed!

// In getNumberOfValidatorsInCurrentRequest() method (if the value is not modified by the for loop, returns the current array length)
uint firstFreeIndex = currentRequest.approvalValidators.length;
```

Original Echidna contract:

```solidity
uint constant VALIDATORS_THRESHOLD = 3;
uint constant TIMEOUT = 110;
```

Modified Echidna contract:

```solidity
// Less validators and more timeout to reduce Echidna's search space
uint constant VALIDATORS_THRESHOLD = 2;
uint constant TIMEOUT = 1000;
```

Output:

```
numberOfValidatorsLTEthreshold(): failed!💥
  Call sequence:
    EchidnaTokenDistribution_3.addValidator(0x10000) from: 0x0000000000000000000000000000000000010000 Time delay: 67960 seconds Block delay: 66
    EchidnaTokenDistribution_3.addValidator(0x60000) from: 0x0000000000000000000000000000000000010000 Time delay: 401699 seconds Block delay: 54155
    EchidnaTokenDistribution_3.request(67) from: 0x0000000000000000000000000000000000020000 Time delay: 20098 seconds Block delay: 26267
    EchidnaTokenDistribution_3.addValidator(0x50000) from: 0x0000000000000000000000000000000000010000 Time delay: 448552 seconds Block delay: 4770
    EchidnaTokenDistribution_3.approve() from: 0x0000000000000000000000000000000000010000 Time delay: 463588 seconds Block delay: 8447
    EchidnaTokenDistribution_3.approve() from: 0x0000000000000000000000000000000000050000 Time delay: 19029 seconds Block delay: 1
    EchidnaTokenDistribution_3.approve() from: 0x0000000000000000000000000000000000060000 Time delay: 322308 seconds Block delay: 34
    EchidnaTokenDistribution_3.numberOfValidatorsLTEthreshold() from: 0x0000000000000000000000000000000000040000 Time delay: 4177 seconds Block delay: 58783
```

Comment:

With that call sequence, Echidna was able to approve the request with three validators and when Echidna called the assertion method, the number of approvals in the current request (3) was greater than the validators threshold (2).