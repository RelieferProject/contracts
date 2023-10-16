import { artifacts, web3 } from "hardhat";

const tokenAddres = {
  Validator: process.env.VITE_BASE_VALIDATOR_ADDRESS,
  Token: process.env.VITE_BASE_TOKEN_ADDRESS,
  Factory: process.env.VITE_BASE_FACTORY_ADDRESS,
};

console.log(tokenAddres);

async function createCampaign() {
  let deployer: string;

  [deployer] = await web3.eth.getAccounts();
  const attifactRelieferFactory = await artifacts.readArtifact("RelieferFactory");

  const RelieferCampaignFactory = new web3.eth.Contract(attifactRelieferFactory.abi, tokenAddres.Factory);

  await RelieferCampaignFactory.methods
    .addCampaigner(deployer)
    .send({ from: deployer })
    .then(() => {
      console.log("RelieferCampaignFactoryxx: addCampaigner Done");
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
    .createCampaign(
      payload._startTime,
      payload._endTime,
      payload._durationToEarn,
      payload._rewardTokenAmount,
      payload._maxUser
    )
    .send({ from: deployer })
    .then(() => {
      console.log("RelieferCampaignFactory: createCampaign Done");
    });
}

createCampaign();
