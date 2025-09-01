import { UIHelper } from "../types";
import { waitForTx } from "./utils";
import { MaxUint256, parseEther, ZeroAddress } from "ethers";
import hre from "hardhat";

async function main() {
  const somethinTokenD = await hre.deployments.get("somETHing");
  const somethinToken = await hre.ethers.getContractAt(
    "SomeMasterToken",
    somethinTokenD.address
  );

  const uiHelperD = await hre.deployments.get("UIHelper");
  const uiHelper = await hre.ethers.getContractAt(
    "UIHelper",
    uiHelperD.address
  );

  const tokenToBuyOrSellD = "0x6d79A6efc47EA9dbCeC0193BF0394f98353d94A1";
  const tokenToBuyOrSell = await hre.ethers.getContractAt(
    "SomeToken",
    tokenToBuyOrSellD
  );

  const isBuy = false;
  if (isBuy) {
    const odosParams: UIHelper.OdosParamsStruct = {
      tokenIn: somethinToken.target,
      tokenAmountIn: parseEther("1"),
      odosTokenIn: ZeroAddress,
      odosTokenAmountIn: 0,
      minOdosTokenAmountOut: 0,
      odosTokenOut: ZeroAddress,
      odosData: "0x",
    };

    // give approval
    await waitForTx(await somethinToken.approve(uiHelper.target, MaxUint256));

    // swap
    await waitForTx(
      await uiHelper.buyWithExactInputWithOdos(
        odosParams, // OdosParams memory _odosParams,
        tokenToBuyOrSell.target, // IERC20 _tokenOut,
        "0" // uint256 _minAmountOut
      )
    );
  } else {
    const odosParams: UIHelper.OdosParamsStruct = {
      tokenIn: ZeroAddress,
      tokenAmountIn: 0,
      odosTokenIn: ZeroAddress,
      odosTokenAmountIn: 0,
      minOdosTokenAmountOut: 0,
      odosTokenOut: ZeroAddress,
      odosData: "0x",
    };

    // give approval
    await waitForTx(
      await tokenToBuyOrSell.approve(uiHelper.target, MaxUint256)
    );

    // sell
    await waitForTx(
      await uiHelper.sellWithExactInputWithOdos(
        odosParams, // OdosParams memory _odosParams,
        tokenToBuyOrSell.target, // IERC20 _tokenIn,
        parseEther("1") // uint256 _amountToSell <- sell
      )
    );
  }
}

main();
