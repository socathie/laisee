// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721Enumerable, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
/**
 * @title Laisee
 * @dev This contract is a simple ERC721 contract that mint a token with an ETH deposit such that the receipient can withdraw the ETH at any time
 */
contract Laisee is ERC721Enumerable {
    mapping(uint256 => uint256) public laiseeBalances;

    constructor() ERC721("Laisee", "LS") {}

    /**
     * @dev Mint a token to a destination address with an ETH deposit
     * @param to The address to mint the token to
     */
    function mint(address to) public payable {
        // optional if you want to allow empty laisee
        // require(msg.value > 0, "You need to send some ETH");
        uint256 tokenId = totalSupply() + 1;
        // optional if you want the token to appear to be transferred from the sender
        _safeMint(msg.sender, tokenId);
        _safeTransfer(msg.sender, to, tokenId, "");
        laiseeBalances[tokenId] = msg.value;
    }

    /**
     * @dev Withdraw the ETH deposit from all tokens owned by the sender
     */
    function withdrawAll() public {
        require(balanceOf(msg.sender) > 0, "Laisee: caller has no laisee");
        uint256 amount;
        for (uint256 i = 0; i < balanceOf(msg.sender); i++) {
            uint256 tokenId = tokenOfOwnerByIndex(msg.sender, i);
            amount += laiseeBalances[tokenId];
            laiseeBalances[tokenId] = 0;
        }
        require(amount > 0, "Laisee: caller has no balance");
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Laisee: withdrawal failed");
    }

    /**
     * @notice totally optional, but you can add a function to withdraw by token ID
     * @dev Alternative function to withdraw by token ID
     * @param tokenId The token ID to withdraw from
     */
    function withdraw(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Laisee: caller is not owner");
        require(laiseeBalances[tokenId] > 0, "Laisee: token has no balance");
        uint256 amount = laiseeBalances[tokenId];
        laiseeBalances[tokenId] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Laisee: withdrawal failed");
    }

    /**
     * @dev Allow reuse of token by depositing more ETH and sending it to a new owner
     * @param tokenId The token ID to share the love from
     * @param to The address to send the token to
     */
    function shareTheLove(uint256 tokenId, address to) public payable {
        require(ownerOf(tokenId) == msg.sender, "Laisee: caller is not owner");
        // optional if you want to allow empty laisee
        // require(msg.value > 0, "Laisee: You need to send some ETH");
        laiseeBalances[tokenId] += msg.value;
        _safeTransfer(msg.sender, to, tokenId, "");
    }

    /**
     * @dev Override the _baseURI function to return the base URI for the token
     * @notice not implemented
     */
}
