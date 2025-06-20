import { expect } from "chai";
import { ethers } from "hardhat";

describe("DrivingLicenseNFT", function () {
  let contract: any;
  let owner: any;
  let authority: any;
  let holder: any;

  beforeEach(async function () {
    const DrivingLicenseNFT = await ethers.getContractFactory("DrivingLicenseNFT");
    [owner, authority, holder] = await ethers.getSigners();
    contract = await DrivingLicenseNFT.deploy(owner.address);
    await contract.waitForDeployment();

    // Thêm authority
    await contract.connect(owner).addAuthority(authority.address);
  });

  it("should issue a new license", async function () {
    const tx = await contract.connect(authority).issueLicense(
      "DL123",
      holder.address,
      "HolderId123",
      "EncryptedName",
      "EncryptedDOB",
      "B2",
      1697059200,
      1750137600,
      "ipfs://QmHash",
      "SGTVT"
    );
    await tx.wait();

    const license = await contract.getLicense(1);
    expect(license.licenseId).to.equal("DL123");
    expect(license.holderId).to.equal("HolderId123");
    expect(license.status).to.equal("ACTIVE");

    const tokenOwner = await contract.ownerOf(1);
    expect(tokenOwner).to.equal(holder.address);
  });

  it("should fail if non-authority tries to issue license", async function () {
    await expect(
      contract.connect(holder).issueLicense(
        "DL124",
        holder.address,
        "HolderId124",
        "Name",
        "DOB",
        "B2",
        1697059200,
        1750137600,
        "ipfs://QmHash",
        "SGTVT"
      )
    ).to.be.revertedWith("Not authorized");
  });
});