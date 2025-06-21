const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DrivingLicense", function () {
  let DrivingLicense;
  let contract;
  let owner;
  let authority;
  let holder;
  let nonAuthority;

  beforeEach(async function () {
    // Lấy contract factory và các signer
    DrivingLicense = await ethers.getContractFactory("DrivingLicense");
    [owner, authority, holder, nonAuthority] = await ethers.getSigners();

    // Deploy contract
    contract = await DrivingLicense.deploy(owner.address);
    await contract.waitForDeployment();

    // Thêm authority
    await contract.connect(owner).addAuthority(authority.address);
  });

  it("should add a new authority and emit AuthorityAdded event", async function () {
    const tx = await contract.connect(owner).addAuthority(nonAuthority.address);
    await expect(tx)
      .to.emit(contract, "AuthorityAdded")
      .withArgs(nonAuthority.address, await ethers.provider.getBlock(tx.blockNumber).then(block => block.timestamp));

    const isAuthority = await contract.authorities(nonAuthority.address);
    expect(isAuthority).to.be.true;
  });

  it("should issue a new license and emit LicenseIssued event", async function () {
    const licenseId = "DL123";
    const issueDate = Math.floor(new Date("2023-10-13T00:00:00Z").getTime() / 1000); // 1697059200
    const expiryDate = Math.floor(new Date("2025-10-13T00:00:00Z").getTime() / 1000); // 1750137600

    const tx = await contract.connect(authority).issueLicense(
      licenseId,
      holder.address,
      "HolderId123",
      "John Doe",
      "01/01/1990",
      "B2",
      issueDate,
      expiryDate,
      "ipfs://QmHash123",
      "SGTVT"
    );

    await expect(tx)
      .to.emit(contract, "LicenseIssued")
      .withArgs(licenseId, holder.address, issueDate);

    // Kiểm tra license
    const license = await contract.getLicense(licenseId);
    expect(license.licenseId).to.equal(licenseId);
    expect(license.holderAddress).to.equal(holder.address);
    expect(license.holderId).to.equal("HolderId123");
    expect(license.name).to.equal("John Doe");
    expect(license.dob).to.equal("01/01/1990");
    expect(license.licenseType).to.equal("B2");
    expect(license.issueDate).to.equal(issueDate);
    expect(license.expiryDate).to.equal(expiryDate);
    expect(license.status).to.equal(0); // LicenseStatus.ACTIVE = 0
    expect(license.ipfsHash).to.equal("ipfs://QmHash123");
    expect(license.authorityId).to.equal("SGTVT");

    // Kiểm tra license count
    expect(await contract.getLicenseCount()).to.equal(1);

    // Kiểm tra holderToLicenseIds
    const holderLicenses = await contract.getLicensesByHolder(holder.address);
    expect(holderLicenses.length).to.equal(1);
    expect(holderLicenses[0].licenseId).to.equal(licenseId);
  });

  it("should fail if non-authority tries to issue license", async function () {
    await expect(
      contract.connect(nonAuthority).issueLicense(
        "DL124",
        holder.address,
        "HolderId124",
        "Jane Doe",
        "02/02/1995",
        "B2",
        1697059200,
        1750137600,
        "ipfs://QmHash124",
        "SGTVT"
      )
    ).to.be.revertedWith("Not authorized");
  });

  it("should fail if license ID already exists", async function () {
    const licenseId = "DL123";
    await contract.connect(authority).issueLicense(
      licenseId,
      holder.address,
      "HolderId123",
      "John Doe",
      "01/01/1990",
      "B2",
      1697059200,
      1750137600,
      "ipfs://QmHash123",
      "SGTVT"
    );

    await expect(
      contract.connect(authority).issueLicense(
        licenseId,
        holder.address,
        "HolderId123",
        "John Doe",
        "01/01/1990",
        "B2",
        1697059200,
        1750137600,
        "ipfs://QmHash123",
        "SGTVT"
      )
    ).to.be.revertedWith("License ID already exists");
  });

  it("should update a license and emit LicenseUpdated event", async function () {
    const licenseId = "DL123";
    const issueDate = 1697059200;
    const newExpiryDate = Math.floor(new Date("2026-10-13T00:00:00Z").getTime() / 1000); // 1781673600

    // Cấp license trước
    await contract.connect(authority).issueLicense(
      licenseId,
      holder.address,
      "HolderId123",
      "John Doe",
      "01/01/1990",
      "B2",
      issueDate,
      1750137600,
      "ipfs://QmHash123",
      "SGTVT"
    );

    // Cập nhật license
    const tx = await contract.connect(authority).updateLicense(
      licenseId,
      nonAuthority.address, // Chuyển sang holder mới
      "Jane Doe",
      "02/02/1995",
      "C",
      newExpiryDate,
      1, // LicenseStatus.SUSPENDED
      "ipfs://QmHash124"
    );

    await expect(tx)
      .to.emit(contract, "LicenseUpdated")
      .withArgs(licenseId, newExpiryDate, 1);

    // Kiểm tra license đã cập nhật
    const license = await contract.getLicense(licenseId);
    expect(license.holderAddress).to.equal(nonAuthority.address);
    expect(license.name).to.equal("Jane Doe");
    expect(license.dob).to.equal("02/02/1995");
    expect(license.licenseType).to.equal("C");
    expect(license.expiryDate).to.equal(newExpiryDate);
    expect(license.status).to.equal(1); // LicenseStatus.SUSPENDED
    expect(license.ipfsHash).to.equal("ipfs://QmHash124");

    // Kiểm tra holderToLicenseIds
    const oldHolderLicenses = await contract.getLicensesByHolder(holder.address);
    expect(oldHolderLicenses.length).to.equal(0);
    const newHolderLicenses = await contract.getLicensesByHolder(nonAuthority.address);
    expect(newHolderLicenses.length).to.equal(1);
    expect(newHolderLicenses[0].licenseId).to.equal(licenseId);
  });

  it("should renew a license and emit LicenseUpdated event", async function () {
    const licenseId = "DL123";
    const newExpiryDate = Math.floor(new Date("2026-10-13T00:00:00Z").getTime() / 1000); // 1781673600

    // Cấp license trước
    await contract.connect(authority).issueLicense(
      licenseId,
      holder.address,
      "HolderId123",
      "John Doe",
      "01/01/1990",
      "B2",
      1697059200,
      1750137600,
      "ipfs://QmHash123",
      "SGTVT"
    );

    // Gia hạn license
    const tx = await contract.connect(authority).renewLicense(licenseId, newExpiryDate);
    await expect(tx)
      .to.emit(contract, "LicenseUpdated")
      .withArgs(licenseId, newExpiryDate, 0); // LicenseStatus.ACTIVE

    // Kiểm tra license
    const license = await contract.getLicense(licenseId);
    expect(license.expiryDate).to.equal(newExpiryDate);
    expect(license.status).to.equal(0); // LicenseStatus.ACTIVE
  });

  it("should revoke a license and emit LicenseRevoked event", async function () {
    const licenseId = "DL123";

    // Cấp license trước
    await contract.connect(authority).issueLicense(
      licenseId,
      holder.address,
      "HolderId123",
      "John Doe",
      "01/01/1990",
      "B2",
      1697059200,
      1750137600,
      "ipfs://QmHash123",
      "SGTVT"
    );

    // Thu hồi license
    const tx = await contract.connect(authority).revokeLicense(licenseId);
    await expect(tx)
      .to.emit(contract, "LicenseRevoked")
      .withArgs(licenseId, await ethers.provider.getBlock(tx.blockNumber).then(block => block.timestamp));

    // Kiểm tra license
    const license = await contract.getLicense(licenseId);
    expect(license.status).to.equal(2); // LicenseStatus.REVOKED
  });

  it("should get all licenses", async function () {
    // Cấp 2 license
    await contract.connect(authority).issueLicense(
      "DL123",
      holder.address,
      "HolderId123",
      "John Doe",
      "01/01/1990",
      "B2",
      1697059200,
      1750137600,
      "ipfs://QmHash123",
      "SGTVT"
    );
    await contract.connect(authority).issueLicense(
      "DL124",
      nonAuthority.address,
      "HolderId124",
      "Jane Doe",
      "02/02/1995",
      "C",
      1697059200,
      1750137600,
      "ipfs://QmHash124",
      "SGTVT"
    );

    // Lấy tất cả license
    const allLicenses = await contract.getAllLicenses();
    expect(allLicenses.length).to.equal(2);
    expect(allLicenses[0].licenseId).to.equal("DL123");
    expect(allLicenses[1].licenseId).to.equal("DL124");
  });

  it("should fail if getting non-existent license", async function () {
    await expect(contract.getLicense("DL999")).to.be.revertedWith("License does not exist");
  });
});