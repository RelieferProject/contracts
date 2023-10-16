// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./RelieferToken.sol";

contract RelieferFaucet is Ownable {
  constructor(address _token, uint256 _amountToken, uint256 _amountEth) {
    token = RelieferToken(_token);
    amountToken = _amountToken;
    amountEth = _amountEth;
  }

  mapping(address => bool) public userClaimed;
  RelieferToken token;
  uint256 public amountToken;
  uint256 public amountEth;

  function setToken(RelieferToken _token) external onlyOwner {
    token = _token;
  }

  function setAmountToken(uint256 _amount) external onlyOwner {
    amountToken = _amount;
  }

  function setAmountEth(uint256 _amount) external onlyOwner {
    amountEth = _amount;
  }

  function claim() external {
    require(!userClaimed[msg.sender], "already claimed");
    require(amountToken < token.balanceOf(address(this)), "not enough token");
    require(amountEth < address(this).balance, "not enough eth");
    
    userClaimed[msg.sender] = true;
    token.transfer(msg.sender, amountToken);
    payable(msg.sender).transfer(amountEth);
  }

  function isClaimed(address _user) external view returns (bool) {
    return userClaimed[_user];
  }
}