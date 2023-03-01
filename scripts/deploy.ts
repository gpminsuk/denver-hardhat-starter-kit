const { network, ethers } = require("hardhat");

async function main() {
  const c = await ethers.getContractFactory("VOREvent");
  const contract = await c.deploy(
    "Chess tournament",
    "The Bear Creek school 2nd grade chess tournament",
    "0x71633bE32E07dB4a645CE85418D64484B39AB692"
  );
  console.log("Contract deployed to address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
