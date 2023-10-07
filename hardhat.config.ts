import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-deploy";
import "hardhat-log-remover";
import "@nomiclabs/hardhat-web3";

module.exports = {
  defaultNetwork: "relieferchain",

  networks: {
    // relieferchain: {
    //   url: "http://127.0.0.1:8545/",
    //   accounts: [
    //     process.env.LOCAL_PRIVATE_KEY_1,
    //     process.env.LOCAL_PRIVATE_KEY_2,
    //     process.env.LOCAL_PRIVATE_KEY_3,
    //     process.env.LOCAL_PRIVATE_KEY_4,
    //   ],
    // },
    relieferchain: {
      url: "http://157.230.242.107:8545",
      chainId: 31337,
      accounts: [
        process.env.LOCAL_PRIVATE_KEY_1,
        process.env.LOCAL_PRIVATE_KEY_2,
        process.env.LOCAL_PRIVATE_KEY_3,
        process.env.LOCAL_PRIVATE_KEY_4,
      ],
    },
    hardhat: {
      chainId: 31337,
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      timeout: 1800000,
      accounts: [
        {
          privateKey: "0xcc1a5c7b2b06db9dab1760d44fc3914ecf22551724eb713ef729a319609f523f",
          balance: "10000000000000000000000",
        },
        {
          privateKey: "0x36d0d21e41520248b2dc954f70cf21f32c785526964ae334b24b52b22e785ddc",
          balance: "10000000000000000000000",
        },
        {
          privateKey: "0x3389d80643645e6d9ec7646523c085b5f34431e7b738fae753f76472fb59befa",
          balance: "10000000000000000000000",
        },
        {
          privateKey: "0xa4047e5b646f42f4d0340b6a24a80e1095779db402a3feb829761a588fd16498",
          balance: "10000000000000000000000",
        },
      ],
      // accounts: {
      //   mnemonic: "test test test test test test test test test test test junk",
      //   path: "m/44'/60'/0'/0",
      //   initialIndex: 0,
      //   count: 20,
      //   passphrase: "",
      //   balance: "10000000000000000000000",
      // },
    },
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [
        process.env.LOCAL_PRIVATE_KEY_1,
        process.env.LOCAL_PRIVATE_KEY_2,
        process.env.LOCAL_PRIVATE_KEY_3,
        process.env.LOCAL_PRIVATE_KEY_4,
      ],
    },
    kovan: {
      url: "https://kovan.infura.io/v3/b01fa8a0141a4714a36b52d5676217ee",
      accounts: [
        process.env.LOCAL_PRIVATE_KEY_1,
        process.env.LOCAL_PRIVATE_KEY_2,
        process.env.LOCAL_PRIVATE_KEY_3,
        process.env.LOCAL_PRIVATE_KEY_4,
      ],
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/b01fa8a0141a4714a36b52d5676217ee",
      accounts: [
        process.env.LOCAL_PRIVATE_KEY_1,
        process.env.LOCAL_PRIVATE_KEY_2,
        process.env.LOCAL_PRIVATE_KEY_3,
        process.env.LOCAL_PRIVATE_KEY_4,
      ],
    },
    mainnet: {
      url: process.env.BSC_MAINNET_RPC,
      accounts: [process.env.BSC_MAINNET_PRIVATE_KEY],
    },
    mainnetfork: {
      url: "http://127.0.0.1:8545",
      accounts: [process.env.BSC_MAINNET_PRIVATE_KEY],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.9",
      },
      {
        version: "0.8.2",
      },
      {
        version: "0.8.0",
      },
      {
        version: "0.6.12",
      },
      {
        version: "0.6.6",
      },
      {
        version: "0.6.0",
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 168,
      },
      evmVersion: "istanbul",
      outputSelection: {
        "*": {
          "": ["ast"],
          "*": [
            "evm.bytecode.object",
            "evm.deployedBytecode.object",
            "abi",
            "evm.bytecode.sourceMap",
            "evm.deployedBytecode.sourceMap",
            "metadata",
            "storageLayout",
          ],
        },
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "./typechain",
    target: process.env.TYPECHAIN_TARGET || "ethers-v5",
  },
  mocha: {
    timeout: 500000,
  },
};
