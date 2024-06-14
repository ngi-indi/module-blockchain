// Ignore TypeScript warnings:
// @ts-nocheck

// --------------------------------------------------------------------------
// Libraries and constants
// --------------------------------------------------------------------------

import {
    mine,
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { expect } from "chai"; // Provides more assertions than Mocha
import { ethers } from "hardhat";
import { token } from "../typechain-types/@openzeppelin/contracts";

const ADDR_ZERO = '0x0000000000000000000000000000000000000000'

// --------------------------------------------------------------------------


// --------------------------------------------------------------------------
// OntologyToken.sol tests
// --------------------------------------------------------------------------

describe("OntologyToken", function() {
    // --------------------------------------------------------------------------
    // Fixtures
    // --------------------------------------------------------------------------

    async function deployOntologyTokenFixture() {
        const [owner] = await hre.ethers.getSigners();

        const OntologyTokenFactory = await hre.ethers.getContractFactory("OntologyToken");
        const ontologyToken = await OntologyTokenFactory.deploy();

        return {ontologyToken, owner};
    }

    // --------------------------------------------------------------------------


    // --------------------------------------------------------------------------
    // Suite functions
    // --------------------------------------------------------------------------

    function suiteDeployment() {
        return function() {
            it("Should have the correct owner", async function () {
                const {ontologyToken, owner} = await loadFixture(deployOntologyTokenFixture);
    
                expect(await ontologyToken.owner()).to.equal(owner.address);
            });
        };
    }

    function suiteMinting(amount: BigInt) {
        return function() {
            it(`Should mint ${amount} tokens and give them to the owner`, async function(){
                const {ontologyToken, owner} = await loadFixture(deployOntologyTokenFixture);
            
                // Perform the minting action
                await ontologyToken.mint(amount)
                const ownerBalance = await ontologyToken.balanceOf(owner.address);
        
                expect(await ontologyToken.totalSupply()).to.equal(ownerBalance);
                expect(await ontologyToken.balanceOf(owner.address)).to.equal(ownerBalance);
            });
        };
    }

    // --------------------------------------------------------------------------


    // --------------------------------------------------------------------------
    // Test suites
    // --------------------------------------------------------------------------

    const MINTING_AMOUNT = 10000;

    describe("Deployment", suiteDeployment());
    describe("Minting", suiteMinting(MINTING_AMOUNT));   

    // --------------------------------------------------------------------------

});

// --------------------------------------------------------------------------


// --------------------------------------------------------------------------
// TokenDistribution.sol tests
// --------------------------------------------------------------------------

describe("TokenDistribution", function() {
    // --------------------------------------------------------------------------
    // Contract constants and fixtures
    // --------------------------------------------------------------------------

    const REQUEST_AMOUNT = 0;
    const REQUEST_BLOCKNUMBER = 1;
    // const REQUEST_APPROVALVALIDATORS = 2;

    async function getParticipantsFixture() {
        const [owner, recipient, val_0, val_1, val_2, val_3, val_4, val_5, val_6, val_7, val_8] = await hre.ethers.getSigners();
        const validatorsSets = {
            a: [val_0, val_1, val_2],
            b: [val_3, val_4, val_5],
            c: [val_6, val_7, val_8]
         };

        return {owner, recipient, validatorsSets};
    }

    async function deployTokenDistributionFixture() {        
        // Deploy the ERC20 OntologyToken contract first
        // Contracts are deployed using the first signer/account by default (source: https://hardhat.org/hardhat-runner/docs/getting-started#testing-your-contracts)
        const ontologyTokenFactory = await hre.ethers.getContractFactory("OntologyToken");
        const ontologyToken = await ontologyTokenFactory.deploy(); 
        
        const ontologyTokenAddress = ontologyToken.target;
        const recipientAddress = recipient.address;

        // Deploy the TokenDistribution contract
        const tokenDistributionFactory = await hre.ethers.getContractFactory("TokenDistribution");
        const tokenDistribution = await tokenDistributionFactory.deploy(ontologyTokenAddress, recipientAddress, VALIDATORS_THRESHOLD, TIMEOUT);
        
        return {tokenDistribution, ontologyToken};
    }

    // --------------------------------------------------------------------------

    
    // --------------------------------------------------------------------------
    // Suite functions
    // --------------------------------------------------------------------------

    function caseDeployment() {
        return function() {
            it("Should set the correct owner address", async function() {
                expect(await tokenDistribution.owner()).to.equal(owner.address);
            });
    
            it("Should set the correct recipient address", async function() {
                expect(await tokenDistribution.recipient()).to.equal(recipient.address);
            });
    
            it("Should set the OntologyToken contract address", async function() {
                expect(await tokenDistribution.token()).to.equal(ontologyToken.target);
            });
    
            it(`Should set ${TIMEOUT} blocks as timeout`, async function() {
                expect(await tokenDistribution.timeout()).to.equal(TIMEOUT);
            });
    
            it(`Should set ${VALIDATORS_THRESHOLD} as validators threshold`, async function() {
                expect(await tokenDistribution.validatorsThreshold()).to.equal(VALIDATORS_THRESHOLD);
            });
    
            it("Should contain an empty request", async function() {
                expect((await tokenDistribution.currentRequest())[REQUEST_AMOUNT]).to.equal(0n);
                expect((await tokenDistribution.currentRequest())[REQUEST_BLOCKNUMBER]).to.equal(0n);
    
                // The approval validators array should contain only empty addresses
                for (let i=0; i<VALIDATORS_THRESHOLD; i++) {
                    expect((await tokenDistribution.getApprovalValidatorsInCurrentRequest())[i]).to.equal(ADDR_ZERO);
                }
            });
        };
    }

    function caseValidatorsManagement() {
        return function() {
            it(`Should correctly add the validators`, async function() {
                const allValidators = Object.values(validatorsSets).flat(); // flattens the array of arrays into a single one

                for (const val of allValidators) {
                    // Before the action, the address should not belong to the validators mapping
                    expect(await tokenDistribution.validators(val.address)).false;
                    
                    await tokenDistribution.addValidator(val.address);
                    expect(await tokenDistribution.validators(val.address)).true;
                }
            });
            
            it("Should correctly remove validators", async function() {
                const keys = Object.keys(validatorsSets);
                const lastKey = keys[keys.length - 1];

                // Remove all the validators in the last set
                for (const val of validatorsSets[lastKey]) {
                    // Before the action, the address must appear in the validators mapping
                    expect(await tokenDistribution.validators(val.address)).true;
                    
                    await tokenDistribution.removeValidator(val.address);
                    expect(await tokenDistribution.validators(val.address)).false;
                }                
            });
        };
    }

    function caseDeposit(amount: BigInt) {
        return function() {
            before(async function() {
                // Owner mints a quantity of tokens (tested before)
                await ontologyToken.mint(amount);
                expect(await ontologyToken.balanceOf(owner.address)).to.equal(amount);
    
                // Before transfering ERC20 tokens, owner must call the ERC20 approve 
                await ontologyToken.approve(tokenDistribution.target, amount);
            });
    
            it(`Should deposit ${amount} tokens`, async function() {
                await tokenDistribution.deposit(amount);
                expect(await ontologyToken.balanceOf(tokenDistribution.target)).to.equal(amount);
            });
        };
    }

    function caseRequest(amount: BigInt) {
        return function() {
            it(`Should not accept a withdrawal request with number of tokens greater than the contract's balance`, async function() {
            // An invalid amount is the number of tokens own by the contract + 1
            const invalidAmount = await ontologyToken.balanceOf(tokenDistribution.target) + 1n;
                
                // Different syntax from the other calls! (source: https://ethereum-waffle.readthedocs.io/en/latest/matchers.html#revert-with-message)
                await expect(tokenDistribution.connect(recipient).request(invalidAmount)).to.be.reverted;
            });
            
            it(`Should accept a ${amount} tokens withdrawal request`, async function() {
                await tokenDistribution.connect(recipient).request(amount);
                expect((await tokenDistribution.currentRequest())[REQUEST_AMOUNT]).to.equal(amount);
                expect((await tokenDistribution.currentRequest())[REQUEST_BLOCKNUMBER]).to.equal((await ethers.provider.getBlock("latest")).number);
            });
    
            it(`Should not accept a new request when there is one already active`, async function() {
                await expect(tokenDistribution.connect(recipient).request(amount)).to.be.reverted;
            });
        };
    }

    function caseApprove(approvalsSetKey) {    
        return function() {
            it('Should not accept a vote from addresses not in the validators map', async function() {
                const allSetsKeys = Object.keys(validatorsSets);
                // The last set had been removed from the contract's validators map during the Validators management tests
                const removedValidatorsSetKey = allSetsKeys[allSetsKeys.length - 1]; 

                for (const val of validatorsSets[removedValidatorsSetKey]) {
                    await expect(tokenDistribution.connect(val).approve()).to.be.reverted;
                }
            });

            it('Should let validators approve the request correctly', async function() {
                let i=0; // this index iterates the validators array **in the contract**
                for(const val of validatorsSets[approvalsSetKey]) {
                    await tokenDistribution.connect(val).approve();
                    // The number of validators in the current request should have increased by 1
                    expect(await tokenDistribution.getNumberOfValidatorsInCurrentRequest()).to.equal(i+1);
    
                    // The current validator must be set correctly
                    expect((await tokenDistribution.getApprovalValidatorsInCurrentRequest())[i]).to.equal(val.address);
                    i++;
                }
            });
    
            it('Should not let validators vote twice', async function() {
                for(const val of validatorsSets[approvalsSetKey]) {
                    await expect(tokenDistribution.connect(val).approve()).to.be.reverted;
                }
            });
        
            it('Should not accept more votes', async function() {
                const allSetsKeys = Object.keys(validatorsSets);
                // All the sets of validators that are not the current request approvals and the last one (since these are not longer validators at this step)
                const otherValidatorsSetsKeys = allSetsKeys.filter(key => (key != approvalsSetKey && key != allSetsKeys[allSetsKeys.length - 1]));
                
                let otherValidators = []; 
                for(const key of otherValidatorsSetsKeys) {otherValidators = otherValidators.concat(validatorsSets[key]);}

                for(const val of otherValidators) {
                    await expect(tokenDistribution.connect(val).approve()).to.be.reverted;
                }
            });
        };
    }

    function caseWithdraw(amount: BigInt) {
        return function() {
            let contractBalanceBeforeWithdraw: BigInt;

            before(async function() {
                contractBalanceBeforeWithdraw = await ontologyToken.balanceOf(tokenDistribution.target);
            });
             
            it('Should let the recipient withdraw', async function() {
                await tokenDistribution.connect(recipient).withdraw();
            });
    
            it('Should transfer the correct amount to the recipient', async function() {
                expect(await ontologyToken.balanceOf(recipient.address)).to.equal(amount);
            });

            let expectedAmountInContract: BigInt;

            before(async function() {
                expectedAmountInContract = contractBalanceBeforeWithdraw - amount;
            });
    
            it(`Should have ${expectedAmountInContract} tokens left in its balance`, async function() {
                expect(await ontologyToken.balanceOf(tokenDistribution.target)).to.equal(expectedAmountInContract);
            });
    
            it(`Should reset the request's status`, async function() {
                expect((await tokenDistribution.currentRequest())[REQUEST_AMOUNT]).to.equal(0);
                expect((await tokenDistribution.currentRequest())[REQUEST_BLOCKNUMBER]).to.equal(0);
                
                // The approval validators array should contain only empty addresses
                for (let i=0; i<VALIDATORS_THRESHOLD; i++) {
                    expect((await tokenDistribution.getApprovalValidatorsInCurrentRequest())[i]).to.equal(ADDR_ZERO);
                }
            });
        };
    }

    function caseTimeout() {
        return function() {
            it('Should not let create a new request until the timeout has expired', async function () {
    
                // Perform a withdrawal request
                await tokenDistribution.connect(recipient).request(1)
                expect((await tokenDistribution.currentRequest())[REQUEST_BLOCKNUMBER]).to.equal((await ethers.provider.getBlock("latest")).number);
    
                // We expect to not accept requests until the timeout
                await expect(tokenDistribution.connect(recipient).request(1)).to.be.reverted;
    
                // Instantly mine blocks
                await mine(TIMEOUT);
    
                // After the timeout has expired, the recipient is expected to perform the request
                await tokenDistribution.connect(recipient).request(1)
                expect((await tokenDistribution.currentRequest())[REQUEST_BLOCKNUMBER]).to.equal((await ethers.provider.getBlock("latest")).number);
            });
        };
    }
    // --------------------------------------------------------------------------


    // --------------------------------------------------------------------------
    // Test suites
    // --------------------------------------------------------------------------

    const TIMEOUT = 200; // blocks
    const VALIDATORS_THRESHOLD = 3;

    let owner, recipient;
    let validatorsSets;
    
    let ontologyToken, tokenDistribution;
    
    before(async function() {
        // Participants are loaded once
        ({owner, recipient, validatorsSets} = await loadFixture(getParticipantsFixture));

        // Deploy the contract once
        ({tokenDistribution, ontologyToken} = await loadFixture(deployTokenDistributionFixture));
    });

    const DEPOSIT_1_AMOUNT = 10000n;
    const WITHDRAWAL_1_AMOUNT = 8000n;
    const WITHDRAWAL_2_AMOUNT = DEPOSIT_1_AMOUNT - WITHDRAWAL_1_AMOUNT;
    
    describe("Deployment", caseDeployment(TIMEOUT, VALIDATORS_THRESHOLD));
    describe("Validators management", caseValidatorsManagement());  
    describe("Deposit", caseDeposit(DEPOSIT_1_AMOUNT));
    describe("Request", caseRequest(WITHDRAWAL_1_AMOUNT));
    describe("Approve", caseApprove('a'));
    describe("Withdraw", caseWithdraw(WITHDRAWAL_1_AMOUNT));
    describe("Timeout", caseTimeout());

    // TODO: another request

    // --------------------------------------------------------------------------

});

// --------------------------------------------------------------------------