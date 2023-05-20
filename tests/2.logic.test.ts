import { expect } from "chai";
import { artifacts, ethers, web3 } from "hardhat";
import { Artifact } from "hardhat/types";
import { deployContract } from "../shared/Contracts";
import { Contract } from "web3-eth-contract";

describe("2. Business Logic Test", function () {
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

  it("2.1 can view token address and validator address in Factory contract", async function () {
    const { RelieferToken, RelieferValidator, RelieferFactory } = await getMainContract();

    const tokenAddress = await RelieferFactory.methods.token().call();
    const validatorAddress = await RelieferFactory.methods.validator().call();

    expect(tokenAddress).to.equal(RelieferToken.options.address);
    expect(validatorAddress).to.equal(RelieferValidator.options.address);
  });

  it("2.2 only set factory address to validator contract at once time", async function () {
    const { RelieferToken, RelieferValidator, RelieferFactory } = await getMainContract();

    await RelieferValidator.methods.setFactory(RelieferFactory.options.address).send({ from: deployer });

    // get factory address from validator contract
    const factoryAddress = await RelieferValidator.methods.factory().call();
    try {
      const newFac = await deployContract(attifactRelieferFactory, deployer, [
        RelieferToken.options.address,
        RelieferValidator.options.address,
      ]);
      await RelieferValidator.methods.setFactory(newFac.options.address).send({ from: deployer });
      expect(false).to.equal(true);
    } catch {
      expect(factoryAddress === RelieferFactory.options.address).to.equal(true);
    }
    // expect(false).to.equal(true);
  });

  it("2.3 only owner can add validator address (account) (only set factory first send from only factory contract)", async function () {
    const { RelieferToken, RelieferValidator, RelieferFactory } = await getMainContract();

    // check is validator before add
    let isValidator = await RelieferValidator.methods.isValidator(accounts[1]).call();
    expect(isValidator).to.equal(false);

    isValidator = await RelieferValidator.methods.isValidator(accounts[1]).call();
    expect(isValidator).to.equal(false);

    // only Owner
    try {
      await RelieferValidator.methods.addValidator(accounts[1]).send({ from: accounts[1] });
      expect(false).to.equal(true);
    } catch {
      expect(true).to.equal(true);
    }

    try {
      // check is validator after add but not add factory contract to validator contract
      await RelieferFactory.methods.addValidator(accounts[1]).send({ from: deployer });
      isValidator = await RelieferFactory.methods.isValidator(accounts[1]).call();
      expect(isValidator).to.equal(true);
    } catch {
      try {
        // check only factory contract can add validator
        await RelieferFactory.methods.addValidator(accounts[1]).send({ from: deployer });
        isValidator = await RelieferValidator.methods.isValidator(accounts[1]).call();
        expect(isValidator).to.equal(true);
      } catch (error) {
        expect(true).to.equal(true);
      }
    }

    // // add factory contract to validator contract
    await RelieferValidator.methods.setFactory(RelieferFactory.options.address).send({ from: deployer });

    // console.log("factory adress :", await RelieferValidator.methods.factory().call());

    // // check is validator after add but not add factory contract to validator contract
    await RelieferFactory.methods.addValidator(accounts[1]).send({ from: deployer });
    isValidator = await RelieferFactory.methods.isValidator(accounts[1]).call();
    expect(isValidator).to.equal(true);
  });
});
