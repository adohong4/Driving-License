import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const DrivingLicense = await ethers.getContractFactory("DrivingLicense");
  const contract = await DrivingLicense.deploy(deployer.address);
  await contract.waitForDeployment();

  console.log("DrivingLicense deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});