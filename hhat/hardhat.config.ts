import "@nomicfoundation/hardhat-toolbox";
import {HardhatUserConfig} from "hardhat/config"; // Add this line

const mnemonic = 'keen junior picture differ reveal bulb tape cradle bunker talent accident network'; // Replace this with your MetaMask mnemonic phrase

const config: HardhatUserConfig = {
  defaultNetwork: "sepolia",
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v6',
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk',
      }
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/uPf44CO0DKh7aWhgbrSiSnGGwX0v_AqM", // Alchemy Sepolia RPC URL
      accounts: {mnemonic: mnemonic},
      chainId: 11155111,
    },
  },
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};

export default config;
