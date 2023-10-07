// deploy

import { ethers, web3 } from "hardhat";
import { Artifact } from "hardhat/types";
import { Contract } from "web3-eth-contract";

const deployContract = async (artifacts: Artifact, from: string, data: any = null): Promise<Contract> => {
  const contract = await new web3.eth.Contract(artifacts.abi)
    .deploy({ data: artifacts.bytecode, arguments: data })
    .send({ from: from });
  return contract;
};

export { deployContract };
