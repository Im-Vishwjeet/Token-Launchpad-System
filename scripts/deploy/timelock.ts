import { deployTokenSimple } from "../../deploy/mainnet-template";
import { computeTickPrice } from "../../deploy/utils";
import { deployContract, deployProxy, waitForTx } from "../utils";
import { formatEther, parseEther, ZeroAddress } from "ethers";

import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // uint256 minDelay, address admin, address[] memory proposers
  const minDelay = 86400;
  const admin = deployer.address;
  const proposers = [deployer.address];

  await deployContract(
    hre,
    "SomeTimelock",
    [minDelay, admin, proposers],
    "SomeTimelock"
  );
}

main();
