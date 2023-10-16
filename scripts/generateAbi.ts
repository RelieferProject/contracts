import { artifacts, ethers, web3 } from "hardhat";
import fs from "fs";

async function main() {
  await deploy();
}

async function saveJson(object: any, name: string) {
  fs.writeFile(`abi/${name}.json`, JSON.stringify(object), function (err) {
    if (err) throw err;
    console.log("Saved!");
  });
}

async function deploy() {
  const attifactRelieferValidator = await artifacts.readArtifact("RelieferValidate");
  const attifactRelieferToken = await artifacts.readArtifact("RelieferToken");
  const attifactRelieferCampaign = await artifacts.readArtifact("RelieferCampaign");
  const attifactRelieferFactory = await artifacts.readArtifact("RelieferFactory");
  const attifactRelieferFaucet = await artifacts.readArtifact("RelieferFaucet");

  saveJson(attifactRelieferValidator.abi, "RelieferValidate");
  saveJson(attifactRelieferToken.abi, "RelieferToken");
  saveJson(attifactRelieferCampaign.abi, "RelieferCampaign");
  saveJson(attifactRelieferFactory.abi, "RelieferFactory");
  saveJson(attifactRelieferFaucet.abi, "RelieferFaucet");
}

main();
