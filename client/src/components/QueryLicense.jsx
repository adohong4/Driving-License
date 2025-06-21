import { useState, useContext } from "react";
import { ethers } from "ethers";
import { QRCodeSVG } from "qrcode.react";
import { Web3Context } from "../context/Web3Context";
import FormInput from "./FormInput";
import LicenseInfo from "./LicenseInfo";

const ALCHEMY_API_KEY = "Egy1MswzdLUQHTqfhi1z7HFc-M0Uvw5r";
const CONTRACT_ADDRESS = "0x9e86Cf9ae7a28155071Bdf9129f4cE5EFA542DFF";

export default function QueryLicense() {
    const { setError, setSuccess } = useContext(Web3Context);
    const [queryTokenId, setQueryTokenId] = useState("");
    const [license, setLicense] = useState(null);

    const queryLicense = async () => {
        if (!queryTokenId) return setError("Vui lòng nhập Token ID");
        try {
            setError("");
            setSuccess("");
            const provider = new ethers.JsonRpcProvider(
                `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
            );
            const contract = new ethers.Contract(CONTRACT_ADDRESS, DrivingLicenseNFT.abi, provider);
            const result = await contract.getLicense(Number(queryTokenId));
            setLicense({
                licenseId: result[0],
                holderId: result[1],
                name: result[2],
                dob: result[3],
                licenseType: result[4],
                issueDate: result[5].toNumber(),
                expiryDate: result[6].toNumber(),
                status: result[7],
                dataHash: result[8],
                authorityId: result[9],
            });
        } catch (error) {
            setError(`Lỗi khi tra cứu GPLX: ${error.reason || error.message}`);
        }
    };

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">Tra Cứu Giấy Phép Lái Xe</h2>
            <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
                <FormInput
                    label="Token ID"
                    value={queryTokenId}
                    onChange={(e) => setQueryTokenId(e.target.value)}
                    placeholder="Nhập Token ID (VD: 1)"
                />
                <button
                    onClick={queryLicense}
                    className="w-full bg-primary text-white p-3 rounded hover:bg-secondary transition"
                >
                    Tra cứu
                </button>
            </div>
            {license && <LicenseInfo license={license} />}
        </div>
    );
}