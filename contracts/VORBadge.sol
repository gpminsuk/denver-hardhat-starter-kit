// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract VORBadge is ERC721 {
    enum State {
        UNASSIGNED,
        ASSIGNED
    }

    string public description;
    State public state;
    address public issuer;
    address public recipient;
    uint256 constant defaultTokenId = 1;

    constructor(
        string memory _name,
        string memory _description,
        address _issuer
    ) ERC721(_name, "VORB") {
        description = _description;
        state = State.UNASSIGNED;
        issuer = _issuer;
        _safeMint(_issuer, defaultTokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        require(state == State.UNASSIGNED, "VORBadge: Badge is soulbound.");
        if (to != issuer) {
            state = State.ASSIGNED;
        }
        super._beforeTokenTransfer(from, to, tokenId);
    }
}
