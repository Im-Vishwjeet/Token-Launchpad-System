import { ethers } from "ethers";
import { TokenLaunchpad__factory } from "../../types";

export const guessTokenAddress = async (
  launchpadAddress: string,
  quoteTokenAddress: string,
  deployerAddress: string,
  name: string,
  symbol: string,
  provider: ethers.Provider
) => {
  let i = 0;

  // Create contract instance using deployed contract ABI
  const launchpad = TokenLaunchpad__factory.connect(launchpadAddress, provider);

  while (true) {
    const salt = ethers.id("" + i + Date.now());
    
    try {
      // Use the launchpad's computeTokenAddress function to compute the address
      const [computedAddress, isValid] = await launchpad.computeTokenAddress(
        {
          salt: salt,
          name: name,
          symbol: symbol,
          metadata: ""
        },
        quoteTokenAddress,
        deployerAddress
      );

      if (isValid) {
        console.log("found the right salt hash");
        console.log("salt", salt, computedAddress);
        return { salt, computedAddress };
      }

      if (i % 100000 == 0) console.log(i, "salt", salt, computedAddress);
    } catch (error) {
      console.error("Error calling computeTokenAddress:", error);
      throw error;
    }
    
    i++;
  }
};