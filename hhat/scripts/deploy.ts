import { ethers } from "ethers";
import InsurancePolicy from '../artifacts/contracts/InsurancePolicy.sol/InsurancePolicy.json';

async function main() {
    // Set up a wallet with a private key (Replace with your private key)
    const privateKey = "f6c4b6a90bd302cef866d4ee1fc5e792b554c88c2a3fe532eb59cad9c1eee894";
    const provider = new ethers.providers.JsonRpcProvider(
        "https://eth-sepolia.g.alchemy.com/v2/uPf44CO0DKh7aWhgbrSiSnGGwX0v_AqM");
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Deploying contracts with the account:", wallet.address);

    // Load the compiled contract artifact
    const InsurancePolicyFactory = new ethers.ContractFactory(
        InsurancePolicy.abi,
        InsurancePolicy.bytecode,
        wallet
    );

    // Start deployment, returning a promise that resolves to a contract object
    const insurancePolicy = await InsurancePolicyFactory.deploy();
    await insurancePolicy.deployed()

    console.log("InsurancePolicy deployed to:", insurancePolicy.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
