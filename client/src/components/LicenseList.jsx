"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "../contexts/Web3Context"
import {
    Search,
    RefreshCw,
    FileText,
    Eye,
    Calendar,
    User,
    CreditCard,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import toast from "react-hot-toast"

const LicenseList = ({ onSelectLicense }) => {
    const { contract, isConnected } = useWeb3()
    const [licenses, setLicenses] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filteredLicenses, setFilteredLicenses] = useState([])

    const fetchLicenses = async () => {
        if (!contract) return

        try {
            setLoading(true)
            console.log("Fetching licenses from contract...")

            const allLicenses = await contract.getAllLicenses()
            console.log("Raw licenses data:", allLicenses)

            const formattedLicenses = allLicenses.map((license, index) => ({
                licenseId: license.licenseId || license[0],
                holderAddress: license.holderAddress || license[1],
                holderId: license.holderId || license[2],
                name: license.name || license[3],
                dob: license.dob || license[4],
                licenseType: license.licenseType || license[5],
                issueDate: Number(license.issueDate || license[6]),
                expiryDate: Number(license.expiryDate || license[7]),
                status: Number(license.status || license[8]),
                ipfsHash: license.ipfsHash || license[9],
                authorityId: license.authorityId || license[10],
            }))

            console.log("Formatted licenses:", formattedLicenses)
            setLicenses(formattedLicenses)
            setFilteredLicenses(formattedLicenses)
        } catch (error) {
            console.error("Error fetching licenses:", error)
            toast.error("Lỗi khi tải danh sách bằng lái: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (contract && isConnected) {
            fetchLicenses()
        }
    }, [contract, isConnected])

    useEffect(() => {
        const filtered = licenses.filter(
            (license) =>
                license.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                license.licenseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                license.holderId.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        setFilteredLicenses(filtered)
    }, [searchTerm, licenses])

    const getStatusInfo = (status) => {
        switch (status) {
            case 0: // ACTIVE
                return {
                    label: "Hoạt động",
                    color: "text-green-600",
                    bgColor: "bg-green-100",
                    icon: CheckCircle,
                }
            case 1: // SUSPENDED
                return {
                    label: "Tạm dừng",
                    color: "text-yellow-600",
                    bgColor: "bg-yellow-100",
                    icon: AlertCircle,
                }
            case 2: // REVOKED
                return {
                    label: "Thu hồi",
                    color: "text-red-600",
                    bgColor: "bg-red-100",
                    icon: XCircle,
                }
            case 3: // EXPIRED
                return {
                    label: "Hết hạn",
                    color: "text-gray-600",
                    bgColor: "bg-gray-100",
                    icon: Clock,
                }
            default:
                return {
                    label: "Không xác định",
                    color: "text-gray-600",
                    bgColor: "bg-gray-100",
                    icon: AlertCircle,
                }
        }
    }

    const formatDate = (timestamp) => {
        if (!timestamp || timestamp === 0) return "N/A"
        return format(new Date(timestamp * 1000), "dd/MM/yyyy", { locale: vi })
    }

    const formatAddress = (address) => {
        if (!address) return "N/A"
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    const isExpired = (expiryDate) => {
        return Date.now() / 1000 > expiryDate
    }

    if (!isConnected) {
        return (
            <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Vui lòng kết nối ví</h3>
                <p className="text-gray-500">Kết nối ví MetaMask để xem danh sách bằng lái</p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
                <span className="ml-2 text-gray-600">Đang tải danh sách bằng lái...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Tất cả bằng lái ({filteredLicenses.length})</h2>
                </div>

                <button onClick={fetchLicenses} className="btn-secondary flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Làm mới
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, mã bằng lái hoặc CCCD..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                />
            </div>

            {filteredLicenses.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                        {searchTerm ? "Không tìm thấy bằng lái" : "Chưa có bằng lái nào"}
                    </h3>
                    <p className="text-gray-500">
                        {searchTerm ? "Thử tìm kiếm với từ khóa khác" : "Hệ thống chưa có bằng lái nào được cấp"}
                    </p>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thông tin cá nhân
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bằng lái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày cấp/Hết hạn
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Địa chỉ ví
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLicenses.map((license, index) => {
                                    const statusInfo = getStatusInfo(license.status)
                                    const StatusIcon = statusInfo.icon

                                    return (
                                        <tr key={license.licenseId || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                                                        <User className="w-5 h-5 text-primary-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{license.name || "N/A"}</div>
                                                        <div className="text-sm text-gray-500">CCCD: {license.holderId || "N/A"}</div>
                                                        <div className="text-sm text-gray-500">Sinh: {license.dob || "N/A"}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{license.licenseId || "N/A"}</div>
                                                        <div className="text-sm text-gray-500">Loại: {license.licenseType || "N/A"}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                    <div>
                                                        <div className="text-sm text-gray-900">Cấp: {formatDate(license.issueDate)}</div>
                                                        <div
                                                            className={`text-sm ${isExpired(license.expiryDate) ? "text-red-600 font-medium" : "text-gray-500"}`}
                                                        >
                                                            Hết hạn: {formatDate(license.expiryDate)}
                                                            {isExpired(license.expiryDate) && license.status === 0 && (
                                                                <span className="ml-1 text-red-500">⚠️</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div
                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                                                >
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusInfo.label}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-mono text-gray-900">{formatAddress(license.holderAddress)}</div>
                                                <div className="text-xs text-gray-500">Cơ quan: {license.authorityId || "N/A"}</div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => onSelectLicense(license)}
                                                    className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    Xem chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LicenseList
