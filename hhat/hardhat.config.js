"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomicfoundation/hardhat-toolbox");
const mnemonic = 'keen junior picture differ reveal bulb tape cradle bunker talent accident network'; // Replace this with your MetaMask mnemonic phrase
const config = {
    defaultNetwork: "sepolia",
    typechain: {
        outDir: 'typechain',
        target: 'ethers-v5',
    },
    networks: {
        hardhat: {
            accounts: {
                mnemonic: 'test test test test test test test test test test test junk',
            }
        },
        sepolia: {
            url: "https://eth-sepolia.g.alchemy.com/v2/uPf44CO0DKh7aWhgbrSiSnGGwX0v_AqM",
            accounts: { mnemonic: mnemonic },
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
exports.default = config;
