import { artifacts, web3 } from "hardhat";

const tokenAddres = {
  Validator: "0xC159BB4552087c92C2fac9F80292c9A2988A2AF4",
  Token: "0x4A681C52c07d51E614c7996053643039a3e54efA",
  Factory: "0x77712CFBe9989D212f2f551c64c9261574EA2B98",
};

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
