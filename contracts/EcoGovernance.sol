// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IEcoPass {
    function balanceOf(address owner) external view returns (uint256);
}

contract EcoGovernance is Ownable {
    IEcoPass public nftPass;

    struct Proposal {
        string description;
        uint256 voteCount;
        bool executed;
    }

    Proposal[] public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    constructor(address _nftPass) Ownable(msg.sender) {
        nftPass = IEcoPass(_nftPass);
    }

    modifier onlyMember() {
        require(nftPass.balanceOf(msg.sender) > 0, "Necessario NFT EcoPass");
        _;
    }

    function createProposal(string memory _description) external onlyMember {
        proposals.push(Proposal({description: _description, voteCount: 0, executed: false}));
    }

    function vote(uint256 _proposalId) external onlyMember {
        require(!hasVoted[_proposalId][msg.sender], "Ja votou");
        proposals[_proposalId].voteCount += 1;
        hasVoted[_proposalId][msg.sender] = true;
    }
}