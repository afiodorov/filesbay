pragma solidity >=0.8.0 <=0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Item is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(string memory name_) ERC721(name_, "FBITEM") {}

    function mint(address to) public onlyOwner {
        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();
        _mint(to, newTokenId);
    }
}

contract Listings {
    struct File {
        string fileName;
        string fileDescription;
        uint256 price;
        address priceTokenAddress;
        address itemAddress;
        address seller; // add this line
    }

    File[] public files;
    mapping(address => uint256[]) public fileIndicesByAddress;

    function numFiles() public view returns (uint256) {
        return files.length;
    }

    function numFilesByAddress(address _address) public view returns (uint256) {
        return fileIndicesByAddress[_address].length;
    }

    function add(
        string memory _fileName,
        string memory _fileDescription,
        uint256 _price,
        address _tokenAddress
    ) public {
        Item newItem = new Item(_fileName);
        files.push(
            File(
                _fileName,
                _fileDescription,
                _price,
                _tokenAddress,
                address(newItem),
                msg.sender
            )
        );
        fileIndicesByAddress[msg.sender].push(files.length - 1);
    }

    function edit(
        uint256 _fileIndex,
        string memory _newFileName,
        string memory _newDescription,
        uint256 _newPrice,
        address _newTokenAddress
    ) public {
        require(_fileIndex < files.length, "Invalid file index");

        uint256[] memory addedFileIndices = fileIndicesByAddress[msg.sender];
        bool hasPermission = false;

        for (uint256 i = 0; i < addedFileIndices.length; i++) {
            if (addedFileIndices[i] == _fileIndex) {
                hasPermission = true;
                break;
            }
        }

        require(hasPermission, "This file doesn't belong to you");

        files[_fileIndex].fileName = _newFileName;
        files[_fileIndex].fileDescription = _newDescription;
        files[_fileIndex].price = _newPrice;
        files[_fileIndex].priceTokenAddress = _newTokenAddress;
    }

    function buy(uint256 _fileIndex) public {
        File memory file = files[_fileIndex];

        require(
            ERC20(file.priceTokenAddress).balanceOf(msg.sender) >= file.price,
            "Insufficient token balance"
        );

        require(
            ERC20(file.priceTokenAddress).transferFrom(
                msg.sender,
                file.seller,
                file.price
            ),
            "Token transfer failed"
        );

        Item(file.itemAddress).mint(msg.sender);
    }
}
