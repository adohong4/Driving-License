import { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import { Web3Context } from "../context/Web3Context";
import DrivingLicenseNFT from "../abi/DrivingLicenseNFT.json";

const ALCHEMY_API_KEY = "Egy1MswzdLUQHTqfhi1z7HFc-M0Uvw5r";
const CONTRACT_ADDRESS = "0x9e86Cf9ae7a28155071Bdf9129f4cE5EFA542DFF";
const ITEMS_PER_PAGE = 10;

export default function LicenseList() {
    const { setError, setSuccess } = useContext(Web3Context);
    const [licenses, setLicenses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalTokens, setTotalTokens] = useState(0);

    useEffect(() => {
        const fetchLicenses = async () => {
            setIsLoading(true);
            try {
                const provider = new ethers.JsonRpcProvider(
                    `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
                );
                const contract = new ethers.Contract(CONTRACT_ADDRESS, DrivingLicenseNFT.abi, provider);

                const licensesList = [];
                let tokenId = (currentPage - 1) * ITEMS_PER_PAGE + 1;
                const maxTokenId = currentPage * ITEMS_PER_PAGE;

                while (tokenId <= maxTokenId) {
                    try {
                        const license = await contract.getLicense(tokenId);
                        // Kiểm tra và chuyển đổi issueDate và expiryDate
                        const issueDate = ethers.BigNumber.isBigNumber(license.issueDate)
                            ? license.issueDate.toNumber()
                            : Number(license.issueDate);
                        const expiryDate = ethers.BigNumber.isBigNumber(license.expiryDate)
                            ? license.expiryDate.toNumber()
                            : Number(license.expiryDate);

                        licensesList.push({
                            licenseId: license.licenseId,
                            holderAddress: await contract.ownerOf(tokenId),
                            tokenId: tokenId.toString(),
                            name: license.name,
                            dob: license.dob,
                            licenseType: license.licenseType,
                            issueDate,
                            expiryDate,
                            dataHash: license.dataHash,
                            authorityId: license.authorityId,
                            status: license.status,
                        });
                        tokenId++;
                    } catch (error) {
                        if (error.message.includes("Token does not exist")) {
                            break;
                        } else {
                            throw error;
                        }
                    }
                }

                setLicenses(licensesList);
                setTotalTokens(tokenId - 1);
                setSuccess("Lấy danh sách GPLX thành công!");
            } catch (error) {
                console.error("Error fetching licenses:", error);
                setError(`Lỗi khi lấy danh sách GPLX: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLicenses();
    }, [currentPage, setError, setSuccess]);

    const totalPages = Math.ceil(totalTokens / ITEMS_PER_PAGE);

    if (isLoading) {
        return <p className="text-center text-gray-500">Đang tải danh sách GPLX...</p>;
    }

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">Danh Sách Giấy Phép Lái Xe</h2>
            {licenses.length === 0 ? (
                <p className="text-center text-gray-500">Không tìm thấy GPLX nào.</p>
            ) : (
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mã GPLX
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Người sở hữu
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Họ tên
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loại GPLX
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày hết hạn
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        IPFS
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {licenses.map((license) => (
                                    <tr key={license.licenseId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {license.licenseId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {license.holderAddress.slice(0, 6)}...{license.holderAddress.slice(-4)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {license.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {license.licenseType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(license.expiryDate * 1000).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span
                                                className={`inline-block px-2 py-1 rounded ${license.status === "ACTIVE"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {license.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <a
                                                href={`https://ipfs.io/ipfs/${license.dataHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 underline"
                                            >
                                                View
                                                @                 </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-between">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="bg-primary text-white px-4 py-2 rounded disabled:bg-gray-400"
                        >
                            Trang trước
                        </button>
                        <span>
                            Trang {currentPage} / {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            disabled={currentPage >= totalPages}
                            className="bg-primary text-white px-4 py-2 rounded disabled:bg-gray-400"
                        >
                            Trang sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}