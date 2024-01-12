import { expect } from "chai";
import { artifacts, ethers, web3 } from "hardhat";
import { Artifact } from "hardhat/types";
import { deployContract } from "../shared/Contracts";
import { Contract } from "web3-eth-contract";

describe("4. Campaign Test", function () {
  let accounts: string[];
  let deployer: string;
  let validator: string;
  let campaigner: string;
  let user: string;

  let attifactRelieferValidator: Artifact;
  let attifactRelieferToken: Artifact;
  let attifactRelieferCampaign: Artifact;
  let attifactRelieferFactory: Artifact;

  // contract
  let MainRelieferToken: Contract;
  let MainRelieferCampaign: Contract;
  let MainRelieferFactory: Contract;
  let MainRelieferValidator: Contract;

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

    // register in validator
    await RelieferValidator.methods.register().send({ from: accounts[3] });
    await RelieferValidator.methods.validate(accounts[3]).send({ from: accounts[1] });

    // add minter to factory
    // await RelieferToken.methods.setAllowMint(RelieferFactory.options.address,true).send({ from: deployer });
    await RelieferToken.methods.setAllowMint(deployer, true).send({ from: deployer });

    const getMinter = await RelieferToken.methods.getMinters().call();
    // console.log({ getMinter });

    // mint token
    await RelieferToken.methods
      .mint(RelieferFactory.options.address, web3.utils.toWei("100", "ether"))
      .send({ from: deployer });

    // check balance
    const balance = await RelieferToken.methods.balanceOf(RelieferFactory.options.address).call();
    // console.log({ balance });

    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    const payload = {
      _startTime: currentTimestampInSeconds,
      _endTime: currentTimestampInSeconds + 60,
      _durationToEarn: 1,
      _rewardTokenAmount: +web3.utils.toWei("1", "gwei"),
      _maxUser: 1,
    };
    await RelieferFactory.methods
      .createCampaign(
        payload._startTime,
        payload._endTime,
        payload._durationToEarn,
        payload._rewardTokenAmount,
        payload._maxUser
      )
      .send({ from: accounts[2] });

    const addressCampaign = (await RelieferFactory.methods.getCampaigns().call())[0];

    const RelieferCampaign = new web3.eth.Contract(attifactRelieferCampaign.abi, addressCampaign);

    // test requestToken
    // await RelieferFactory.methods.requestToken(web3.utils.toWei("1", "ether")).send({ from: accounts[0] });
    // console.log("requestToken Done");

    return {
      RelieferToken: RelieferToken,
      RelieferValidator: RelieferValidator,
      RelieferFactory: RelieferFactory,
      RelieferCampaign: RelieferCampaign,
    };
  };

  // setup
  before(async function () {
    accounts = await web3.eth.getAccounts();
    deployer = accounts[0];
    validator = accounts[1];
    campaigner = accounts[2];
    user = accounts[3];

    attifactRelieferValidator = await artifacts.readArtifact("RelieferValidate");
    attifactRelieferToken = await artifacts.readArtifact("RelieferToken");
    attifactRelieferCampaign = await artifacts.readArtifact("RelieferCampaign");
    attifactRelieferFactory = await artifacts.readArtifact("RelieferFactory");

    const { RelieferToken, RelieferValidator, RelieferFactory, RelieferCampaign } = await getMainContract();
    MainRelieferToken = RelieferToken;
    MainRelieferValidator = RelieferValidator;
    MainRelieferFactory = RelieferFactory;
    MainRelieferCampaign = RelieferCampaign;
  });

  it("4.1 NOTSTARTED phase - user cannot register", async function () {
    try {
      await MainRelieferCampaign.methods.user_joinCampaign().send({ from: user });
      expect(true).to.be.false;
    } catch {
      expect(true).to.be.true;
    }
  });

  it("4.2 NOTSTARTED phase - campaigner can change status to START_JOIN", async function () {
    try {
      await MainRelieferCampaign.methods.startJoinCampaign().send({ from: campaigner });
      const status = await MainRelieferCampaign.methods.status().call();
      expect(status).to.be.equal("1");
    } catch {
      expect(false).to.be.true;
    }
  });

  it("4.3 START_JOIN phase - user can register", async function () {
    try {
      await MainRelieferCampaign.methods.user_joinCampaign().send({ from: user });
      const userAddress = await MainRelieferCampaign.methods.get_allUsers().call();
      expect(userAddress[0]).to.be.equal(user);
      // expect(true).to.be.true;
    } catch (err) {
      console.log(err);
      expect(true).to.be.false;
    }
  });

  it("4.4 START_JOIN phase - user can register at max user : 1", async function () {
    try {
      await MainRelieferCampaign.methods.user_joinCampaign().send({ from: accounts[4] });
      expect(true).to.be.false;
    } catch (err) {
      expect(true).to.be.true;
    }
  });

  it("4.5 START_JOIN phase - campaigner can change status to END_JOIN", async function () {
    try {
      await MainRelieferCampaign.methods.endJoinCampaign().send({ from: campaigner });
      const status = await MainRelieferCampaign.methods.status().call();
      expect(status).to.be.equal("2");
    } catch {
      expect(false).to.be.true;
    }
  });

  it("4.6 END_JOIN phase - user cannot register (change MaxUser to 2 before)", async function () {
    try {
      await MainRelieferCampaign.methods.setMaxUser(2).send({ from: campaigner });
      await MainRelieferCampaign.methods.user_joinCampaign().send({ from: accounts[5] });
      expect(false).to.be.true;
    } catch {
      await MainRelieferCampaign.methods.setMaxUser(1).send({ from: campaigner });
      expect(true).to.be.true;
    }
  });

  it("4.7 START_JOIN phase - campaigner can change status to STARTED_CAMPAIGN", async function () {
    try {
      await MainRelieferCampaign.methods.startCampaign().send({ from: campaigner });
      const status = await MainRelieferCampaign.methods.status().call();
      expect(status).to.be.equal("3");
    } catch {
      expect(false).to.be.true;
    }
  });

  it("4.8 STARTED_CAMPAIGN phase - user can join campaign", async function () {
    try {
      await MainRelieferCampaign.methods.user_startCampaign().send({ from: user });
      // const getTime = await MainRelieferCampaign.methods.get_userStartTime(user).call();
      expect(true).to.be.true;
    } catch (err) {
      expect(false).to.be.true;
    }
  });

  it("4.9 START_JOIN phase - campaigner can change status to END_CAMPAIGN", async function () {
    try {
      await MainRelieferCampaign.methods.endCampaign().send({ from: campaigner });
      const status = await MainRelieferCampaign.methods.status().call();
      expect(status).to.be.equal("4");
    } catch {
      expect(false).to.be.true;
    }
  });

  it("4.10 END_CAMPAIGN phase - user can finish campaign", async function () {
    try {
      await MainRelieferCampaign.methods.user_endCampaign().send({ from: user });
      const get_userStartTime = await MainRelieferCampaign.methods.get_userStartTime(user).call();
      const get_userEndTime = await MainRelieferCampaign.methods.get_userEndTime(user).call();
      console.log("duration = ", get_userEndTime - get_userStartTime);

      expect(true).to.be.true;
    } catch (err) {
      // console.log(err);
      expect(false).to.be.true;
    }
  });

  it("4.11 END_CAMPAIGN phase - campaigner calculate token amount to wait tranfer to user", async function () {
    try {
      await MainRelieferCampaign.methods.calculateCampaign().send({ from: campaigner });
      const status = await MainRelieferCampaign.methods.status().call();
      // const balance = await MainRelieferToken.methods.balanceOf(MainRelieferCampaign.options.address).call();
      // console.log({ balance });
      // expect(balance).to.be.equal(web3.utils.toWei("1", "gwei"));
      expect(status).to.be.equal("5");
    } catch (err) {
      console.log(err);
      expect(false).to.be.true;
    }
  });

  it("4.12 SUCCESS phase - campaigner mint reward", async function () {
    try {
      await MainRelieferCampaign.methods.mintReward().send({ from: campaigner });
      const status = await MainRelieferCampaign.methods.status().call();
      expect(status).to.be.equal("6");
    } catch (err) {
      console.log(err);
      expect(false).to.be.true;
    }
  });

  it("4.13 USER CLAIM TOKEN REWARD", async function () {
    try {
      const balance = await MainRelieferToken.methods.balanceOf(user).call();
      await MainRelieferCampaign.methods.user_claim().send({ from: user });
      const balanceAfter = await MainRelieferToken.methods.balanceOf(user).call();
      console.log({ balance, balanceAfter });
      expect(balanceAfter).to.be.equal(web3.utils.toWei("1", "gwei"));
    } catch (err) {
      console.log(err);
      expect(false).to.be.true;
    }
  });
});
