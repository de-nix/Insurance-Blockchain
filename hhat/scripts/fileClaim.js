"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    const [deployer, insurer, insured] = await hardhat_1.ethers.getSigners();
    // Import and run the deploy script to get the deployed contract instance
    const deployScript = require("./deploy");
    const insurancePolicy = await deployScript.main();
    // Connect to the contract with the insured signer
    const insurancePolicyWithInsured = insurancePolicy.connect(insured);
    // Call the fileClaim function
    const fileClaimTx = await insurancePolicyWithInsured.fileClaim();
    // Wait for the transaction to be mined
    await fileClaimTx.wait();
    // Check if the policy is active
    const isActive = await insurancePolicy.isActive();
    console.log("Policy is active:", isActive);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
