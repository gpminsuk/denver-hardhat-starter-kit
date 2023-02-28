const { network, ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

const recepient1 = "0x7427eec5Ac7681d0AB9A1bF5d221dfE77cAE454a";
const recepient2 = "0x71633bE32E07dB4a645CE85418D64484B39AB692";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("VORBadge unit test", async function () {
      async function deployContract() {
        const [deployer] = await ethers.getSigners();
        const factory = await ethers.getContractFactory("VORBadge");
        const contract = await factory.deploy(
          "name",
          "description",
          deployer.address
        );
        await contract.deployed();
        return contract;
      }

      it.only("should deploy the contract", async () => {
        const [deployer] = await ethers.getSigners();
        const contract = await loadFixture(deployContract);
        console.log(contract.address);
        console.log(await contract.state());
        await contract.transferFrom(deployer.address, recepient1, 1);
        //await contract.transferFrom(deployer.address, recepient2, 1)
        assert.ok(contract.address);
      });
    });
