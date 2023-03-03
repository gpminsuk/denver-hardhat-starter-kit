const { network, ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { developmentChains } = require("../../helper-hardhat-config");
const { expect } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("VOREvent unit test", async function () {
      async function deployContract() {
        console.log((await ethers.provider.getBlock("latest")).number);
        const [deployer] = await ethers.getSigners();
        const factory = await ethers.getContractFactory("VOREvent");
        const contract = await factory.deploy(
          "Chess tournament",
          "The Bear Creek school 2nd grade chess tournament",
          deployer.address
        );
        await contract.deployed();
        return contract;
      }

      it("Test VOREvent contract", async () => {
        const [deployer, recepient1, recepient2] = await ethers.getSigners();
        const contract = await loadFixture(deployContract);

        // cannot award badges before it's created
        await expect(contract.award(recepient1.address, 1)).to.be.revertedWith(
          "Badge is in invalid state"
        );

        // can add badges
        await contract.addBadges(
          ["1st place", "2nd place", "3rd place"],
          [
            "Prize for the first place",
            "Prize for the second place",
            "Prize for the third place",
          ],
          [1, 2, 3]
        );

        // can remove badge that exists
        await contract.removeBadges([3]);

        await expect(
          contract.addBadges(["3rd place"], ["Prize for the third place"], [2])
        ).to.be.revertedWith("Badge already exists");

        // cannot award badges to organizer
        await expect(contract.award(deployer.address, 1)).to.be.revertedWith(
          "Cannot award badge to organizer"
        );

        // award badges
        await contract.award(recepient1.address, 1);
        await contract.award(recepient1.address, 2);

        // cannot award a badge twice
        await expect(contract.award(recepient2.address, 2)).to.be.revertedWith(
          "Badge is in invalid state"
        );

        // cannot award a badge that does not exist
        await expect(contract.award(recepient2.address, 3)).to.be.revertedWith(
          "Badge is in invalid state"
        );

        // cannot accept if not awarded
        await expect(contract.accept(1)).to.be.revertedWith(
          "Only recipient can accept badge"
        );

        // cannot reject if not awarded
        await expect(contract.reject(1)).to.be.revertedWith(
          "Only recipient can reject badge"
        );

        // accept badge 1
        await contract.connect(recepient1).accept(1);

        // cannot accept accepted badge
        await expect(contract.connect(recepient1).accept(1)).to.be.revertedWith(
          "Badge is in invalid state"
        );

        // cannot reject accepted badge
        await expect(contract.connect(recepient1).reject(1)).to.be.revertedWith(
          "Badge is in invalid state"
        );

        // reject reward 2
        await contract.connect(recepient1).reject(2);

        // cannot accept rejected badge
        await expect(contract.connect(recepient1).accept(2)).to.be.revertedWith(
          "Badge is in invalid state"
        );

        // cannot reject rejected badge
        await expect(contract.connect(recepient1).reject(2)).to.be.revertedWith(
          "Badge is in invalid state"
        );

        // burn accepted badge
        await contract.connect(recepient1).burn(1);

        // cannot burn rejected badge
        await expect(contract.connect(recepient1).burn(2)).to.be.revertedWith(
          "Badge is in invalid state"
        );

        // cannot burn badge that does not exist
        await expect(contract.connect(recepient1).burn(3)).to.be.revertedWith(
          "Badge is in invalid state"
        );
      });
    });
