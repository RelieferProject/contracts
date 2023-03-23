// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IRelieferValidate {
  function register() external;
  function validate(address _address) external;
  function addValidator(address _address) external;
  function isRegistered(address _address) external view returns (bool);
  function getIsvalidate(address _address) external view returns (bool);
  function getAllUsers() external view returns (UserData[] memory);

  struct UserData {
    address user;
    bool validate;
  }
}

contract RelieferValidate is Ownable {
  constructor(){}

  mapping(address => bool) public userValidate;
  mapping(address => bool) public validator;
  mapping(address => bool) public campaigner;

  address[] public users;


  struct UserData {
    address user;
    bool validate;
  }


  function register() external{
    require(!isRegistered(msg.sender),"this address has registered!");
    require(!userValidate[msg.sender],"this address has validated!");
    users.push(msg.sender);
    userValidate[msg.sender] = false;
  }

  function validate(address _address) external onlyValidator(msg.sender){
    userValidate[_address] = true;
  }

  function grantCampainer(address _address) external onlyOwner {
    campaigner[_address] = true;
  }

  function addValidator(address _address) external onlyOwner {
    validator[_address] = true;
  }

  modifier onlyValidator(address _address){
    require(validator[_address],"Not validator");
    _;
  }

  modifier onlyCampaigner(address _address){
    require(validator[_address],"Not compainer");
    _;
  }

  function isRegistered(address _address) public view returns (bool) {
    for (uint256 userIndex = 0; userIndex < users.length; userIndex++) {
      if(_address == users[userIndex]){
        return true;
      }
    }
    return false;
  }

  function getIsvalidate(address _address) public view returns (bool) {
    return userValidate[_address];
  }

  function getAllUsers() public view returns (UserData[] memory) {
    UserData[] memory result = new UserData[](users.length);
    for (uint256 userIndex = 0; userIndex < users.length; userIndex++) {
      address _address =  users[userIndex];
      bool _valid = userValidate[_address];
      UserData memory userData = UserData(_address,_valid);
      result[userIndex] = userData;
    }
    return result;
  }
}