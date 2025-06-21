// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DrivingLicense is Ownable {
    uint256 private _licenseCount;

    enum LicenseStatus {
        ACTIVE,
        SUSPENDED,
        REVOKED,
        EXPIRED
    }

    struct License {
        string licenseId; // mã bằng lái xe
        address holderAddress; // địa chỉ ví của người sở hữu
        string holderId; // CCCD
        string name;
        string dob;
        string licenseType; //Mã Bằng lái
        uint256 issueDate; // ngày bắt đầu
        uint256 expiryDate; // ngày kết thúc
        LicenseStatus status; //trạng thái bằng
        string ipfsHash; // mã ipfs
        string authorityId; //id cơ quan chức năng
    }

    mapping(string => License) public licenses;
    mapping(address => bool) public authorities;
    mapping(address => string[]) private holderToLicenseIds;
    string[] public licenseIds;

    event LicenseIssued(string indexed licenseId, address indexed holder, uint256 issueDate);
    event LicenseUpdated(string indexed licenseId, uint256 newExpiryDate, LicenseStatus newStatus);
    event LicenseRevoked(string indexed licenseId, uint256 timestamp);
    event AuthorityAdded(address indexed authority, uint256 timestamp);

    modifier onlyAuthority() {
        require(authorities[msg.sender], "Not authorized");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        authorities[initialOwner] = true;
        emit AuthorityAdded(initialOwner, block.timestamp);
    }

    function addAuthority(address _authority) external onlyOwner {
        require(_authority != address(0), "Invalid authority address");
        authorities[_authority] = true;
        emit AuthorityAdded(_authority, block.timestamp);
    }

    function issueLicense(
        string memory _licenseId,
        address _holderAddress,
        string memory _holderId,
        string memory _name,
        string memory _dob,
        string memory _licenseType,
        uint256 _issueDate,
        uint256 _expiryDate,
        string memory _ipfsHash,
        string memory _authorityId
    ) external onlyAuthority {
        require(bytes(licenses[_licenseId].licenseId).length == 0, "License ID already exists");
        require(_holderAddress != address(0), "Invalid holder address");
        require(_issueDate <= _expiryDate, "Invalid dates");

        licenses[_licenseId] = License(
            _licenseId,
            _holderAddress,
            _holderId,
            _name,
            _dob,
            _licenseType,
            _issueDate,
            _expiryDate,
            LicenseStatus.ACTIVE,
            _ipfsHash,
            _authorityId
        );

        licenseIds.push(_licenseId);
        holderToLicenseIds[_holderAddress].push(_licenseId);
        _licenseCount++;

        emit LicenseIssued(_licenseId, _holderAddress, _issueDate);
    }

    function updateLicense(
        string memory _licenseId,
        address _holderAddress,
        string memory _name,
        string memory _dob,
        string memory _licenseType,
        uint256 _expiryDate,
        LicenseStatus _status,
        string memory _ipfsHash
    ) external onlyAuthority {
        require(bytes(licenses[_licenseId].licenseId).length != 0, "License does not exist");
        require(_holderAddress != address(0), "Invalid holder address");
        require(_expiryDate >= licenses[_licenseId].issueDate, "Invalid expiry date");

        License storage license = licenses[_licenseId];

        if (license.holderAddress != _holderAddress) {
            string[] storage oldHolderLicenses = holderToLicenseIds[license.holderAddress];
            for (uint256 i = 0; i < oldHolderLicenses.length; i++) {
                if (keccak256(bytes(oldHolderLicenses[i])) == keccak256(bytes(_licenseId))) {
                    oldHolderLicenses[i] = oldHolderLicenses[oldHolderLicenses.length - 1];
                    oldHolderLicenses.pop();
                    break;
                }
            }

            holderToLicenseIds[_holderAddress].push(_licenseId);
            license.holderAddress = _holderAddress;
        }

        license.name = _name;
        license.dob = _dob;
        license.licenseType = _licenseType;
        license.expiryDate = _expiryDate;
        license.status = _status;
        license.ipfsHash = _ipfsHash;

        emit LicenseUpdated(_licenseId, _expiryDate, _status);
    }

    function renewLicense(string memory _licenseId, uint256 _newExpiryDate) external onlyAuthority {
        require(bytes(licenses[_licenseId].licenseId).length != 0, "License does not exist");
        require(licenses[_licenseId].status == LicenseStatus.ACTIVE, "License is not active");
        require(_newExpiryDate > licenses[_licenseId].expiryDate, "New expiry date must be later");

        licenses[_licenseId].expiryDate = _newExpiryDate;
        licenses[_licenseId].status = LicenseStatus.ACTIVE;

        emit LicenseUpdated(_licenseId, _newExpiryDate, LicenseStatus.ACTIVE);
    }

    function revokeLicense(string memory _licenseId) external onlyAuthority {
        require(bytes(licenses[_licenseId].licenseId).length != 0, "License does not exist");

        licenses[_licenseId].status = LicenseStatus.REVOKED;

        emit LicenseRevoked(_licenseId, block.timestamp);
    }

    function getLicense(string memory _licenseId) external view returns (License memory) {
        require(bytes(licenses[_licenseId].licenseId).length != 0, "License does not exist");
        return licenses[_licenseId];
    }

    function getAllLicenses() external view returns (License[] memory) {
        License[] memory allLicenses = new License[](_licenseCount);
        for (uint256 i = 0; i < _licenseCount; i++) {
            allLicenses[i] = licenses[licenseIds[i]];
        }
        return allLicenses;
    }

    function getLicensesByHolder(address _holderAddress) external view returns (License[] memory) {
        require(_holderAddress != address(0), "Invalid holder address");
        string[] memory holderLicenseIds = holderToLicenseIds[_holderAddress];
        License[] memory holderLicenses = new License[](holderLicenseIds.length);

        for (uint256 i = 0; i < holderLicenseIds.length; i++) {
            holderLicenses[i] = licenses[holderLicenseIds[i]];
        }

        return holderLicenses;
    }

    function getLicenseCount() external view returns (uint256) {
        return _licenseCount;
    }
}
