// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

abstract contract Mintable is Ownable {
  // daily limit to minting
  // only address can mint
  // has only one account is admin
  struct mintData {
    bool allowed;
    uint256 dailyLimit;
  }
  uint256 public constant DAILY_INTERVAL = 1 days;
  address[] public minters;
  mapping(address => mintData) public allowMinting;
  mapping(address => mapping(uint256 => uint256)) public dailyMint;
  address public setter;

  constructor() {
    setter = msg.sender;
  }

  // To set Setter
  function setSetter(address _address) external onlyOwner {
    setter = _address;
  }

  function setAllowMint(address _address, bool _allowed) external onlySetter {
    allowMinting[_address].allowed = _allowed;
    if (_allowed) {
      minters.push(_address);
    }
  }

  function getMinters() external view returns (address[] memory) {
    return minters;
  }

  function setDailyLimit(address _address, uint256 _mintAmount) external onlySetter {
    allowMinting[_address].dailyLimit = _mintAmount;
  }

  function mintDailyLimited(address _address, uint256 _amount) public view returns (bool) {
    if (allowMinting[_address].dailyLimit == 0) {
      return false;
    }
    return dailyMint[_address][block.timestamp / DAILY_INTERVAL] + _amount > allowMinting[_address].dailyLimit;
  }

  function increaseMint(uint256 _amount) internal canMint(_amount) {
    dailyMint[msg.sender][block.timestamp / DAILY_INTERVAL] += _amount;
  }

  modifier canMint(uint256 _amount) {
    require(!mintDailyLimited(msg.sender, _amount), "limit");
    _;
  }

  modifier onlySetter() {
    require(msg.sender == setter, "Only setter");
    _;
  }

  modifier onlyMinter() {
    require(allowMinting[msg.sender].allowed, "Only minter");
    _;
  }
}

contract RelieferToken is ERC20, ERC20Burnable, Ownable, Mintable {
  uint256 public totalBurn = 0;

  using SafeMath for uint256;

  constructor() ERC20("RelieferToken", "RLF") {}

  function mint(address _to, uint256 _amount) public onlyMinter {
    increaseMint(_amount);
    _mint(_to, _amount);
  }

  function burn(uint256 _amount) public override {
    ERC20Burnable.burn(_amount);
    totalBurn = totalBurn.add(_amount);
  }

  function burnForm(address _account, uint256 _amount) public {
    ERC20Burnable.burnFrom(_account, _amount);
    totalBurn = totalBurn.add(_amount);
  }
}
