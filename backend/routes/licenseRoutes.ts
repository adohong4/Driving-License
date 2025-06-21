import express from "express";
import { issueLicenseController, queryLicenseController } from "../controllers/licenseController";

const router = express.Router();
router.post("/issue", issueLicenseController);
router.get("/query/:tokenId", queryLicenseController);

export default router;