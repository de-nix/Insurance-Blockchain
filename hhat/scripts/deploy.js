"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = __importDefault(require("hardhat"));
async function main() {
    const [deployer] = await hardhat_1.default.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    const InsurancePolicy = await hardhat_1.default.ethers.getContractFactory("InsurancePolicy");
    const insurancePolicy = await InsurancePolicy.deploy();
    await insurancePolicy.deployed();
    console.log("InsurancePolicy deployed to:", insurancePolicy.address);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
