const { network, ethers } = require("hardhat");

async function main() {
  const c = await ethers.getContractFactory("VOREvent");
  const contract = await c.deploy(
    "Chess tournament",
    "The Bear Creek school 2nd grade chess tournament",
    "0xfb9ae3e7dfd0a6ef5f1b57850f932d0943ca6da8"
  );
  console.log("Contract deployed to address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
