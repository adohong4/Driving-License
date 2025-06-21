import { useState, useContext } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { Web3Context } from "../context/Web3Context";
import FormInput from "./FormInput";

const PINATA_API_KEY = "c7817b9ff6f35987a4e2";
const PINATA_API_SECRET = "bf691a9f84ca722407c8fceb23610ca89efb4a24694627f9404b41154c9f289f";

export default function IssueLicense() {
    const { contract, isAuthority, setError, setSuccess } = useContext(Web3Context);
    const [formData, setFormData] = useState({
        licenseId: "",
        holderAddress: "",
        holderId: "",
        name: "",
        dob: "",
        licenseType: "",
        issueDate: "",
        expiryDate: "",
        authorityId: "",
    });

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const uploadToPinata = async (data) => {
        try {
            const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
            const response = await axios.post(
                url,
                { pinataContent: data, pinataMetadata: { name: `GPLX-${data.licenseId}` } },
                {
                    headers: {
                        pinata_api_key: PINATA_API_KEY,
                        pinata_secret_api_key: PINATA_API_SECRET,
                    },
                }
            );
            if (response.data.IpfsHash) return response.data.IpfsHash;
            throw new Error("Failed to upload to Pinata");
        } catch (error) {
            throw new Error("Không thể tải metadata lên Pinata");
        }
    };

    const issueLicense = async () => {
        if (!contract) return setError("Vui lòng kết nối ví MetaMask");
        if (!isAuthority) return setError("Ví không có quyền cấp GPLX");
        if (!Object.values(formData).every((val) => val)) return setError("Vui lòng điền đầy đủ các trường");
        if (!ethers.isAddress(formData.holderAddress)) return setError("Địa chỉ ví người sở hữu không hợp lệ");

        try {
            setError("");
            setSuccess("");
            const ipfsHash = await uploadToPinata(formData);
            const tx = await contract.issueLicense(
                formData.licenseId,
                formData.holderAddress,
                formData.holderId,
                formData.name,
                formData.dob,
                formData.licenseType,
                Math.floor(new Date(formData.issueDate).getTime() / 1000),
                Math.floor(new Date(formData.expiryDate).getTime() / 1000),
                ipfsHash,
                formData.authorityId
            );
            await tx.wait();
            setSuccess(`Cấp GPLX thành công! TxHash: ${tx.hash}`);
            setFormData({
                licenseId: "",
                holderAddress: "",
                holderId: "",
                name: "",
                dob: "",
                licenseType: "",
                issueDate: "",
                expiryDate: "",
                authorityId: "",
            });
        } catch (error) {
            setError(`Lỗi khi cấp GPLX: ${error.reason || error.message}`);
        }
    };

    if (!isAuthority) return null;

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">Cấp Giấy Phép Lái Xe</h2>
            <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
                <FormInput
                    label="Mã GPLX"
                    name="licenseId"
                    value={formData.licenseId}
                    onChange={handleFormChange}
                    placeholder="Nhập mã GPLX (VD: DL123)"
                />
                <FormInput
                    label="Địa chỉ ví người sở hữu"
                    name="holderAddress"
                    value={formData.holderAddress}
                    onChange={handleFormChange}
                    placeholder="Nhập địa chỉ ví (0x...)"
                />
                <FormInput
                    label="CCCD/CMND"
                    name="holderId"
                    value={formData.holderId}
                    onChange={handleFormChange}
                    placeholder="Nhập CCCD/CMND"
                />
                <FormInput
                    label="Họ tên"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Nhập họ tên"
                />
                <FormInput
                    label="Ngày sinh"
                    name="dob"
                    value={formData.dob}
                    onChange={handleFormChange}
                    type="date"
                />
                <FormInput
                    label="Loại GPLX"
                    name="licenseType"
                    value={formData.licenseType}
                    onChange={handleFormChange}
                    placeholder="Nhập loại GPLX (A1, B1, ...)"
                />
                <FormInput
                    label="Ngày cấp"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleFormChange}
                    type="date"
                />
                <FormInput
                    label="Ngày hết hạn"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleFormChange}
                    type="date"
                />
                <FormInput
                    label="Cơ quan cấp"
                    name="authorityId"
                    value={formData.authorityId}
                    onChange={handleFormChange}
                    placeholder="Nhập cơ quan cấp (VD: SGTVT)"
                />
                <button
                    onClick={issueLicense}
                    className="w-full bg-primary text-white p-3 rounded hover:bg-secondary transition"
                >
                    Cấp GPLX
                </button>
            </div>
        </div>
    );
}