// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./RelieferValidate.sol";

import "./RelieferToken.sol";
import "./RelieferValidate.sol";

enum STATUS_ENUM {NOTSTARTED,START_JOIN,END_JOIN, STARTED_CAMPAIGN, END_CAMPAIGN,SUCCESS,CLAIM}
enum USER_STATUS_ENUM {NOT_JOIN,JOIN,STARTED_CAMPAIGN, END_CAMPAIGN,CLAIM,FALSE_RULE}



contract RelieferCampaign is Ownable {
  RelieferValidate public validator;

  constructor (address _owner,uint256 _startTime, uint256 _endTime, uint256 _durationToEarn, uint256 _rewardTokenAmount,uint256 _maxUser, RelieferToken _rewardToken, RelieferValidate _validator) {
    startTime = _startTime;
    endTime = _endTime;
    durationToEarn = _durationToEarn;
    rewardTokenAmount = _rewardTokenAmount;
    rewardToken = _rewardToken;
    validator = _validator;
    maxUser = _maxUser;
    transferOwnership(_owner);
  }

  struct DataStruct {
    uint256 startTime;
    uint256 endTime;
    uint256 durationToEarn;
    STATUS_ENUM status;
    uint256 totalTokenAmount;
    uint256 rewardTokenAmount;
    RelieferToken rewardToken;
    uint256 maxUser;
    address[] users;
  }

  uint256 startTime;
  uint256 endTime;
  uint256 durationToEarn;

  STATUS_ENUM public status = STATUS_ENUM.NOTSTARTED;

  uint256 public totalTokenAmount = 0;
  uint256 rewardTokenAmount;
  RelieferToken rewardToken;
  uint256 public maxUser;

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
    rewardToken = RelieferToken(_rewardToken);
  }

  function setMaxUser(uint256 _maxUser) external onlyOwner {
    maxUser = _maxUser;
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

  function calculateCampaign() external onlyOwner {
    require(status == STATUS_ENUM.END_CAMPAIGN, "not end campaign time");

    for (uint256 i = 0; i < users.length; i++) {
      if (userEndTime[users[i]] - userStartTime[users[i]] >= durationToEarn) {
        totalTokenAmount+=rewardTokenAmount;
        userStatus[users[i]] = USER_STATUS_ENUM.CLAIM;
      }else{
        userStatus[users[i]] = USER_STATUS_ENUM.FALSE_RULE;
      }
    }

    status = STATUS_ENUM.SUCCESS;
  }

  function mintReward() external payable onlyOwner {
    require(status == STATUS_ENUM.SUCCESS, "not success");
    rewardToken.transfer(msg.sender, totalTokenAmount);
    status = STATUS_ENUM.CLAIM;
  }

  function user_joinCampaign() external onlyValidate {
    require(status == STATUS_ENUM.START_JOIN, "not start joining time");
    require(users.length < maxUser, "max user");
    require(userStatus[msg.sender] == USER_STATUS_ENUM.NOT_JOIN, "already join");
    userStatus[msg.sender] = USER_STATUS_ENUM.JOIN;
    users.push(msg.sender);
  }

  function user_startCampaign() external onlyValidate {
    require(status == STATUS_ENUM.STARTED_CAMPAIGN, "not start campaign time");
    require(userStatus[msg.sender] == USER_STATUS_ENUM.JOIN, "not join");
    userStatus[msg.sender] = USER_STATUS_ENUM.STARTED_CAMPAIGN;
    userStartTime[msg.sender] = block.timestamp;
  }

  function user_endCampaign() external onlyValidate {
    require(status == STATUS_ENUM.END_CAMPAIGN, "not end campaign time");
    require(userStatus[msg.sender] == USER_STATUS_ENUM.STARTED_CAMPAIGN, "not start campaign");
    userStatus[msg.sender] = USER_STATUS_ENUM.END_CAMPAIGN;
    userEndTime[msg.sender] = block.timestamp;
  }

  function user_claim() external onlyValidate {
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

  function getData() external view returns(DataStruct memory) {
    return DataStruct({
      startTime: startTime,
      endTime: endTime,
      durationToEarn: durationToEarn,
      status: status,
      totalTokenAmount: totalTokenAmount,
      rewardTokenAmount: rewardTokenAmount,
      rewardToken: rewardToken,
      users: users,
      maxUser: maxUser
    });
  }

  function getAvailableUser() external view returns (uint256) {
    return maxUser - users.length;
  }

  function getRewardTokenBalance() external view returns (uint256) {
    return rewardToken.balanceOf(address(this));
  }

  modifier onlyValidate() {
    require(validator.isUserValid(msg.sender), "not verify");
    _;
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
  function calculateCampaign() external;
  function sendRewardToken() external payable;
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
  function getData() external view returns(DataStruct memory);

  struct DataStruct {
    uint256 startTime;
    uint256 endTime;
    uint256 durationToEarn;
    STATUS_ENUM status;
    uint256 totalTokenAmount;
    uint256 rewardTokenAmount;
    RelieferToken rewardToken;
    address[] users;
    uint256 maxUser;
  }
}