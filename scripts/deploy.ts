const { network, ethers } = require("hardhat");

async function main() {
  const contract = await ethers.getContractFactory("VOREvent");

  const gasPrice = await contract.signer.getGasPrice();
  console.log(`Current gas price: ${gasPrice}`);

  const estimatedGas = await contract.signer.estimateGas(
    contract.getDeployTransaction(
      "Chess tournament",
      "The Bear Creek school 2nd grade chess tournament",
      "0x4A0341c57d4376319857bA382d79E0f67a5E6f8d"
    )
  );
  console.log(`Estimated gas: ${estimatedGas}`);

  const deploymentPrice = gasPrice.mul(estimatedGas);
  const deployerBalance = await contract.signer.getBalance();
  console.log(
    `Deployer balance:  ${ethers.utils.formatEther(deployerBalance)}`
  );
  console.log(
    `Deployment price:  ${ethers.utils.formatEther(deploymentPrice)}`
  );
  if (deployerBalance.lt(deploymentPrice)) {
    throw new Error(
      `Insufficient funds. Top up your account balance by ${ethers.utils.formatEther(
        deploymentPrice.sub(deployerBalance)
      )}`
    );
  }

  const deployedContract = await contract.deploy(
    "Chess tournament",
    "The Bear Creek school 2nd grade chess tournament",
    "0x4A0341c57d4376319857bA382d79E0f67a5E6f8d"
  );
  console.log("Contract deployed to address:", deployedContract.address);
  await deployedContract.deployed();
  console.log("Deployed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
