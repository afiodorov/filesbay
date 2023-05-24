pragma solidity >=0.8.0 <=0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TKNToken is ERC20 {
    constructor() ERC20("Token", "TKN") {
        _mint(msg.sender, 100000000000000000000);
    }
}
