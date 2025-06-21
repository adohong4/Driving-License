import { useState, useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import FormInput from "./FormInput";

export default function RevokeLicense() {
    const { contract, isAuthority, setError, setSuccess } = useContext(Web3Context);
    const [revokeLicenseId, setRevokeLicenseId] = useState("");

    const revokeLicense = async () => {
        if (!contract) return setError("Vui lòng kết nối ví MetaMask");
        if (!isAuthority) return setError("Ví không có quyền thu hồi GPLX");
        if (!revokeLicenseId) return setError("Vui lòng nhập mã GPLX");
        try {
            setError("");
            setSuccess("");
            const tx = await contract.revokeLicense(revokeLicenseId);
            await tx.wait();
            setSuccess(`Thu hồi GPLX thành công! TxHash: ${tx.hash}`);
            setRevokeLicenseId("");
        } catch (error) {
            setError(`Lỗi khi thu hồi GPLX: ${error.reason || error.message}`);
        }
    };

    if (!isAuthority) return null;

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">Thu Hồi Giấy Phép Lái Xe</h2>
            <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
                <FormInput
                    label="Mã GPLX"
                    value={revokeLicenseId}
                    onChange={(e) => setRevokeLicenseId(e.target.value)}
                    placeholder="Nhập mã GPLX (VD: DL123)"
                />
                <button
                    onClick={revokeLicense}
                    className="w-full bg-primary text-white p-3 rounded hover:bg-secondary transition"
                >
                    Thu hồi
                </button>
            </div>
        </div>
    );
}