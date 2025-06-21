import { useState, useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import FormInput from "./FormInput";

export default function RenewLicense() {
    const { contract, isAuthority, setError, setSuccess } = useContext(Web3Context);
    const [renewData, setRenewData] = useState({ licenseId: "", newExpiryDate: "" });

    const handleRenewChange = (e) => {
        setRenewData({ ...renewData, [e.target.name]: e.target.value });
    };

    const renewLicense = async () => {
        if (!contract) return setError("Vui lòng kết nối ví MetaMask");
        if (!isAuthority) return setError("Ví không có quyền gia hạn GPLX");
        if (!renewData.licenseId || !renewData.newExpiryDate) return setError("Vui lòng điền đầy đủ các trường");
        try {
            setError("");
            setSuccess("");
            const tx = await contract.renewLicense(
                renewData.licenseId,
                Math.floor(new Date(renewData.newExpiryDate).getTime() / 1000)
            );
            await tx.wait();
            setSuccess(`Gia hạn GPLX thành công! TxHash: ${tx.hash}`);
            setRenewData({ licenseId: "", newExpiryDate: "" });
        } catch (error) {
            setError(`Lỗi khi gia hạn GPLX: ${error.reason || error.message}`);
        }
    };

    if (!isAuthority) return null;

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">Gia Hạn Giấy Phép Lái Xe</h2>
            <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
                <FormInput
                    label="Mã GPLX"
                    name="licenseId"
                    value={renewData.licenseId}
                    onChange={handleRenewChange}
                    placeholder="Nhập mã GPLX (VD: DL123)"
                />
                <FormInput
                    label="Ngày hết hạn mới"
                    name="newExpiryDate"
                    value={renewData.newExpiryDate}
                    onChange={handleRenewChange}
                    type="date"
                />
                <button
                    onClick={renewLicense}
                    className="w-full bg-primary text-white p-3 rounded hover:bg-secondary transition"
                >
                    Gia hạn
                </button>
            </div>
        </div>
    );
}