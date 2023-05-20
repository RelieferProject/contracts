import { artifacts, ethers, web3 } from "hardhat";

const tokenAddres = {
  Validator: "0x90B9f92562C27b679D1c7eb191334B1ae87AD142",
  Token: "0x82578282fE399d5EEDfe1b8dd674979438F94081",
  Factory: "0xF9E46aE53038Bc75cEA1139f092A258d1868e7Db",
};

async function main() {
  // await deploy();
  await createCampaign();
}

async function createCampaign() {
  let deployer: string;

  [deployer] = await web3.eth.getAccounts();
  const attifactRelieferFactory = await artifacts.readArtifact("RelieferFactory");

  const RelieferCampaignFactory = new web3.eth.Contract(attifactRelieferFactory.abi, tokenAddres.Factory);

  await RelieferCampaignFactory.methods
    .addCampaigner(deployer)
    .send({ from: deployer })
    .then(() => {
      console.log("RelieferCampaignFactory: addCampaigner Done");
    });

  // uint256 _startTime, uint256 _endTime, uint256 _durationToEarn, uint256 _rewardTokenAmount
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const payload = {
    _startTime: currentTimestampInSeconds,
    _endTime: currentTimestampInSeconds + 1000,
    _durationToEarn: 500,
    _rewardTokenAmount: web3.utils.toWei("10", "ether"),
    _maxUser: 100,
  };

  console.log(payload);

  // test create campaign
  await RelieferCampaignFactory.methods
    .createCampaign(payload._startTime, payload._endTime, payload._durationToEarn, payload._rewardTokenAmount, payload._maxUser)
    .send({ from: deployer })
    .then(() => {
      console.log("RelieferCampaignFactory: createCampaign Done");
    });
}

async function deploy() {
  let deployer: string;
  [deployer] = await web3.eth.getAccounts();

  const attifactRelieferValidator = await artifacts.readArtifact("RelieferValidate");
  const attifactRelieferToken = await artifacts.readArtifact("RelieferToken");
  const attifactRelieferCampaign = await artifacts.readArtifact("RelieferCampaign");
  const attifactRelieferFactory = await artifacts.readArtifact("RelieferFactory");

  const RelieferValidator = await new web3.eth.Contract(attifactRelieferValidator.abi)
    .deploy({ data: attifactRelieferValidator.bytecode })
    .send({ from: deployer });

  const RelieferToken = await new web3.eth.Contract(attifactRelieferToken.abi)
    .deploy({ data: attifactRelieferToken.bytecode })
    .send({ from: deployer });

  const RelieferCampaignFactory = await new web3.eth.Contract(attifactRelieferFactory.abi)
    .deploy({
      data: attifactRelieferFactory.bytecode,
      arguments: [RelieferToken.options.address, RelieferValidator.options.address],
    })
    .send({ from: deployer });

  // set factory address to RelieferValidator
  await RelieferValidator.methods
    .setFactory(RelieferCampaignFactory.options.address)
    .send({ from: deployer })
    .then(() => {
      console.log("RelieferValidator: setFactory Done");
    });

  console.log("RelieferValidator: ", RelieferValidator.options.address);
  console.log("RelieferToken: ", RelieferToken.options.address);
  console.log("RelieferCampaignFactory: ", RelieferCampaignFactory.options.address);
}

main();
