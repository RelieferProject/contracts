// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./RelieferFactory.sol";

interface IRelieferValidate {
  function register() external;
  function validate(address _address) external;
  function addValidator(address _address) external;
  function isRegistered(address _address) external view returns (bool);
  function isValidator(address _address) external view returns (bool);
  function getAllUsers() external view returns (UserData[] memory);

  struct UserData {
    address user;
    bool validate;
  }
}

contract RelieferValidate is Ownable {
  constructor(){}

  mapping(address => bool) public userValidator;
  mapping(address => bool) public validator;
  mapping(address => bool) public campaigner;

  address[] public users;

  RelieferFactory public factory;


  struct UserData {
    address user;
    bool validate;
  }

  function setFactory(RelieferFactory _factory) external onlyOwner {
    if(address(factory) == address(0)){
      factory = _factory;
    }
  }

  function register() external{
    require(!isRegistered(msg.sender),"this address has registered!");
    require(!userValidator[msg.sender],"this address has validated!");
    users.push(msg.sender);
    userValidator[msg.sender] = false;
  }

  function validate(address _address) external onlyValidator(msg.sender){
    userValidator[_address] = true;
  }

  function grantCampainer(address _address) external onlyFactory {
    campaigner[_address] = true;
  }

  function addValidator(address _address) external onlyFactory {
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

  modifier onlyFactory(){
    require(msg.sender == address(factory),"Not factory");
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

  function isValidator(address _address) public view returns (bool) {
    return validator[_address];
  }

  function isCampaigner(address _address) public view returns (bool) {
    return campaigner[_address];
  }

  function isUserValid(address _address) public view returns (bool) {
    return userValidator[_address];
  }

  function getAllUsers() public view returns (UserData[] memory) {
    UserData[] memory result = new UserData[](users.length);
    for (uint256 userIndex = 0; userIndex < users.length; userIndex++) {
      address _address =  users[userIndex];
      bool _valid = userValidator[_address];
      UserData memory userData = UserData(_address,_valid);
      result[userIndex] = userData;
    }
    return result;
  }

  // function getAllValidator() public view returns (address[] memory) {
  //   address[] memory result = new address[](users.length);
  //   uint256 index = 0;
  //   for (uint256 userIndex = 0; userIndex < users.length; userIndex++) {
  //     address _address =  users[userIndex];
  //     if(userValidator[_address]){
  //       result[index] = _address;
  //       index++;
  //     }
  //   }
  //   return result;
  // }
}