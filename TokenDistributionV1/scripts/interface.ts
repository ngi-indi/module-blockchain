// Ignore TypeScript warnings:
// @ts-nocheck

// ---------------------------------------------------------
// Import and constants
// ---------------------------------------------------------

import { ethers } from "hardhat";
import * as fs from 'fs';

// ---------------------------------------------------------


// ---------------------------------------------------------
// Indi Token interface
// ---------------------------------------------------------

export class IIndiToken {
    // ---------------------------------------------------------
    // Attributes
    // ---------------------------------------------------------
    
    _indiToken: Object; // Contract istance
    contractAddress: string;

    // ---------------------------------------------------------


    // ---------------------------------------------------------
    // Status methods
    // ---------------------------------------------------------

    constructor(contractAddress: string) {
        this.contractAddress = contractAddress;
    }

    async setup() {
        // This cannot be performed in the constructor, since it's async
        this._indiToken = await (await ethers.getContractFactory("IndiToken")).attach(this.contractAddress);
    }

    // ---------------------------------------------------------


    // ---------------------------------------------------------
    // Getters
    // ---------------------------------------------------------

    async getBalanceOf(address) {
        return (await this._indiToken.balanceOf(address));
    }

    // ---------------------------------------------------------


    // ---------------------------------------------------------
    // Actions
    // ---------------------------------------------------------

    /** @returns Tx hash */
    async mint(amount) {
        return (await this._indiToken.mint(amount)).hash;
    }

    /** @returns Tx hash */
    async approve(spender, amount): string {
        return (await this._indiToken.approve(spender, amount)).hash;
    }

    // ---------------------------------------------------------

}

// ---------------------------------------------------------


// ---------------------------------------------------------
// Token Distribution interface
// ---------------------------------------------------------

export class ITokenDistribution {
    // ---------------------------------------------------------
    // Attributes
    // ---------------------------------------------------------
    
    // Contract instance
    _tokenDistribution: Object;

    // On-chain status (constants)
    timeout: BigInt;
    validatorsThreshold: BigInt;

    // Off-chain status
    deploymentFilePath: string;
    deploymentJSON: Object;
    contractAddress: string;

    // ---------------------------------------------------------


    // ---------------------------------------------------------
    // Status methods
    // ---------------------------------------------------------

    constructor(deploymentFilePath: string) {
        this.deploymentFilePath = deploymentFilePath;

        const data = fs.readFileSync(this.deploymentFilePath, 'utf-8');
        this.deploymentJSON = JSON.parse(data);

        this.contractAddress = this.deploymentJSON.contractAddress;
        this.timeout = this.deploymentJSON.timeout;
        this.validatorsThreshold = this.deploymentJSON.validatorsThreshold;
    }

    async setup(address) {
        // Contract address
        this._tokenDistribution = await (await ethers.getContractFactory("TokenDistribution")).attach(this.contractAddress);

        // User address
        this._tokenDistribution = this._tokenDistribution.connect(address);
    }

    // ---------------------------------------------------------

    
    // ---------------------------------------------------------
    // Getters    
    // ---------------------------------------------------------

    async getOwner() {
        return (await this._tokenDistribution.owner());
    }

    async getRecipient() {
        return (await this._tokenDistribution.recipient());
    }

    async getTimeout() {
        return (await this._tokenDistribution.timeout());
    }

    async getValidatorsThreshold() {
        return (await this._tokenDistribution.validatorsThreshold());
    }

    async getManagedTokenAddress() {
        return (await this._tokenDistribution.token());
    }

    async getNumberOfValidatorsInCurrentRequest() {
        return (await this._tokenDistribution.getNumberOfValidatorsInCurrentRequest());
    }

    async getBlockNumberInCurrentRequest() {
        return (await this._tokenDistribution.getBlockNumberInCurrentRequest());
    }

    async isValidator(validator) {
        return (await this._tokenDistribution.validators(validator));
    }

    // ---------------------------------------------------------


    // ---------------------------------------------------------
    // Actions
    // ---------------------------------------------------------

    /** @returns Tx hash */
    async deposit(amount): string {
        return (await(this._tokenDistribution.deposit(amount))).hash;
    }

    /** @returns Tx hash */
    async addValidator(validator): string {
        return (await(this._tokenDistribution.addValidator(validator))).hash;
    }

    /** @returns Tx hash */
    async removeValidator(validator): string {
        return (await(this._tokenDistribution.removeValidator(validator))).hash;
    }

    /** @returns Tx hash */
    async request(amount): string {
        return (await(this._tokenDistribution.request(amount))).hash;
    }

    /** @returns Tx hash */
    async approve(): string {
        return (await(this._tokenDistribution.approve())).hash;
    }

    /** @returns Tx hash */
    async withdraw(): string {
        return (await(this._tokenDistribution.withdraw())).hash;
    }

    // ---------------------------------------------------------

}

// ---------------------------------------------------------
