import { Request, Response } from "express";
import License from "../models/DrivingLicense";
import { uploadToIPFS } from "../utils/ipfs";
import { issueLicense, renewLicense, revokeLicense, queryLicense } from "../utils/blockchain";

export const issueLicenseController = async (req: Request, res: Response) => {
    try {
        const licenseData = req.body;
        const dataHash = await uploadToIPFS(licenseData);
        const txHash = await issueLicense({ ...licenseData, dataHash });

        const license = new License({ ...licenseData, dataHash, tokenId: Date.now() });
        await license.save();

        res.status(201).json({ txHash, dataHash });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const queryLicenseController = async (req: Request, res: Response) => {
    try {
        const { tokenId } = req.params;
        const license = await queryLicense(Number(tokenId));
        res.status(200).json(license);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};