// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DrivingLicenseNFT is ERC721, Ownable {
    uint256 private _tokenIds;

    struct License {
        string licenseId;
        string holderId;
        string name;
        string dob;
        string licenseType;
        uint256 issueDate;
        uint256 expiryDate;
        string status;
        string dataHash;
        string authorityId;
    }

    mapping(uint256 => License) public licenses;
    mapping(string => uint256) public licenseIdToTokenId;
    mapping(address => bool) public authorities;

    modifier onlyAuthority() {
        require(authorities[msg.sender], "Not authorized");
        _;
    }

    constructor(address initialOwner) ERC721("DrivingLicenseNFT", "DLNFT") Ownable(initialOwner) {
        authorities[initialOwner] = true;
    }

    function addAuthority(address _authority) external onlyOwner {
        authorities[_authority] = true;
    }

    function issueLicense(
        string memory _licenseId,
        address _holder,
        string memory _holderId,
        string memory _name,
        string memory _dob,
        string memory _licenseType,
        uint256 _issueDate,
        uint256 _expiryDate,
        string memory _dataHash,
        string memory _authorityId
    ) external onlyAuthority returns (uint256) {
        require(licenseIdToTokenId[_licenseId] == 0, "License ID already exists");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _safeMint(_holder, newTokenId);
        licenseIdToTokenId[_licenseId] = newTokenId;

        licenses[newTokenId] = License(
            _licenseId, _holderId, _name, _dob, _licenseType, _issueDate, _expiryDate, "ACTIVE", _dataHash, _authorityId
        );

        return newTokenId;
    }

    function renewLicense(string memory _licenseId, uint256 _newExpiryDate) external onlyAuthority {
        uint256 tokenId = licenseIdToTokenId[_licenseId];
        require(tokenId != 0, "License does not exist");
        require(keccak256(bytes(licenses[tokenId].status)) == keccak256(bytes("ACTIVE")), "License is not active");

        licenses[tokenId].expiryDate = _newExpiryDate;
    }

    function revokeLicense(string memory _licenseId) external onlyAuthority {
        uint256 tokenId = licenseIdToTokenId[_licenseId];
        require(tokenId != 0, "License does not exist");

        licenses[tokenId].status = "REVOKED";
    }

    function getLicense(uint256 _tokenId) external view returns (License memory) {
        require(_tokenExists(_tokenId), "Token does not exist");
        return licenses[_tokenId];
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        require(_tokenExists(_tokenId), "Token does not exist");
        return string(abi.encodePacked("ipfs://", licenses[_tokenId].dataHash));
    }

    function _tokenExists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
