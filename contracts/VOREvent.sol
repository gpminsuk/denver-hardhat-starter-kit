// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VORBadge.sol";

contract VOREvent {
    string public name;
    string public description;
    address public organizer;
    uint256 public startDate;
    uint256 public endDate;
    VORBadge[] public badges;

    constructor(
        string memory _name,
        string memory _description,
        address _organizer,
        uint256 _startDate,
        uint256 _endDate
    ) {
        name = _name;
        description = _description;
        organizer = _organizer;
        startDate = _startDate;
        endDate = _endDate;
    }

    function addBadge(string memory _name, string memory _description) public {
        require(msg.sender == organizer, "Only organizer can add badge");
        VORBadge badge = new VORBadge(_name, _description, organizer);
        badges.push(badge);
    }

    function removeBadge(uint256 _index) public {
        require(msg.sender == organizer, "Only organizer can remove badge");
        require(_index < badges.length, "Index out of bounds.");
        badges[_index] = badges[badges.length - 1];
        badges.pop();
    }

    function getBadges() public view returns (VORBadge[] memory) {
        return badges;
    }

    function getBadgeCount() public view returns (uint256) {
        return badges.length;
    }
}
