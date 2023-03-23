// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./RelieferCampaign.sol";
import "./RelieferToken.sol";
import "./RelieferValidate.sol";


contract RelieferFactory is Ownable {
  RelieferToken public token;
  RelieferValidate public validate;
  address[] public campaigns;
  mapping(address => bool) public isCampaign;

  constructor (address _token, address _validate) {
    token = RelieferToken(_token);
    validate = RelieferValidate(_validate);
  }

  function createCampaign(uint256 _startTime, uint256 _endTime, uint256 _durationToEarn, uint256 _rewardTokenAmount, address _rewardToken) external onlyOwner {
    RelieferCampaign campaign = new RelieferCampaign(_startTime, _endTime, _durationToEarn, _rewardTokenAmount, _rewardToken);
    campaigns.push(address(campaign));
    isCampaign[address(campaign)] = true;
  }

  function getCampaigns() external view returns (address[] memory) {
    return campaigns;
  }

  function setToken(address _token) external onlyOwner {
    token = RelieferToken(_token);
  }

  function setValidate(address _validate) external onlyOwner {
    validate = RelieferValidate(_validate);
  }
}