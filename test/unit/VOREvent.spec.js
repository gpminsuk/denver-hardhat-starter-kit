const { network, ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("VOREvent unit test", async function () {
      async function deployMyAwesomeContract() {
        const myAwesomeContractFactory = await ethers.getContractFactory(
          "MyAwesomeHackathonContract"
        );
        const myAwesomeContract = await myAwesomeContractFactory.deploy(3);
        await myAwesomeContract.deployed();
        return myAwesomeContract;
      }

      it.only("should deploy the contract", async () => {
        console.log(
          await network.provider,
          await ethers.provider.getBlockNumber()
        );
        const myAwesomeContract = await loadFixture(deployMyAwesomeContract);
        console.log(await myAwesomeContract.number());
        await myAwesomeContract.dummy();
        console.log(await myAwesomeContract.number());
        assert.ok(myAwesomeContract.address);
      });
    });
