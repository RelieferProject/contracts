import { expect } from "chai";
import { artifacts, ethers, web3 } from "hardhat";
import { Artifact } from "hardhat/types";
import { deployContract } from "../shared/Contracts";
import { Contract } from "web3-eth-contract";

describe("3. Campaign Contract and User Testing", function () {
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

    // add minter to factory
    // await RelieferToken.methods.setAllowMint(RelieferFactory.options.address,true).send({ from: deployer });

    // mint token
    // await RelieferToken.methods.mint(accounts[0], web3.utils.toWei("100", "ether")).send({ from: deployer });

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

  it("3.1 can create campaign only campaigner", async function () {
    const { RelieferToken, RelieferValidator, RelieferFactory } = await getMainContract();

    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    const payload = {
      _startTime: currentTimestampInSeconds,
      _endTime: currentTimestampInSeconds + 1000,
      _durationToEarn: 500,
      _rewardTokenAmount: +web3.utils.toWei("1", "gwei"),
      _maxUser: 100,
    };

    // console.log(payload);

    // test create campaign
    await RelieferFactory.methods
      .createCampaign(
        payload._startTime,
        payload._endTime,
        payload._durationToEarn,
        payload._rewardTokenAmount,
        payload._maxUser
      )
      .send({ from: accounts[4] })
      .then(() => {
        expect(false).to.equal(true);
        // console.log("RelieferCampaignFactory: createCampaign Done");
      })
      .catch(() => {});

    await RelieferFactory.methods
      .createCampaign(
        payload._startTime,
        payload._endTime,
        payload._durationToEarn,
        payload._rewardTokenAmount,
        payload._maxUser
      )
      .send({ from: accounts[2] })
      .then(async () => {
        const campaignAddresses = await RelieferFactory.methods.getCampaigns().call();
        expect(campaignAddresses.length).to.equal(1);
      })
      .catch(() => {
        expect(false).to.equal(true);
      });
  });

  it("3.2 user can register to validator contract", async function () {
    const { RelieferToken, RelieferValidator, RelieferFactory } = await getMainContract();

    const user = accounts[3];

    await RelieferValidator.methods.register().send({ from: user });

    const usersContracts = await RelieferValidator.methods.getAllUsers().call();

    expect(usersContracts.length).to.equal(1);
  });

  it("3.3 validator can set user to valid", async function () {
    const { RelieferToken, RelieferValidator, RelieferFactory } = await getMainContract();

    const user = accounts[3];

    await RelieferValidator.methods.register().send({ from: user });

    const usersContracts = await RelieferValidator.methods.getAllUsers().call();

    expect(usersContracts.length).to.equal(1);

    await RelieferValidator.methods.validate(user).send({ from: accounts[1] });

    const userContract = await RelieferValidator.methods.getAllUsers().call();

    expect(userContract[0][1]).to.equal(true);
  });

  it("3.4 user can register campain", async function () {
    const { RelieferToken, RelieferValidator, RelieferFactory } = await getMainContract();

    const user = accounts[3];

    await RelieferValidator.methods.register().send({ from: user });

    const usersContracts = await RelieferValidator.methods.getAllUsers().call();

    expect(usersContracts.length).to.equal(1);

    await RelieferValidator.methods.validate(user).send({ from: accounts[1] });

    const userContract = await RelieferValidator.methods.getAllUsers().call();

    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    const payload = {
      _startTime: currentTimestampInSeconds,
      _endTime: currentTimestampInSeconds + 1000,
      _durationToEarn: 500,
      _rewardTokenAmount: +web3.utils.toWei("1", "gwei"),
      _maxUser: 100,
    };

    expect(userContract[0][1]).to.equal(true);

    await RelieferFactory.methods
      .createCampaign(
        payload._startTime,
        payload._endTime,
        payload._durationToEarn,
        payload._rewardTokenAmount,
        payload._maxUser
      )
      .send({ from: accounts[2] })
      .then(async () => {
        const campaignAddresses = await RelieferFactory.methods.getCampaigns().call();
        expect(campaignAddresses.length).to.equal(1);
      })
      .catch(() => {
        expect(false).to.equal(true);
      });

    const campaignAddress = (await RelieferFactory.methods.getCampaigns().call())[0];
    const RelieferCampaignFactory = new web3.eth.Contract(attifactRelieferCampaign.abi, campaignAddress);

    await RelieferCampaignFactory.methods
      .user_joinCampaign()
      .send({ from: user })
      .then(() => {
        expect(false).to.equal(true);
      })
      .catch(() => {
        expect(true).to.equal(true);
      });
  });
});
