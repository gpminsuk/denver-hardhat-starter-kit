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

        // cannot award badges before the event ends
        await expect(contract.award(recepient1.address, 1)).to.be.revertedWith(
          "Event is not ended yet"
        );

        // can add badges
        await contract.addBadge("1st place", "Prize for the first place", 1);
        await contract.addBadge("2nd place", "Prize for the second place", 2);
        await contract.addBadge("3rd place", "Prize for the third place", 3);

        // cannot remove badge that does not exist
        await expect(contract.removeBadge(4)).to.be.revertedWith(
          "Badge not found"
        );

        // can remove badge that exists
        await contract.removeBadge(3);

        // cannot end event before started
        await expect(contract.endEvent()).to.be.revertedWith(
          "Only started event can be ended"
        );

        // start the event
        await contract.startEvent();

        // cannot start event twice
        await expect(contract.startEvent()).to.be.revertedWith(
          "Only planned event can be started"
        );

        // cannot add badges after the event starts
        await expect(
          contract.addBadge("3rd place", "Prize for the third place", 3)
        ).to.be.revertedWith("Event is already started");

        // cannot remove badges after the event starts
        await expect(contract.removeBadge(3)).to.be.revertedWith(
          "Event is already started"
        );

        // cannot award badges before the event ends
        await expect(contract.award(recepient1.address, 1)).to.be.revertedWith(
          "Event is not ended yet"
        );

        // end the event
        await contract.endEvent();

        // cannot end event twice
        await expect(contract.endEvent()).to.be.revertedWith(
          "Only started event can be ended"
        );

        // cannot start ended event again
        await expect(contract.startEvent()).to.be.revertedWith(
          "Only planned event can be started"
        );

        // cannot add badges after the event starts
        await expect(
          contract.addBadge("3rd place", "Prize for the third place", 3)
        ).to.be.revertedWith("Event is already started");

        // cannot remove badges after the event starts
        await expect(contract.removeBadge(3)).to.be.revertedWith(
          "Event is already started"
        );

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
      });
    });
