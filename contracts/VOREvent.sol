// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract VOREvent is ERC721 {
    enum EventState {
        PLANNED,
        STARTED,
        ENDED
    }

    enum BadgeState {
        NONE,
        UNASSIGNED,
        SENT,
        ACCEPTED,
        REJECTED
    }

    struct Badge {
        BadgeState state;
        address recipient;
        string name;
        string description;
    }

    mapping(uint256 => Badge) private badges;

    string public description;
    address public issuer;
    EventState public state;
    uint256 startedTime;
    uint256 endedTime;

    constructor(
        string memory _name,
        string memory _description,
        address _issuer
    ) ERC721(_name, "VORB") {
        description = _description;
        issuer = _issuer;
        state = EventState.PLANNED;
    }

    function addBadge(
        string memory _name,
        string memory _description,
        uint256 _tokenId
    ) public {
        require(msg.sender == issuer, "Only organizer can add badge");
        require(state == EventState.PLANNED, "Event is already started");
        Badge memory badge = Badge({
            state: BadgeState.UNASSIGNED,
            recipient: address(0),
            name: _name,
            description: _description
        });
        badges[_tokenId] = badge;
        _safeMint(msg.sender, _tokenId);
    }

    function burn(uint256 _tokenId) public {
        require(state == EventState.ENDED, "Event must be ended");
        require(
            badges[_tokenId].state == BadgeState.ACCEPTED,
            "Badge is in invalid state"
        );
        require(
            msg.sender == badges[_tokenId].recipient || msg.sender == issuer,
            "Only organizer or recepient can burn badge"
        );
        _burn(_tokenId);
        Badge memory zero;
        badges[_tokenId] = zero;
    }

    function removeBadge(uint256 _tokenId) public {
        require(msg.sender == issuer, "Only organizer can remove badge");
        require(state == EventState.PLANNED, "Event is already started");
        require(badges[_tokenId].state != BadgeState.NONE, "Badge not found");
        _burn(_tokenId);
        Badge memory zero;
        badges[_tokenId] = zero;
    }

    function award(address _to, uint256 _tokenId) public {
        require(msg.sender == issuer, "Only organizer can award badge");
        require(_to != issuer, "Cannot award badge to organizer");
        require(state == EventState.ENDED, "Event is not ended yet");
        require(
            badges[_tokenId].state == BadgeState.UNASSIGNED,
            "Badge is in invalid state"
        );
        badges[_tokenId].recipient = _to;
        badges[_tokenId].state = BadgeState.SENT;
    }

    function accept(uint256 _tokenId) public {
        require(
            msg.sender == badges[_tokenId].recipient,
            "Only recipient can accept badge"
        );
        require(
            badges[_tokenId].state == BadgeState.SENT,
            "Badge is in invalid state"
        );
        badges[_tokenId].state = BadgeState.ACCEPTED;
        _safeTransfer(issuer, msg.sender, _tokenId, "");
    }

    function reject(uint256 _tokenId) public {
        require(
            msg.sender == badges[_tokenId].recipient,
            "Only recipient can reject badge"
        );
        require(
            badges[_tokenId].state == BadgeState.SENT,
            "Badge is in invalid state"
        );
        badges[_tokenId].state = BadgeState.REJECTED;
    }

    function startEvent() public {
        require(msg.sender == issuer, "Only organizer can start event");
        require(
            state == EventState.PLANNED,
            "Only planned event can be started"
        );
        state = EventState.STARTED;
        startedTime = block.timestamp;
    }

    function endEvent() public {
        require(msg.sender == issuer, "Only organizer can start event");
        require(state == EventState.STARTED, "Only started event can be ended");
        state = EventState.ENDED;
        endedTime = block.timestamp;
    }

    function _beforeTokenTransfer(
        address _from,
        address _to,
        uint256 _tokenId
    ) internal override {
        require(
            // burn
            (_to == address(0) &&
                _from == issuer &&
                badges[_tokenId].state == BadgeState.UNASSIGNED) ||
                (_to == address(0) &&
                    _from == badges[_tokenId].recipient &&
                    badges[_tokenId].state == BadgeState.ACCEPTED) ||
                // mint
                (_from == address(0) &&
                    _to == issuer &&
                    badges[_tokenId].state == BadgeState.UNASSIGNED) ||
                // award
                (_to != issuer &&
                    _from == issuer &&
                    state == EventState.ENDED &&
                    badges[_tokenId].state == BadgeState.ACCEPTED),
            "Invalid transfer"
        );
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
        require(_exists(_tokenId), "URI query for nonexistent token");
        string memory currentBaseURI = _baseURI();
        return
            string(
                abi.encodePacked(currentBaseURI, Strings.toString(_tokenId))
            );
    }
}
