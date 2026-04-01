// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract EcoStaking is ReentrancyGuard, Ownable {
    IERC20 public stakingToken;
    AggregatorV3Interface internal priceFeed;
    
    mapping(address => uint256) public stakingBalance;

    constructor(address _stakingToken, address _priceFeed) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function getLatestPrice() public view returns (int) {
        // Em ambiente local sem Oráculo, isso pode falhar. 
        // Na Sepolia use: 0x694AA1769357215DE4FAC081bf1f309aDC325306
        ( , int price, , , ) = priceFeed.latestRoundData();
        return price;
    }

    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Quantidade invalida");
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        stakingBalance[msg.sender] += _amount;
    }

    function withdraw() external nonReentrant {
        uint256 balance = stakingBalance[msg.sender];
        require(balance > 0, "Sem saldo");
        stakingBalance[msg.sender] = 0;
        stakingToken.transfer(msg.sender, balance);
    }
}