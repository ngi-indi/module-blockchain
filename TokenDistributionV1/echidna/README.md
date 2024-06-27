# 🦔 TokenDistribution V1 Echidna

## 📕 Table of Contents

<details open>
<summary></summary>

- [💾 Commands](#-commands)
- [🟰 Properties](#-properties)
- [📝 Contracts](#-contracts)
    - [🦔 echidnaRequestAmount](#-echidnarequestamount)
    - [🦔 echidnaRequestTimeout](#-echidnarequesttimeout)
    - [🦔 echidnaValidatorsThreshold](#-echidnavalidatorsthreshold)
</details>

## 💾 Commands

All the following commands must be executed at the [root](../) of the project.

- ```npm run test:echidna``` -> Verifies all the properties with the real contract implementation on the host machine.

- ```npm run docker:test:echidna``` -> Verifies all the properties with the real contract implementation on a Docker container.

## 🟰 Properties 

<!-- 
- **echidnaAddresses**: the hooking of the contract is correctly performed hence Echidna has the correct addresses.
-->

- **echidnaRequestAmount**: when a withdrawal request is accepted, the contract should always have the token balance to satisfy it.

- **echidnaRequestTimeout**: request status is not updated when a new request attempt is performed if the timeout has not yet been reached.

- **echidnaValidatorsThreshold**: the number of approvals in a withdrawal request is never greater than the validators threshold.

## 📝 Contracts

Each property has its own folder containing itself with a modified version of the TokenDistribution contract to fail the assertion property.

### 🦔 echidnaRequestAmount

💾 Execute:

```bash
solc-select use 0.8.25 && echidna --contract EchidnaRequestAmount echidna/echidnaRequestAmount/EchidnaRequestAmount.sol --config echidna/echidna.config.yaml
```

📄 Original TokenDistribution contract:

```solidity
require(token.balanceOf(address(this)) >= _amount, "Contract has not enough tokens to cover this request!");
```

🐛 Modified contract:

```solidity
This line has been removed!
```

🖨️ Output:

```
assertion in echidnaRequestAmount(uint256): FAILED! with ErrorRevert

Call sequence:
1. EchidnaRequestAmount.echidnaRequestAmount(62497009088297594416563199010816601639684591629213015536425786504559825832396)
```

🗣️ Comment: 

Echidna called its own echidnaRequestAmount() method requesting a large value to withdraw; the request has been approved because the original contract's check is missing and the value of the current request is hence greater than the contract tokens balance which is zero  (obviously this would also have failed even with a smaller value).

### 🦔 echidnaRequestTimeout

💾 Execute:

```bash
solc-select use 0.8.25 && echidna --contract EchidnaRequestTimeout echidna/echidnaRequestTimeout/EchidnaRequestTimeout.sol --config echidna/echidna.config.yaml
```

📄 Original TokenDistribution contract:

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

🐛 Modified contract:

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

🖨️ Output:

```
assertion in echidnaRequestTimeout(uint256): FAILED! with ErrorRevert

Call sequence:
1. EchidnaRequestTimeout.request(147) Time delay: 24867 seconds Block delay: 3661
2. EchidnaRequestTimeout.echidnaRequestTimeout(1) Time delay: 255 seconds Block delay: 18
```

🗣️ Comment:

Echidna performed a request and after 18 blocks (hence when the request was not expireed yet), performed a newer one that modified the request status. This mean a bad request has been accepted by the modified contract. 

### 🦔 echidnaValidatorsThreshold

💾 Execute:

```
solc-select use 0.8.25 && echidna --contract EchidnaValidatorsThreshold echidna/echidnaValidatorsThreshold/EchidnaValidatorsThreshold.sol --config echidna/echidna.config.yaml
```

📄 Original TokenDistribution contract:

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

🐛 Modified contract:

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

🦔 Original Echidna contract:

```solidity
uint constant VALIDATORS_THRESHOLD = 3;
uint constant TIMEOUT = 110;
```

🦔✏️ Modified Echidna contract:

```solidity
// Less validators and more timeout to reduce Echidna's search space
uint constant VALIDATORS_THRESHOLD = 2;
uint constant TIMEOUT = 1000;
```

🖨️ Output:

```
assertion in echidnaValidatorsThreshold(): FAILED! with ErrorRevert

Call sequence:
1. EchidnaValidatorsThreshold.addValidator(0x60000) from: 0x0000000000000000000000000000000000010000 Time delay: 482712 seconds Block delay: 33357
2. EchidnaValidatorsThreshold.addValidator(0x50000) from: 0x0000000000000000000000000000000000010000 Time delay: 274922 seconds Block delay: 27404
3. EchidnaValidatorsThreshold.addValidator(0x10000) from: 0x0000000000000000000000000000000000010000 Time delay: 206186 seconds Block delay: 45504
4. EchidnaValidatorsThreshold.request(67) from: 0x0000000000000000000000000000000000020000 Time delay: 400981 seconds Block delay: 15369
5. EchidnaValidatorsThreshold.approve() from: 0x0000000000000000000000000000000000010000 Time delay: 376096 seconds Block delay: 2511
6. EchidnaValidatorsThreshold.approve() from: 0x0000000000000000000000000000000000050000 Time delay: 254 seconds Block delay: 256
7. EchidnaValidatorsThreshold.approve() from: 0x0000000000000000000000000000000000060000 Time delay: 31594 seconds Block delay: 561
8. EchidnaValidatorsThreshold.echidnaValidatorsThreshold() from: 0x0000000000000000000000000000000000020000 Time delay: 316801 seconds Block delay: 32331
```

🗣️ Comment:

With that call sequence, Echidna was able to approve the request with three validators and when Echidna called the assertion method, the number of approvals in the current request (3) was greater than the validators threshold (2).