// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

enum STATUS_ENUM {NOTSTARTED,START_JOIN,END_JOIN, STARTED_CAMPAIGN, END_CAMPAIGN,CLAIM}
enum USER_STATUS_ENUM {NOT_JOIN,JOIN,STARTED_CAMPAIGN, END_CAMPAIGN,CLAIM,FALSE_RULE}

contract RelieferCampaign is Ownable {

  constructor (uint256 _startTime, uint256 _endTime, uint256 _durationToEarn, uint256 _rewardTokenAmount, address _rewardToken){
    startTime = _startTime;
    endTime = _endTime;
    durationToEarn = _durationToEarn;
    rewardTokenAmount = _rewardTokenAmount;
    rewardToken = IERC20(_rewardToken);
  }

  uint256 startTime;
  uint256 endTime;
  uint256 durationToEarn;

  STATUS_ENUM status = STATUS_ENUM.NOTSTARTED;

  uint256 public totalTokenAmount = 0;
  uint256 rewardTokenAmount;
  IERC20 rewardToken;

  address[] users;
  mapping(address => USER_STATUS_ENUM) public userStatus;
  mapping(address => uint256) public userStartTime;
  mapping(address => uint256) public userEndTime;

  function setStartTime(uint256 _startTime) external onlyOwner {
    startTime = _startTime;
  }

  function setEndTime(uint256 _endTime) external onlyOwner {
    endTime = _endTime;
  }

  function setDurationToEarn(uint256 _durationToEarn) external onlyOwner {
    durationToEarn = _durationToEarn;
  }

  function setRewardTokenAmount(uint256 _rewardTokenAmount) external onlyOwner {
    rewardTokenAmount = _rewardTokenAmount;
  }

  function setRewardToken(address _rewardToken) external onlyOwner {
    rewardToken = IERC20(_rewardToken);
  }


  function startJoinCampaign() external onlyOwner {
    require(status == STATUS_ENUM.NOTSTARTED, "already start");
    status = STATUS_ENUM.START_JOIN;
  }

  function endJoinCampaign() external onlyOwner {
    require(status == STATUS_ENUM.START_JOIN, "not start joining time");
    status = STATUS_ENUM.END_JOIN;
  }

  function startCampaign() external onlyOwner {
    require(status == STATUS_ENUM.END_JOIN, "not end joining time");
    status = STATUS_ENUM.STARTED_CAMPAIGN;
  }

  function endCampaign() external onlyOwner {
    require(status == STATUS_ENUM.STARTED_CAMPAIGN, "not start campaign time");
    status = STATUS_ENUM.END_CAMPAIGN;
  }

  function caimCampaignTime() external onlyOwner {
    require(status == STATUS_ENUM.END_CAMPAIGN, "not end campaign time");

    for (uint256 i = 0; i < users.length; i++) {
      if (userEndTime[users[i]] - userStartTime[users[i]] >= durationToEarn) {
        totalTokenAmount+=rewardTokenAmount;
        userStatus[users[i]] = USER_STATUS_ENUM.CLAIM;
      }else{
        userStatus[users[i]] = USER_STATUS_ENUM.FALSE_RULE;
      }
    }

    status = STATUS_ENUM.CLAIM;
  }

  function user_joinCampaign() external {
    require(status == STATUS_ENUM.START_JOIN, "not start joining time");
    require(userStatus[msg.sender] == USER_STATUS_ENUM.NOT_JOIN, "already join");
    userStatus[msg.sender] = USER_STATUS_ENUM.JOIN;
    users.push(msg.sender);
  }

  function user_startCampaign() external {
    require(status == STATUS_ENUM.STARTED_CAMPAIGN, "not start campaign time");
    require(userStatus[msg.sender] == USER_STATUS_ENUM.JOIN, "not join");
    userStatus[msg.sender] = USER_STATUS_ENUM.STARTED_CAMPAIGN;
    userStartTime[msg.sender] = block.timestamp;
  }

  function user_endCampaign() external {
    require(status == STATUS_ENUM.END_CAMPAIGN, "not end campaign time");
    require(userStatus[msg.sender] == USER_STATUS_ENUM.JOIN, "not join campaign");
    userStatus[msg.sender] = USER_STATUS_ENUM.END_CAMPAIGN;
    userEndTime[msg.sender] = block.timestamp;
  }

  function user_claim() external {
    require(status == STATUS_ENUM.CLAIM, "not claim time");
    require(userStatus[msg.sender] == USER_STATUS_ENUM.CLAIM, "not claim");
    rewardToken.transfer(msg.sender, rewardTokenAmount);
  }

  function get_allUsers() external view returns (address[] memory) {
    return users;
  }
  
  function get_userStartTime(address _user) external view returns (uint256) {
    return userStartTime[_user];
  }

  function get_userEndTime(address _user) external view returns (uint256) {
    return userEndTime[_user];
  }

  function get_userStatus(address _user) external view returns (USER_STATUS_ENUM) {
    return userStatus[_user];
  }

  function get_status() external view returns (STATUS_ENUM) {
    return status;
  }

  function get_allUsersAndStatus() external view returns (address[] memory, USER_STATUS_ENUM[] memory) {
    USER_STATUS_ENUM[] memory _userStatus = new USER_STATUS_ENUM[](users.length);
    for (uint256 i = 0; i < users.length; i++) {
      _userStatus[i] = userStatus[users[i]];
    }
    return (users, _userStatus);
  }

}



interface IRelieferCampaign {
  function setStartTime(uint256 _startTime) external;
  function setEndTime(uint256 _endTime) external;
  function setDurationToEarn(uint256 _durationToEarn) external;
  function setRewardTokenAmount(uint256 _rewardTokenAmount) external;
  function setRewardToken(address _rewardToken) external;
  function startJoinCampaign() external;
  function endJoinCampaign() external;
  function startCampaign() external;
  function endCampaign() external;
  function caimCampaignTime() external;
  function user_joinCampaign() external;
  function user_startCampaign() external;
  function user_endCampaign() external;
  function user_claim() external;
  function get_allUsers() external view returns (address[] memory);
  function get_userStartTime(address _user) external view returns (uint256);
  function get_userEndTime(address _user) external view returns (uint256);
  function get_userStatus(address _user) external view returns (USER_STATUS_ENUM);
  function get_status() external view returns (STATUS_ENUM);
  function get_allUsersAndStatus() external view returns (address[] memory, USER_STATUS_ENUM[] memory);
}