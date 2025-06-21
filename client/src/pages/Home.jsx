import { useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import ConnectWallet from "../components/ConnectWallet";
import IssueLicense from "../components/IssueLicense";
import RenewLicense from "../components/RenewLicense";
import RevokeLicense from "../components/RevokeLicense";
import QueryLicense from "../components/QueryLicense";
import LicenseList from "../components/LicenseList";

export default function Home() {
    const { account, error, success, isAuthority } = useContext(Web3Context);

    return (
        <div className="container mx-auto p-6 min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-primary text-center mb-8">
                Hệ Thống Quản Lý GPLX Trên Blockchain
            </h1>
            <ConnectWallet />
            {account && (
                <div>
                    <p className="text-center mb-4 text-lg">
                        Kết nối: {account.slice(0, 6)}...{account.slice(-4)}
                        {isAuthority ? " (Quyền quản trị)" : ""}
                    </p>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    {success && <p className="text-green-500 text-center mb-4">{success}</p>}
                    <IssueLicense />
                    <RenewLicense />
                    <RevokeLicense />
                    <QueryLicense />
                    <LicenseList />
                </div>
            )}
        </div>
    );
}