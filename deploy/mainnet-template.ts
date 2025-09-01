import { HardhatRuntimeEnvironment } from "hardhat/types";
import { deployContract, deployProxy, waitForTx } from "../scripts/utils";
import { roundTickToNearestTick } from "./utils";
import { computeTickPrice } from "./utils";
import { guessTokenAddress } from "../scripts/create2/guess-token-addr";
import {
  ICLMMAdapter,
  ITokenLaunchpad,
  TokenLaunchpad,
  UIHelper,
} from "../types";
import { type } from "os";
import { MaxUint256, parseEther, ZeroAddress } from "ethers";

/**
 * Deploy a simple token on the launchpad
 * @param hre - HardhatRuntimeEnvironment
 * @param adapter - ICLMMAdapter - The adapter to use for the token
 * @param deployer - string - The deployer of the token
 * @param name - string - The name of the token
 * @param symbol - string - The symbol of the token
 * @param metadata - string - The metadata of the token
 * @param fundingToken - string - The funding token of the token
 * @param launchpad - TokenLaunchpad - The launchpad to use for the token
 * @param amountToBuy - bigint - The amount of tokens to buy
 * @returns - WAGMIEToken - The deployed token
 */
export const deployTokenSimple = async (
  hre: HardhatRuntimeEnvironment,
  uiHelper: UIHelper,
  deployer: string,
  name: string,
  symbol: string,
  metadata: string,
  fundingToken: string,
  launchpad: TokenLaunchpad,
  amountToBuy: bigint
) => {
  // get the bytecode for the WAGMIEToken
  const sometoken = await hre.ethers.getContractFactory("SomeToken");

  // guess the salt and computed address for the given token
  const { salt, computedAddress } = await guessTokenAddress(
    launchpad.target,
    sometoken.bytecode, // tokenImpl.target,
    fundingToken,
    uiHelper.target.toString(),
    name,
    symbol
  );

  const params: ITokenLaunchpad.CreateParamsStruct = {
    salt,
    metadata,
    name,
    symbol,
  };

  const odosParams: UIHelper.OdosParamsStruct = {
    tokenIn: fundingToken,
    tokenAmountIn: amountToBuy, // add 1 token to the amount to buy
    odosTokenIn: ZeroAddress,
    odosTokenAmountIn: 0,
    minOdosTokenAmountOut: 0,
    odosTokenOut: ZeroAddress,
    odosData: "0x",
  };

  console.log("Odos params", odosParams);

  const fundingTokenContract = await hre.ethers.getContractAt(
    "IERC20",
    fundingToken
  );
  const allowance = await fundingTokenContract.allowance(
    deployer,
    uiHelper.target
  );
  if (allowance < amountToBuy) {
    await waitForTx(
      await fundingTokenContract.approve(uiHelper.target, MaxUint256)
    );
  }

  console.log("Creating and buying token");
  console.log(
    await uiHelper.createAndBuy.populateTransaction(
      odosParams,
      params,
      ZeroAddress,
      amountToBuy
    )
  );
  // create a launchpad token
  await waitForTx(
    await uiHelper.createAndBuy(odosParams, params, ZeroAddress, amountToBuy)
  );

  console.log("Simple Token deployed at", computedAddress);

  return hre.ethers.getContractAt("SomeToken", computedAddress);
};
