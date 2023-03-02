const { network, ethers } = require("hardhat");

async function main() {
  const c = await ethers.getContractFactory("VOREvent");
  const contract = await c.deploy(
    "Chess tournament",
    "The Bear Creek school 2nd grade chess tournament",
    "0x4a0341c57d4376319857ba382d79e0f67a5e6f8d"
  );
  console.log("Contract deployed to address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
