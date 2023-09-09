// import { expect } from "chai";
// import { artifacts, ethers, web3 } from "hardhat";
// import { Artifact } from "hardhat/types";
// import { deployContract } from "../shared/Contracts";
// import { Contract } from "web3-eth-contract";

// describe("1.Testing Deployment main Contracts", function () {
//   let accounts: string[];
//   let deployer: string;

//   let attifactRelieferValidator: Artifact;
//   let attifactRelieferToken: Artifact;
//   let attifactRelieferCampaign: Artifact;
//   let attifactRelieferFactory: Artifact;

//   // contract
//   let RelieferToken: Contract;
//   let RelieferCampaign: Contract;
//   let RelieferFactory: Contract;
//   let RelieferValidator: Contract;

//   const getNewToken = async () => {
//     return await deployContract(attifactRelieferToken, accounts[0]);
//   };

//   const getNewValidator = async () => {
//     return await deployContract(attifactRelieferValidator, accounts[0]);
//   };

//   // setup
//   before(async function () {
//     accounts = await web3.eth.getAccounts();
//     deployer = accounts[0];
//     attifactRelieferValidator = await artifacts.readArtifact("RelieferValidate");
//     attifactRelieferToken = await artifacts.readArtifact("RelieferToken");
//     attifactRelieferCampaign = await artifacts.readArtifact("RelieferCampaign");
//     attifactRelieferFactory = await artifacts.readArtifact("RelieferFactory");
//   });

//   async function deploy() {
//     let deployer: string;
//     [deployer] = await web3.eth.getAccounts();

//     const RelieferValidator = await new web3.eth.Contract(attifactRelieferValidator.abi)
//       .deploy({ data: attifactRelieferValidator.bytecode })
//       .send({ from: deployer });

//     const RelieferToken = await new web3.eth.Contract(attifactRelieferToken.abi)
//       .deploy({ data: attifactRelieferToken.bytecode })
//       .send({ from: deployer });

//     const RelieferCampaignFactory = await new web3.eth.Contract(attifactRelieferFactory.abi)
//       .deploy({
//         data: attifactRelieferFactory.bytecode,
//         arguments: [RelieferToken.options.address, RelieferValidator.options.address],
//       })
//       .send({ from: deployer });

//     // set factory address to RelieferValidator
//     await RelieferValidator.methods
//       .setFactory(RelieferCampaignFactory.options.address)
//       .send({ from: deployer })
//       .then(() => {
//         console.log("RelieferValidator: setFactory Done");
//       });
//     return {
//       RelieferValidator: RelieferValidator.options.address,
//       RelieferToken: RelieferToken.options.address,
//       RelieferCampaignFactory: RelieferCampaignFactory.options.address,
//     };
//   }

//   it("1.1 can deploy ERC20 RelieferToken", async function () {
//     RelieferToken = await deployContract(attifactRelieferToken, accounts[0]);
//     expect(RelieferToken.options.address).to.not.equal(null);
//   });

//   it("1.2 can deploy RelieferValidator Contract", async function () {
//     RelieferValidator = await deployContract(attifactRelieferValidator, accounts[0]);
//     expect(RelieferValidator.options.address).to.not.equal(null);
//   });

//   it("1.3 can deploy RelieferFactory Contract with with [RelieferToken , RelieferValidator]", async function () {
//     RelieferFactory = await deployContract(attifactRelieferFactory, accounts[0], [
//       RelieferToken.options.address,
//       RelieferValidator.options.address,
//     ]);
//     // get public value from contract
//     expect(RelieferFactory.options.address).to.not.equal(null);
//     expect(await RelieferFactory.methods.token().call()).equal(RelieferToken.options.address);
//     expect(await RelieferFactory.methods.validator().call()).equal(RelieferValidator.options.address);
//   });

//   it("1.4 cannot deploy RelieferFactory Contract with no arg , 1 arg", async function () {
//     try {
//       await deployContract(attifactRelieferFactory, accounts[0]);
//       expect(false).to.equal(true);
//     } catch {
//       try {
//         await deployContract(attifactRelieferFactory, accounts[0], [RelieferToken.options.address]);
//         expect(false).to.equal(true);
//       } catch {
//         expect(true).to.equal(true);
//       }
//     }
//   });

//   it("1.5 can deploy RelieferFactory Contract only RelieferToken addresss", async function () {
//     try {
//       const validator = await getNewValidator();
//       await deployContract(attifactRelieferFactory, accounts[0], [validator, validator]);
//       expect(false).to.equal(true);
//     } catch (err: any) {
//       expect(err.message).to.include("invalid address");
//     }
//   });

//   it("1.6 can deploy RelieferFactory Contract only RelieferValidator addresss", async function () {
//     try {
//       const token = await getNewToken();
//       await deployContract(attifactRelieferFactory, accounts[0], [token, token]);
//       expect(false).to.equal(true);
//     } catch (err: any) {
//       expect(err.message).to.include("invalid address");
//     }
//   });
// });
