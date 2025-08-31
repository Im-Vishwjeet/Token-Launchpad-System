import { computeTickPrice } from "../deploy/utils";

async function main() {
  const ethPrice = 4500;

  const launchTick = computeTickPrice(5000, ethPrice, 18, 200);
  const graduationTick = computeTickPrice(69000, ethPrice, 18, 200);
  const upperMaxTick = 886000;

  console.log("launchTick", launchTick);
  console.log("graduationTick", graduationTick);
  console.log("upperMaxTick", upperMaxTick);
}

main().catch(console.error);
