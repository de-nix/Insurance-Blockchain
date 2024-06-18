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
    // Call the payPremium function with the required premium amount
    const premium = hardhat_1.ethers.utils.parseEther("0.001");
    const payPremiumTx = await insurancePolicyWithInsured.payPremium({ value: premium });
    // Wait for the transaction to be mined
    await payPremiumTx.wait();
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
