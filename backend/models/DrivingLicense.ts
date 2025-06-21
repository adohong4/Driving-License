import mongoose, { Schema } from "mongoose";

const LicenseSchema = new Schema({
    licenseId: { type: String, required: true, unique: true },
    holderId: { type: String, required: true },
    name: { type: String, required: true },
    dob: { type: String, required: true },
    licenseType: { type: String, required: true },
    issueDate: { type: Number, required: true },
    expiryDate: { type: Number, required: true },
    status: { type: String, default: "ACTIVE" },
    dataHash: { type: String, required: true },
    authorityId: { type: String, required: true },
    tokenId: { type: Number, required: true },
});

export default mongoose.model("DrivingLicense", LicenseSchema);