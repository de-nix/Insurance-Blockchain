"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const chai_1 = require("chai");
describe("InsurancePolicy", function () {
    let InsurancePolicyContract;
    let insurancePolicy;
    let owner;
    let insured;
    let insurer;
    let otherAccount;
    beforeEach(async function () {
        InsurancePolicyContract = await hardhat_1.ethers.getContractFactory("InsurancePolicy");
        insurancePolicy = await InsurancePolicyContract.deploy();
        await insurancePolicy.deployed();
        const [owner2, insured2, insurer2, otherAccount2] = await hardhat_1.ethers.getSigners();
        owner = owner2;
        insured = insured2;
        insurer = insurer2;
        otherAccount = otherAccount2;
    });
    describe("acceptPolicy", function () {
        it("Should accept the policy and transfer the premium to the insurer", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("0.5");
            const premium = hardhat_1.ethers.utils.parseEther("0.01");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            const policyDetails2 = await insurancePolicy.getPolicy(0);
            console.log(policyDetails2[6]);
            const tx = await insurancePolicy.connect(insured).acceptPolicy(0, { value: premium });
            await (0, chai_1.expect)(tx)
                .to.emit(insurancePolicy, "PolicyAccepted")
                .withArgs(0);
            await (0, chai_1.expect)(tx)
                .to.changeEtherBalance(insured, premium.mul(-1))
                .and.changeEtherBalance(insurer, premium);
            const policyDetails = await insurancePolicy.getPolicy(0);
            (0, chai_1.expect)(policyDetails[7]).to.equal(true);
            console.log(policyDetails[6]);
        });
        it("Should revert if called by a non-insured account", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("0.5");
            const premium = hardhat_1.ethers.utils.parseEther("0.01");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            await (0, chai_1.expect)(insurancePolicy.connect(insurer).acceptPolicy(0, { value: premium })).to.be.revertedWith("Only the insured can accept the policy.");
        });
        it("Should revert if the incorrect premium amount is sent", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("0.5");
            const premium = hardhat_1.ethers.utils.parseEther("0.01");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            await (0, chai_1.expect)(insurancePolicy.connect(insured).acceptPolicy(0, { value: premium.mul(2) })).to.be.revertedWith("Incorrect premium amount.");
        });
    });
    // Rest of the tests...
    describe("denyPolicy", function () {
        it("Should deny the policy and set isActive to false", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("0.5");
            const premium = hardhat_1.ethers.utils.parseEther("0.01");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            await (0, chai_1.expect)(insurancePolicy.connect(insured).denyPolicy(0)).to.not.be.reverted;
            const policyDetails = await insurancePolicy.getPolicy(0);
            (0, chai_1.expect)(policyDetails[7]).to.equal(false);
        });
        it("Should revert if the policy is already active", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("0.5");
            const premium = hardhat_1.ethers.utils.parseEther("0.01");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            await insurancePolicy.connect(insured).acceptPolicy(0, { value: premium });
            await (0, chai_1.expect)(insurancePolicy.connect(insured).denyPolicy(0)).to.be.revertedWith("Policy is already active.");
        });
        it("Should revert if called by a non-insured account", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("0.5");
            const premium = hardhat_1.ethers.utils.parseEther("0.01");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            await (0, chai_1.expect)(insurancePolicy.connect(otherAccount).denyPolicy(0)).to.be.revertedWith("Only the insured can deny a policy.");
        });
    });
    describe("fileClaim", function () {
        it("Should file a claim successfully", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("1");
            const premium = hardhat_1.ethers.utils.parseEther("0.1");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            const description = "Test claim";
            const amount = hardhat_1.ethers.utils.parseEther("0.5");
            const tx = await insurancePolicy.connect(insured).acceptPolicy(0, { value: premium });
            await tx.wait();
            await new Promise((resolve) => setTimeout(resolve, 2000));
            await (0, chai_1.expect)(insurancePolicy.connect(insured).fileClaim(0, description, amount)).to.not.be.reverted;
            const claimIds = await insurancePolicy.getAllClaimsForPolicy(0);
            (0, chai_1.expect)(claimIds.length).to.equal(1);
        });
    });
    describe("acceptAndPayClaim", function () {
        it("Should accept and pay the claim if conditions are met", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("1");
            const premium = hardhat_1.ethers.utils.parseEther("0.1");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            const tx2 = await insurancePolicy.connect(insured).acceptPolicy(0, { value: premium });
            await tx2.wait();
            const description = "Test claim";
            const amount = hardhat_1.ethers.utils.parseEther("0.5");
            const tx3 = await insurancePolicy.connect(insured).fileClaim(0, description, amount);
            await tx3.wait();
            const claim = await insurancePolicy.getClaimDetails(0, 0);
            console.log(claim);
            const claim2 = await insurancePolicy.getPolicy(0);
            console.log(claim2);
            console.log(await insurer.getBalance());
            const acceptAndPayClaimTx = await insurancePolicy.connect(insurer).acceptAndPayClaim(0, 0, { value: amount });
            await acceptAndPayClaimTx.wait();
        });
        it("Should revert if called by a non-insurer account", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("1");
            const premium = hardhat_1.ethers.utils.parseEther("0.1");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            const tx2 = await insurancePolicy.connect(insured).acceptPolicy(0, { value: premium });
            await tx2.wait();
            const description = "Test claim";
            const amount = hardhat_1.ethers.utils.parseEther("0.5");
            const tx3 = await insurancePolicy.connect(insured).fileClaim(0, description, amount);
            await tx3.wait();
            await (0, chai_1.expect)(insurancePolicy.connect(otherAccount).acceptAndPayClaim(0, 0)).to.be.revertedWith("Only the insurer can accept a claim.");
        });
        it("Should revert if the coverage amount is not enough to accept the claim", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("0.5");
            const premium = hardhat_1.ethers.utils.parseEther("0.1");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            const tx2 = await insurancePolicy.connect(insured).acceptPolicy(0, { value: premium });
            await tx2.wait();
            const description = "Test claim";
            const amount = hardhat_1.ethers.utils.parseEther("0.7");
            await (0, chai_1.expect)(insurancePolicy.connect(insured).fileClaim(0, description, amount)).to.be.revertedWith("Claim exceeds coverage amount.");
        });
    });
    describe("denyClaim", function () {
        it("Should deny the claim", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("1");
            const premium = hardhat_1.ethers.utils.parseEther("0.1");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            const tx = await insurancePolicy.connect(insured).acceptPolicy(0, { value: premium });
            await tx.wait();
            const description = "Test claim";
            const amount = hardhat_1.ethers.utils.parseEther("0.5");
            const tx2 = await insurancePolicy.connect(insured).fileClaim(0, description, amount);
            await tx2.wait();
            const claimDetails2 = await insurancePolicy.getClaimDetails(0, 0);
            (0, chai_1.expect)(claimDetails2[1]).to.equal(amount);
            (0, chai_1.expect)(claimDetails2[2]).to.equal(false);
            (0, chai_1.expect)(claimDetails2[3]).to.equal(false);
            await (0, chai_1.expect)(insurancePolicy.connect(insurer).denyClaim(0, 0)).to.not.be.reverted;
            const claimDetails = await insurancePolicy.getClaimDetails(0, 0);
            (0, chai_1.expect)(claimDetails[1]).to.equal(amount);
            (0, chai_1.expect)(claimDetails[2]).to.equal(false);
            (0, chai_1.expect)(claimDetails[3]).to.equal(true);
        });
        it("Should revert if called by a non-insurer account", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("1");
            const premium = hardhat_1.ethers.utils.parseEther("0.1");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            await insurancePolicy.connect(insured).acceptPolicy(0, { value: premium });
            const description = "Test claim";
            const amount = hardhat_1.ethers.utils.parseEther("0.5");
            await insurancePolicy.connect(insured).fileClaim(0, description, amount);
            await (0, chai_1.expect)(insurancePolicy.connect(otherAccount).denyClaim(0, 0)).to.be.revertedWith("Only the insurer can deny a claim.");
        });
    });
    describe("payPremium", function () {
        it("Should pay the premium and update premiumDueDate", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("1");
            const premium = hardhat_1.ethers.utils.parseEther("0.1");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 0, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            const initialDueDate = await insurancePolicy.getPolicy(0);
            await insurancePolicy.connect(insured).payPremium(0, { value: premium });
            const updatedDueDate = await insurancePolicy.getPolicy(0);
            (0, chai_1.expect)(updatedDueDate[6]).to.be.gt(initialDueDate[6]);
        });
        it("Should revert if the premium is not yet due", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("1");
            const premium = hardhat_1.ethers.utils.parseEther("0.1");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            await (0, chai_1.expect)(insurancePolicy.connect(insured).payPremium(0, { value: premium })).to.be.revertedWith("Premium is not yet due.");
        });
        it("Should revert if the incorrect premium amount is sent", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("1");
            const premium = hardhat_1.ethers.utils.parseEther("0.1");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            await insurancePolicy.connect(insured).acceptPolicy(0, { value: premium });
            await (0, chai_1.expect)(insurancePolicy.connect(insured).payPremium(0, { value: premium.mul(2) })).to.be.revertedWith("Incorrect premium amount.");
        });
        it("Should revert if called by a non-insured account", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("1");
            const premium = hardhat_1.ethers.utils.parseEther("0.1");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            const tx = await insurancePolicy.connect(insured).acceptPolicy(0, { value: premium });
            await tx.wait();
            await (0, chai_1.expect)(insurancePolicy.connect(otherAccount).payPremium(0, { value: premium })).to.be.revertedWith("Only the insured can pay the premium.");
        });
    });
    describe("getAllClaimsForPolicy", function () {
        it("Should return all claim IDs for a given policy", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("1");
            const premium = hardhat_1.ethers.utils.parseEther("0.1");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            const tx2 = await insurancePolicy.connect(insured).acceptPolicy(0, { value: premium });
            await tx2.wait();
            const description = "Test claim";
            const amount = hardhat_1.ethers.utils.parseEther("0.5");
            const tx9 = await insurancePolicy.connect(insured).fileClaim(0, description, amount);
            await tx9.wait();
            const claimIds = await insurancePolicy.getAllClaimsForPolicy(0);
            (0, chai_1.expect)(claimIds.length).to.equal(1);
        });
    });
    describe("getPolicy", function () {
        it("Should return the details of a policy", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("1");
            const premium = hardhat_1.ethers.utils.parseEther("0.1");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            const policyDetails = await insurancePolicy.getPolicy(0);
            (0, chai_1.expect)(policyDetails[0]).to.equal(policyName);
            (0, chai_1.expect)(policyDetails[1]).to.equal(insurer.address);
            (0, chai_1.expect)(policyDetails[2]).to.equal(insuredAddress);
            (0, chai_1.expect)(policyDetails[3]).to.equal(coverageAmount);
            (0, chai_1.expect)(policyDetails[4]).to.equal(premium);
            (0, chai_1.expect)(policyDetails[5]).to.equal(duration);
            // expect(policyDetails[5]).to.equal(d);
            (0, chai_1.expect)(policyDetails[7]).to.equal(false);
            (0, chai_1.expect)(policyDetails[8]).to.equal(false);
        });
    });
    describe("getAllPoliciesForInsured", function () {
        it("Should return all policy IDs for a given insured address", async function () {
            const policyName1 = "Test Policy 1";
            const coverageAmount1 = hardhat_1.ethers.utils.parseEther("1");
            const premium1 = hardhat_1.ethers.utils.parseEther("0.1");
            const duration1 = 365;
            const insuredAddress1 = insured.address;
            const policyName2 = "Test Policy 2";
            const coverageAmount2 = hardhat_1.ethers.utils.parseEther("2");
            const premium2 = hardhat_1.ethers.utils.parseEther("0.2");
            const duration2 = 180;
            const insuredAddress2 = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName1, coverageAmount1, premium1, duration1, 30, insuredAddress1);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            const createPolicyTx2 = await insurancePolicy.connect(insurer).createPolicy(policyName2, coverageAmount2, premium2, duration2, 30, insuredAddress2);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx2.wait();
            const policyIds = await insurancePolicy.getAllPoliciesForInsured(insuredAddress2);
            (0, chai_1.expect)(policyIds.length).to.equal(2);
        });
    });
    describe("getAllPoliciesForInsurer", function () {
        it("Should return all policy IDs for a given insurer address", async function () {
            const policyName1 = "Test Policy 1";
            const coverageAmount1 = hardhat_1.ethers.utils.parseEther("1");
            const premium1 = hardhat_1.ethers.utils.parseEther("0.1");
            const duration1 = 365;
            const insuredAddress1 = insured.address;
            const policyName2 = "Test Policy 2";
            const coverageAmount2 = hardhat_1.ethers.utils.parseEther("2");
            const premium2 = hardhat_1.ethers.utils.parseEther("0.2");
            const duration2 = 180;
            const insuredAddress2 = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName1, coverageAmount1, premium1, duration1, 30, insuredAddress1);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            const createPolicyTx2 = await insurancePolicy.connect(insurer).createPolicy(policyName2, coverageAmount2, premium2, duration2, 30, insuredAddress2);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx2.wait();
            const policyIds = await insurancePolicy.getAllPoliciesForInsurer(insurer.address);
            (0, chai_1.expect)(policyIds.length).to.equal(2);
        });
    });
    describe("getAllClaimsForInsurer", function () {
        it("Should return all claim IDs for a given insurer address", async function () {
            const policyName1 = "Test Policy 1";
            const coverageAmount1 = hardhat_1.ethers.utils.parseEther("1");
            const premium1 = hardhat_1.ethers.utils.parseEther("0.1");
            const duration1 = 365;
            const policyName2 = "Test Policy 2";
            const coverageAmount2 = hardhat_1.ethers.utils.parseEther("2");
            const premium2 = hardhat_1.ethers.utils.parseEther("0.2");
            const duration2 = 180;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName1, coverageAmount1, premium1, duration1, 30, insured.address);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            const createPolicyTx2 = await insurancePolicy.connect(insurer).createPolicy(policyName2, coverageAmount2, premium2, duration2, 30, otherAccount.address);
            console.log("after policy creation");
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx2.wait();
            const tx3 = await insurancePolicy.connect(insured).acceptPolicy(0, { value: premium1 });
            await tx3.wait();
            console.log("after accept 1 creation");
            const tx4 = await insurancePolicy.connect(otherAccount).acceptPolicy(1, { value: premium2 });
            await tx4.wait();
            console.log("pay");
            const description1 = "Test claim 1";
            const amount1 = hardhat_1.ethers.utils.parseEther("0.5");
            const tx5 = await insurancePolicy.connect(insured).fileClaim(0, description1, amount1);
            const description2 = "Test claim 2";
            const amount2 = hardhat_1.ethers.utils.parseEther("1.5");
            const tx6 = await insurancePolicy.connect(otherAccount).fileClaim(1, description2, amount2);
            await tx6.wait();
            await tx5.wait();
            console.log("after claims creation");
            await insurancePolicy.connect(otherAccount).getAllClaimsForInsurer(insurer.address).then(claimIds => (0, chai_1.expect)(claimIds.length).to.equal(2));
        });
    });
    describe("createPolicy", function () {
        it("Should create a new policy and increase the policy count", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("0.5");
            const premium = hardhat_1.ethers.utils.parseEther("0.01");
            const duration = 365;
            const insuredAddress = insured.address;
            const initialPolicyCount = await insurancePolicy.getPolicyCount();
            console.log("Initial Policy Count:", initialPolicyCount.toString());
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            const finalPolicyCount = await insurancePolicy.getPolicyCount();
            console.log("Final Policy Count:", finalPolicyCount.toString());
            (0, chai_1.expect)(finalPolicyCount).to.equal(initialPolicyCount.add(1));
        });
    });
    describe("createPolicy1", function () {
        it("Should create a new policy", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("1");
            const premium = hardhat_1.ethers.utils.parseEther("0.1");
            const duration = 365;
            const insuredAddress = insured.address;
            const createPolicyTx = await insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress);
            // Wait for the policy creation transaction to be mined and confirmed
            await createPolicyTx.wait();
            const policyDetails = await insurancePolicy.getPolicy(0);
            (0, chai_1.expect)(policyDetails[0]).to.equal(policyName);
            (0, chai_1.expect)(policyDetails[1]).to.equal(insurer.address);
            (0, chai_1.expect)(policyDetails[2]).to.equal(insuredAddress);
            (0, chai_1.expect)(policyDetails[3]).to.equal(coverageAmount);
            (0, chai_1.expect)(policyDetails[4]).to.equal(premium);
            (0, chai_1.expect)(policyDetails[5]).to.equal(duration);
            // expect(policyDetails[6]).to.equal(premiumDueDate);
            (0, chai_1.expect)(policyDetails[7]).to.equal(false);
            (0, chai_1.expect)(policyDetails[8]).to.equal(false);
        });
        it("Should emit a PolicyCreated event", async function () {
            const policyName = "Test Policy";
            const coverageAmount = hardhat_1.ethers.utils.parseEther("1");
            const premium = hardhat_1.ethers.utils.parseEther("0.1");
            const duration = 365;
            const insuredAddress = insured.address;
            await (0, chai_1.expect)(insurancePolicy.connect(insurer).createPolicy(policyName, coverageAmount, premium, duration, 30, insuredAddress))
                .to.emit(insurancePolicy, "PolicyCreated")
                .withArgs(0, policyName, insurer.address, insuredAddress, 1);
        });
    });
});
