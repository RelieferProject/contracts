import { expect } from "chai";
import { artifacts, ethers, web3 } from "hardhat";
import { Artifact } from "hardhat/types";
import { deployContract } from "../shared/Contracts";
import { Contract } from "web3-eth-contract";

describe("2. Main Product Testing", function () {
  let accounts: string[];
  let deployer: string;

  let attifactRelieferValidator: Artifact;
  let attifactRelieferToken: Artifact;
  let attifactRelieferCampaign: Artifact;
  let attifactRelieferFactory: Artifact;

  // contract
  let RelieferToken: Contract;
  let RelieferCampaign: Contract;
  let RelieferFactory: Contract;
  let RelieferValidator: Contract;

  const getNewToken = async () => {
    return await deployContract(attifactRelieferToken, accounts[0]);
  };

  const getNewValidator = async () => {
    return await deployContract(attifactRelieferValidator, accounts[0]);
  };

  const getMainContract = async () => {
    const RelieferToken = await deployContract(attifactRelieferToken, deployer);
    const RelieferValidator = await deployContract(attifactRelieferValidator, deployer);
    const RelieferFactory = await deployContract(attifactRelieferFactory, deployer, [
      RelieferToken.options.address,
      RelieferValidator.options.address,
    ]);

    await RelieferValidator.methods.setFactory(RelieferFactory.options.address).send({ from: deployer });

    // add validator
    await RelieferFactory.methods.addValidator(accounts[1]).send({ from: deployer });

    // add campaigner
    await RelieferFactory.methods.addCampaigner(accounts[2]).send({ from: deployer });

    // mint token

    return {
      RelieferToken: RelieferToken,
      RelieferValidator: RelieferValidator,
      RelieferFactory: RelieferFactory,
    };
  };

  // setup
  before(async function () {
    accounts = await web3.eth.getAccounts();
    deployer = accounts[0];
    attifactRelieferValidator = await artifacts.readArtifact("RelieferValidate");
    attifactRelieferToken = await artifacts.readArtifact("RelieferToken");
    attifactRelieferCampaign = await artifacts.readArtifact("RelieferCampaign");
    attifactRelieferFactory = await artifacts.readArtifact("RelieferFactory");
  });

  it("2.1 can create campaign only campaigner", async function () {
    const { RelieferToken, RelieferValidator, RelieferFactory } = await getMainContract();

    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    const payload = {
      _startTime: currentTimestampInSeconds,
      _endTime: currentTimestampInSeconds + 1000,
      _durationToEarn: 500,
      _rewardTokenAmount: web3.utils.toWei("10", "ether"),
      _maxUser: 100,
    };
  });
});
