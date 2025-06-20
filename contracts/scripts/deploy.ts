import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const DrivingLicenseNFT = await ethers.getContractFactory("DrivingLicenseNFT");
  const contract = await DrivingLicenseNFT.deploy(deployer.address);
  await contract.waitForDeployment();

  console.log("DrivingLicenseNFT deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});