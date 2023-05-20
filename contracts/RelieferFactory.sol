// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./RelieferCampaign.sol";
import "./RelieferToken.sol";
import "./RelieferValidate.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract RelieferFactory is Ownable {
  RelieferToken public token;
  RelieferValidate public validator;
  address[] public campaigns;
  mapping(address => bool) public isCampaign;

  constructor (address _token, address _validate) {
    token = RelieferToken(_token);
    validator = RelieferValidate(_validate);
  }


  function createCampaign(uint256 _startTime, uint256 _endTime, uint256 _durationToEarn, uint256 _rewardTokenAmount,uint256 _maxUser) external returns (address) {
    require(validator.campaigner(msg.sender), "not campaigner");
    RelieferCampaign campaign = new RelieferCampaign(msg.sender,_startTime, _endTime,_durationToEarn,_rewardTokenAmount,_maxUser, token, validator);
    campaigns.push(address(campaign));
    isCampaign[address(campaign)] = true;
    return address(campaign);
  }

  function getCampaigns() external view returns (address[] memory) {
    return campaigns;
  }

  function addValidator(address _validate) external onlyOwner {
    validator.addValidator(_validate);
  }

  function isValidator(address _validate) external view returns (bool) {
    return validator.isValidator(_validate);
  }

  function addCampaigner(address _campaigner) external onlyOwner {
    validator.grantCampainer(_campaigner);
  }
}