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

const ADDR_ZERO = '0x0000000000000000000000000000000000000000'

// --------------------------------------------------------------------------


// --------------------------------------------------------------------------
// OntologyToken.sol tests
// --------------------------------------------------------------------------

describe("OntologyToken", function() {
    async function deployOntologyTokenFixture() {
        const [owner] = await hre.ethers.getSigners();

        const OntologyTokenFactory = await hre.ethers.getContractFactory("OntologyToken");
        const ontologyToken = await OntologyTokenFactory.deploy();

        return {ontologyToken, owner};
    }

    describe("Deployment", function() {
        it("Should have the correct owner", async function () {
            const {ontologyToken, owner} = await loadFixture(deployOntologyTokenFixture);

            expect(await ontologyToken.owner()).to.equal(owner.address);
        });
    });

    describe("Minting", function() {
        const amount = 10000;
        it(`Should mint ${amount} tokens and give them to the owner`, async function(){
            const {ontologyToken, owner} = await loadFixture(deployOntologyTokenFixture);
        
            // Perform the minting action
            await ontologyToken.mint(amount)
            const ownerBalance = await ontologyToken.balanceOf(owner.address);
    
            expect(await ontologyToken.totalSupply()).to.equal(ownerBalance);
            expect(await ontologyToken.balanceOf(owner.address)).to.equal(ownerBalance);
        });
    });    
});

// --------------------------------------------------------------------------


// --------------------------------------------------------------------------
// TokenDistribution.sol tests
// --------------------------------------------------------------------------

describe("TokenDistribution", function() {
    async function getParticipantsFixture() {
        const [owner, recipient, val_0, val_1, val_2, val_3, val_4] = await hre.ethers.getSigners();
        const validators = [val_0, val_1, val_2, val_3, val_4]; // validators as part of an array

        return {owner, recipient, validators};
    }

    const REQUEST_AMOUNT = 0;
    const REQUEST_BLOCKNUMBER = 1;
    // const REQUEST_APPROVALVALIDATORS = 2;

    let owner, recipient;
    let validators;

    // Participants are loaded once
    before(async function() {
        ({owner, recipient, validators} = await loadFixture(getParticipantsFixture));
    });
    
    const TIMEOUT = 200; // blocks
    const VALIDATORS_THRESHOLD = 3;

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

    let ontologyToken, tokenDistribution;

    // Deploy the contract once
    before(async function() {
        ({tokenDistribution, ontologyToken} = await loadFixture(deployTokenDistributionFixture));
    });
    
    describe("Deployment", function() {
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
    });

    describe("Validators management", function() {
        it(`Should correctly add the validators`, async function() {
            for (const val of validators) {
                // Before the action, the address should not belong to the validators mapping
                expect(await tokenDistribution.validators(val.address)).false;
                
                await tokenDistribution.addValidator(val.address);
                expect(await tokenDistribution.validators(val.address)).true;
            }
        });
        
        it("Should correctly remove a validator", async function() {
            const validatorToBeRemoved = validators[validators.length-1] // the last validator in the array

            // Before the action, the address must appear in the validators mapping
            expect(await tokenDistribution.validators(validatorToBeRemoved.address)).true;

            await tokenDistribution.removeValidator(validatorToBeRemoved.address);
            expect(await tokenDistribution.validators(validatorToBeRemoved.address)).false;
        });
    });

    const DEPOSIT_AMOUNT = 10000;
    
    describe("Deposit", function() {
        before(async function() {
            // Owner mints a quantity of tokens (tested before)
            await ontologyToken.mint(DEPOSIT_AMOUNT);
            expect(await ontologyToken.balanceOf(owner.address)).to.equal(DEPOSIT_AMOUNT);

            // Before transfering ERC20 tokens, owner must call the ERC20 approve 
            await ontologyToken.approve(tokenDistribution.target, DEPOSIT_AMOUNT);
        });

        it(`Should deposit ${DEPOSIT_AMOUNT} tokens`, async function() {
            await tokenDistribution.deposit(DEPOSIT_AMOUNT);
            expect(await ontologyToken.balanceOf(tokenDistribution.target)).to.equal(DEPOSIT_AMOUNT);
        });
    });

    const WITHDRAWAL_AMOUNT = 8000;

    describe("Request", function() {
        const invalidAmount = 100000000000;
        it(`Should not accept a withdrawal request with number of tokens greater than the contract's balance`, async function() {
            // Different syntax from the other calls! (source: https://ethereum-waffle.readthedocs.io/en/latest/matchers.html#revert-with-message)
            await expect(tokenDistribution.connect(recipient).request(invalidAmount)).to.be.reverted;
        });
        
        it(`Should accept a ${WITHDRAWAL_AMOUNT} tokens withdrawal request`, async function() {
            await tokenDistribution.connect(recipient).request(WITHDRAWAL_AMOUNT);
            expect((await tokenDistribution.currentRequest())[REQUEST_AMOUNT]).to.equal(WITHDRAWAL_AMOUNT);
            expect((await tokenDistribution.currentRequest())[REQUEST_BLOCKNUMBER]).to.equal((await ethers.provider.getBlock("latest")).number);
        });

        it(`Should not accept a new request when there is one already active`, async function() {
            await expect(tokenDistribution.connect(recipient).request(WITHDRAWAL_AMOUNT)).to.be.reverted;
        });
    });

    describe("Approve", function() {
        it('Should not accept a vote from an address not in the validators map', async function() {
            const noLongerAValidator = validators.pop(); // Removes the participant from the array too (this partecipant had be removed from the contract's validators list before)
            await expect(tokenDistribution.connect(noLongerAValidator).approve()).to.be.reverted;
        });

        it('Should let validators approve the request correctly', async function() {
            for(let i=0; i<VALIDATORS_THRESHOLD; i++) {
                await tokenDistribution.connect(validators[i]).approve();
                // The number of validators in the current request should have increased by 1
                expect(await tokenDistribution.getNumberOfValidatorsInCurrentRequest()).to.equal(i+1);

                // The current validator must be set correctly
                expect((await tokenDistribution.getApprovalValidatorsInCurrentRequest())[i]).to.equal(validators[i].address);
            }
        });

        it('Should not let a validator vote twice', async function() {
            await expect(tokenDistribution.connect(validators[0]).approve()).to.be.reverted;
        });
    
        it('Should not accept more votes', async function() {
            const anotherValidator = validators.pop(); // Removes the participant from the array too
            await expect(tokenDistribution.connect(anotherValidator).approve()).to.be.reverted;
        });
    });

    describe("Withdraw", function() {
        it('Should let the recipient withdraw', async function() {
            await tokenDistribution.connect(recipient).withdraw();
        });

        it('Should transfer the correct amount to the recipient', async function() {
            expect(await ontologyToken.balanceOf(recipient.address)).to.equal(WITHDRAWAL_AMOUNT);
        });

        it(`Should have ${DEPOSIT_AMOUNT - WITHDRAWAL_AMOUNT} tokens left in its balance`, async function() {
            expect(await ontologyToken.balanceOf(tokenDistribution.target)).to.equal(DEPOSIT_AMOUNT - WITHDRAWAL_AMOUNT);
        });

        it(`Should reset the request's status`, async function() {
            expect((await tokenDistribution.currentRequest())[REQUEST_AMOUNT]).to.equal(0);
            expect((await tokenDistribution.currentRequest())[REQUEST_BLOCKNUMBER]).to.equal(0);
            
            // The approval validators array should contain only empty addresses
            for (let i=0; i<VALIDATORS_THRESHOLD; i++) {
                expect((await tokenDistribution.getApprovalValidatorsInCurrentRequest())[i]).to.equal(ADDR_ZERO);
            }
        });
    });

    describe("Timeout", function() {
        it('Should not let create a new request until the timeout has expired', async function () {

            // Perform a withdrawal request (with half of the contract's balance)
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
    });
});



// --------------------------------------------------------------------------