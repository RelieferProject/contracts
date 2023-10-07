import { artifacts, web3 } from "hardhat";
import { deployContract } from "../shared/Contracts";

async function deploy() {
  let deployer: string;
  [deployer] = await web3.eth.getAccounts();

  const attifactRelieferValidator = await artifacts.readArtifact("RelieferValidate");
  const attifactRelieferToken = await artifacts.readArtifact("RelieferToken");
  const attifactRelieferCampaign = await artifacts.readArtifact("RelieferCampaign");
  const attifactRelieferFactory = await artifacts.readArtifact("RelieferFactory");

  const RelieferToken = await deployContract(attifactRelieferToken, deployer);
  const RelieferValidator = await deployContract(attifactRelieferValidator, deployer);
  const RelieferFactory = await deployContract(attifactRelieferFactory, deployer, [
    RelieferToken.options.address,
    RelieferValidator.options.address,
  ]);

  // add setFactory
  await RelieferValidator.methods.setFactory(RelieferFactory.options.address).send({ from: deployer });
  console.log("RelieferValidator: setFactory Done");

  // add validator
  await RelieferFactory.methods.addValidator(deployer).send({ from: deployer });
  console.log("RelieferFactory: addValidator Done");

  // add campaigner
  await RelieferFactory.methods.addCampaigner(deployer).send({ from: deployer });
  console.log("RelieferFactory: addCampaigner Done");

  // register in validator
  await RelieferValidator.methods.register().send({ from: deployer });
  await RelieferValidator.methods.validate(deployer).send({ from: deployer });

  // add minter to deployer and mintoken
  await RelieferToken.methods.setAllowMint(deployer, true).send({ from: deployer });
  await RelieferToken.methods.mint(RelieferFactory.options.address, web3.utils.toWei("1000", "ether")).send({ from: deployer });


  console.log("RelieferValidator: ", RelieferValidator.options.address);
  console.log("RelieferToken: ", RelieferToken.options.address);
  console.log("RelieferFactory: ", RelieferFactory.options.address);
}



deploy();
