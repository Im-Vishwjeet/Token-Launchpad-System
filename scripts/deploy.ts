import { deployTokenSimple } from "../deploy/mainnet-template";
import { computeTickPrice } from "../deploy/utils";
import { deployContract, deployProxy, waitForTx } from "./utils";
import { formatEther, parseEther, ZeroAddress } from "ethers";

import hre from "hardhat";

async function main() {
  const deployer = "0x8EfeFDBe3f3f7D48b103CD220d634CBF1d0Ae1a6";
  const wethAddressOnLinea = "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f";
  const odosAddressOnLinea = "0x2d8879046f1559E53eb052E949e9544bCB72f414";

  const currSomethingPrice = 0.001;

  const proxyAdmin = await deployContract(
    hre,
    "ProxyAdmin",
    [deployer],
    "ProxyAdmin",
    deployer
  );

  // Deploy SOMETHING token
  const somethingD = await deployContract(
    hre,
    "SomeMasterToken",
    [],
    "somETHing",
    deployer
  );

  console.log("SomeMasterToken contract deployed at:", somethingD.address);

  const launchpadD = await deployProxy(
    hre,
    "TokenLaunchpadLinea",
    [deployer, somethingD.address, wethAddressOnLinea],
    proxyAdmin.address,
    "TokenLaunchpadLinea",
    deployer,
    true
  );

  const adapterD = await deployProxy(
    hre,
    "RamsesAdapter",
    [
      launchpadD.address,
      "0x8BE024b5c546B5d45CbB23163e1a4dca8fA5052A",
      "0xA04A9F0a961f8fcc4a94bCF53e676B236cBb2F58",
      "0xAe334f70A7FC44FCC2df9e6A37BC032497Cf80f1",
    ],
    proxyAdmin.address,
    "RamsesAdapter"
  );

  const adapter = await hre.ethers.getContractAt(
    "ICLMMAdapter",
    adapterD.address
  );

  const launchpad = await hre.ethers.getContractAt(
    "TokenLaunchpadLinea",
    launchpadD.address
  );

  if ((await launchpad.cron()) == ZeroAddress) {
    await waitForTx(
      await launchpad.initialize(deployer, somethingD.address, adapter.target)
    );
  }

  const uiHelperD = await deployContract(
    hre,
    "UIHelper",
    [wethAddressOnLinea, odosAddressOnLinea, launchpadD.address],
    "UIHelper"
  );

  const uiHelper = await hre.ethers.getContractAt(
    "UIHelper",
    uiHelperD.address
  );

  // Set default value parameters
  const launchTick = computeTickPrice(5000, currSomethingPrice, 18, 200);
  const graduationTick = computeTickPrice(69000, currSomethingPrice, 18, 200);
  const upperMaxTick = 886000;
  if ((await launchpad.launchTick()) != BigInt(launchTick)) {
    await waitForTx(
      await launchpad.setLaunchTicks(launchTick, graduationTick, upperMaxTick)
    );
    console.log("Default value parameters set successfully!");
  }

  const token = await hre.ethers.getContractAt("SomeToken", somethingD.address);
  const launchpadBalance = await token.balanceOf(launchpad.target);
  if (launchpadBalance == 0n) {
    await waitForTx(
      await token.transfer(launchpad.target, parseEther("10000"))
    );
  }

  // CONTRACTS ARE DEPLOYED; NOW WE CAN LAUNCH A NEW TOKEN

  // setup parameters
  const name = "Test Token1";
  const symbol = "TEST";
  const metadata = JSON.stringify({ image: "https://i.imgur.com/56aQaCV.png" });

  const shouldMock = true;
  if (shouldMock) {
    const token2 = await deployTokenSimple(
      hre,
      uiHelper,
      deployer,
      name,
      symbol,
      metadata,
      somethingD.address,
      launchpad,
      0n
    );

    console.log("Token deployed at", token2.target);
  }
}

main();
