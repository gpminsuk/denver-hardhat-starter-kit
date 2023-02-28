// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract VOREvent is ERC721 {
    enum EventState {
        DRAFT,
        STARTED,
        ENDED
    }

    enum BadgeState {
        NONE,
        UNASSIGNED,
        ASSIGNED
    }

    struct Badge {
        BadgeState state;
        address recipient;
        string name;
        string description;
    }

    mapping(uint256 => Badge) private badges;

    EventState public state;
    string public description;
    address public issuer;

    constructor(
        string memory _name,
        string memory _description,
        address _issuer
    ) ERC721(_name, "VORB") {
        description = _description;
        issuer = _issuer;
    }

    function addBadge(
        string memory _name,
        string memory _description,
        uint256 _tokenId
    ) public {
        require(msg.sender == issuer, "Only organizer can add badge");
        Badge memory badge = Badge({
            state: BadgeState.UNASSIGNED,
            recipient: address(0),
            name: _name,
            description: _description
        });
        badges[_tokenId] = badge;
    }

    function removeBadge(uint256 _tokenId) public {
        require(msg.sender == issuer, "Only organizer can remove badge");
        require(state == EventState.DRAFT, "Event is already started");
        require(badges[_tokenId].state == BadgeState.NONE, "Badge not found");
        Badge memory zero;
        badges[_tokenId] = zero;
    }

    function mint(address _to, uint256 _tokenId) public {
        require(msg.sender == issuer, "Only organizer can mint badge");
        require(state == EventState.ENDED, "Event is not ended yet");
        require(badges[_tokenId].state == BadgeState.NONE, "Badge not found");
        require(
            badges[_tokenId].state == BadgeState.UNASSIGNED,
            "VORBadge: Badge is already bounded."
        );
        _safeMint(_to, _tokenId);
    }

    function _beforeTokenTransfer(
        address _from,
        address _to,
        uint256 _tokenId
    ) internal override {
        require(_from == issuer, "Only organizer can transfer badge");
        require(state == EventState.ENDED, "Event is not ended yet");
        require(badges[_tokenId].state == BadgeState.NONE, "Badge not found");
        require(
            badges[_tokenId].state == BadgeState.UNASSIGNED,
            "VORBadge: Badge is soulbound."
        );
        if (_to != issuer) {
            badges[_tokenId].recipient = _to;
            badges[_tokenId].state == BadgeState.ASSIGNED;
        }
        super._beforeTokenTransfer(_from, _to, _tokenId);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return "https://ipfs.io/ipfs/";
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(_exists(_tokenId), "VORBadge: URI query for nonexistent token");
        string memory currentBaseURI = _baseURI();
        return
            string(
                abi.encodePacked(currentBaseURI, Strings.toString(_tokenId))
            );
    }
}
