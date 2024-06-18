import {Contract, ethers} from "ethers";
import {formatEther, getNumber, parseEther} from "ethers";

export async function createPolicy(contract: Contract|undefined, policyName: string, insuredAddress: string, period: number, coverageAmount: number, premium: number, duration: number) {
    console.log('Creating policy...');
    const coverageAmountWei = parseEther(coverageAmount.toString());
    const premiumWei = parseEther(premium.toString());
    try {
        console.log('Sending transaction...');
        console.time('Create policy transaction time');
        const tx = await contract?.createPolicy(policyName, coverageAmountWei, premiumWei, Number(duration.toFixed(0)), Number(period.toFixed(0)), insuredAddress);
        console.log('Transaction sent, waiting for receipt...');
        const receipt = await tx.wait();
        console.timeEnd('Create policy transaction time');
        console.log('Transaction completed:', receipt);
        return receipt;
    } catch (error) {
        console.error('Error while creating policy:', error);
        throw error;
    }
}

export async function getAllPolicies(contract: Contract | undefined) {
    try {
        const policies = await contract?.getAllPoliciesForAddress();
        return policies.map(convertArrayToPolicyObject)
    } catch (error) {
        console.error('Error while getting policies:', error);
        throw error;
    }
}

export async function getAllClaims(contract: Contract|undefined) {
    try {
        const claims = await contract?.getAllClaimsForAddress();

        return claims.map(convertArrayToClaimObject)
    } catch (error) {
        console.error('Error while getting claims:', error);
        throw error;
    }
}

export async function acceptAndPayClaim(contract: Contract|undefined, policyId: number, claimId: number, claimValue: number) {
    try {
        const claimValueWei = parseEther((claimValue).toString());
        console.log('Accepting claim. Sending transaction...');
        console.time('Accepting claim transaction time');
        const tx = await contract?.acceptAndPayClaim(policyId, claimId, {value: claimValueWei});
        console.log('Transaction sent, waiting for receipt...');
        const receipt = await tx.wait();
        console.timeEnd('Accepting claim transaction time');
        console.log('Transaction completed:', receipt);
        return receipt;
    } catch (error) {
        console.error('Error while accepting claim:', error);
        throw error;
    }
}

export async function acceptPolicy(contract: Contract|undefined, policyId: number, premiumValue: number) {
    try {
        const premiumValueWei = parseEther(premiumValue.toString());
        console.log('Accepting policy. Sending transaction...');

        console.time('Accepting policy transaction time');
        const tx = await contract?.acceptPolicy(policyId, {value: premiumValueWei});
        console.log('Transaction sent, waiting for receipt...');
        const receipt = await tx.wait();
        console.timeEnd('Accepting policy transaction time');
        console.log('Transaction completed:', receipt);
        return receipt;
    } catch (error) {
        console.error('Error while accepting policy:', error);
        throw error;
    }
}

export async function payPremium(contract: Contract|undefined, policyId: number, premiumValue: number) {
    try {

        const premiumValueWei = parseEther(premiumValue.toString());
        console.log('Paying premium. Sending transaction...');

        console.time('Paying premium transaction time');
        const tx = await contract?.payPremium(policyId, {value: premiumValueWei});
        console.log('Transaction sent, waiting for receipt...');
        const receipt = await tx.wait();

        console.timeEnd('Paying premium transaction time');
        console.log('Transaction completed:', receipt);
        return receipt;
    } catch (error) {
        console.error('Error while paying premium:', error);
        throw error;
    }
}

export async function denyPolicy(contract: Contract|undefined, policyId: number) {
    try {

        console.log('Denying policy. Sending transaction...');

        console.time('Denying policy transaction time');
        const tx = await contract?.denyPolicy(policyId);
        console.log('Transaction sent, waiting for receipt...');
        const receipt = await tx.wait();

        console.timeEnd('Denying policy transaction time');
        console.log('Transaction completed:', receipt);
        return receipt;
    } catch (error) {
        console.error('Error while denying policy:', error);
        throw error;
    }
}

export async function denyClaim(contract: Contract|undefined, policyId: number, claimId: number) {
    try {

        console.log('Denying claim. Sending transaction...');

        console.time('Denying claim transaction time');
        const tx = await contract?.denyClaim(policyId, claimId);
        console.log('Transaction sent, waiting for receipt...');
        const receipt = await tx.wait();

        console.timeEnd('Denying claim transaction time');
        console.log('Transaction completed:', receipt);
        return receipt;
    } catch (error) {
        console.error('Error while denying claim:', error);
        throw error;
    }
}

export async function fileClaim(contract: Contract|undefined, policyId: number, description: string, amount: number) {
    try {
        const amountWei = parseEther(amount.toString());
        console.log('Filing claim. Sending transaction...');

        console.time('Filing claim transaction time');
        const tx = await contract?.fileClaim(policyId, description, amountWei);
        console.log('Transaction sent, waiting for receipt...');
        const receipt = await tx.wait();

        console.timeEnd('Filing claim transaction time');
        console.log('Transaction completed:', receipt);
        return receipt;
    } catch (error) {
        console.error('Error while Filing claim:', error);
        throw error;
    }
}

function convertArrayToPolicyObject(policyArray: any[]) {
    return {
        id: getNumber(policyArray[0]),
        policyName: policyArray[1],
        insurer: policyArray[2],
        insured: policyArray[3],
        coverageAmount: formatEther(policyArray[4]),
        premium: formatEther(policyArray[5]),
        duration: getNumber(policyArray[6]),
        creationTime: getNumber(policyArray[7]),
        isAnswered: policyArray[8],
        isAccepted: policyArray[9],
        premiumDueDate: getNumber(policyArray[10]),
        period: getNumber(policyArray[11]),
    };
}

function convertArrayToClaimObject(claimArray: any[]) {
    return {
        id: getNumber(claimArray[0]),
        policyId: getNumber(claimArray[1]),
        policyName: claimArray[2],
        description: claimArray[3],
        amount: formatEther(claimArray[4]),
        isAccepted: claimArray[5],
        isAnswered: claimArray[6]
    };
}