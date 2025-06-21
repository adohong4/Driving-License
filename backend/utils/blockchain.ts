import { ethers } from "ethers";
import DrivingLicenseNFT from "../abi/DrivingLicenseNFT.json";

const provider = new ethers.JsonRpcProvider(
    `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS!,
    DrivingLicenseNFT.abi,
    wallet
);

export async function issueLicense(licenseData: any) {
    const tx = await contract.issueLicense(
        licenseData.licenseId,
        licenseData.holderAddress,
        licenseData.holderId,
        licenseData.name,
        licenseData.dob,
        licenseData.licenseType,
        licenseData.issueDate,
        licenseData.expiryDate,
        licenseData.dataHash,
        licenseData.authorityId
    );
    await tx.wait();
    return tx.hash;
}

export async function queryLicense(tokenId: number) {
    return await contract.getLicense(tokenId);
}

export async function renewLicense(licenseId: string, newExpiryDate: number) {
    const tx = await contract.renewLicense(licenseId, newExpiryDate);
    await tx.wait();
    return tx.hash;
}

export async function revokeLicense(licenseId: string) {
    const tx = await contract.revokeLicense(licenseId);
    await tx.wait();
    return tx.hash;
}