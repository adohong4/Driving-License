"use client"

import { useState } from "react"
import { useWeb3 } from "../contexts/Web3Context"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
    ArrowLeft,
    Calendar,
    User,
    CreditCard,
    MapPin,
    FileText,
    ExternalLink,
    RotateCcw,
    XCircle,
    CheckCircle,
    AlertCircle,
    Clock,
} from "lucide-react"
import toast from "react-hot-toast"

const LicenseDetail = ({ license, onBack }) => {
    const { contract, isAuthority } = useWeb3()
    const [loading, setLoading] = useState(false)
    const [showRenewModal, setShowRenewModal] = useState(false)
    const [newExpiryDate, setNewExpiryDate] = useState("")

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

    const statusInfo = getStatusInfo(license.status)
    const StatusIcon = statusInfo.icon

    const formatDate = (timestamp) => {
        return format(new Date(timestamp * 1000), "dd/MM/yyyy", { locale: vi })
    }

    const formatAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    const isExpired = () => {
        return Date.now() / 1000 > license.expiryDate
    }

    const handleRevokeLicense = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn thu hồi bằng lái này?")) {
            return
        }

        try {
            setLoading(true)
            const tx = await contract.revokeLicense(license.licenseId)

            toast.loading("Đang xử lý giao dịch...", { id: "revoke-license" })
            await tx.wait()

            toast.success("Thu hồi bằng lái thành công!", { id: "revoke-license" })

            // Refresh license data
            setTimeout(() => {
                window.location.reload()
            }, 2000)
        } catch (error) {
            console.error("Error revoking license:", error)
            toast.error("Lỗi khi thu hồi bằng lái!", { id: "revoke-license" })
        } finally {
            setLoading(false)
        }
    }

    const handleRenewLicense = async () => {
        if (!newExpiryDate) {
            toast.error("Vui lòng chọn ngày hết hạn mới!")
            return
        }

        try {
            setLoading(true)
            const expiryTimestamp = Math.floor(new Date(newExpiryDate).getTime() / 1000)

            const tx = await contract.renewLicense(license.licenseId, expiryTimestamp)

            toast.loading("Đang xử lý giao dịch...", { id: "renew-license" })
            await tx.wait()

            toast.success("Gia hạn bằng lái thành công!", { id: "renew-license" })
            setShowRenewModal(false)

            // Refresh license data
            setTimeout(() => {
                window.location.reload()
            }, 2000)
        } catch (error) {
            console.error("Error renewing license:", error)
            toast.error("Lỗi khi gia hạn bằng lái!", { id: "renew-license" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại
                </button>
                <h2 className="text-2xl font-bold text-gray-900">Chi tiết bằng lái</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <div className="flex items-start justify-between mb-6">
                            {/* Thay thế phần header với icon */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                                    {license.ipfsHash ? (
                                        <img
                                            src={`https://gateway.pinata.cloud/ipfs/${license.ipfsHash}`}
                                            alt={license.name}
                                            className="w-full h-full object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.style.display = "none"
                                                e.target.nextSibling.style.display = "flex"
                                            }}
                                        />
                                    ) : null}
                                    <CreditCard className={`w-8 h-8 text-blue-600 ${license.ipfsHash ? "hidden" : ""}`} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{license.name}</h3>
                                    <p className="text-gray-600">Số/ No: {license.licenseId}</p>
                                </div>
                            </div>

                            <div
                                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                            >
                                <StatusIcon className="w-4 h-4" />
                                {statusInfo.label}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Số CCCD</p>
                                        <p className="font-medium">{license.holderId}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Ngày sinh</p>
                                        <p className="font-medium">{license.dob}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Loại bằng lái</p>
                                        <p className="font-medium">{license.licenseType}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Ngày cấp</p>
                                        <p className="font-medium">{formatDate(license.issueDate)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Ngày hết hạn</p>
                                        <p className={`font-medium ${isExpired() ? "text-red-600" : ""}`}>
                                            {formatDate(license.expiryDate)}
                                            {isExpired() && " (Đã hết hạn)"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Cơ quan cấp</p>
                                        <p className="font-medium">{license.authorityId}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Blockchain Info */}
                    <div className="card">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin Blockchain</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Địa chỉ ví người sở hữu</p>
                                    <p className="font-mono text-sm">{license.holderAddress}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">IPFS Hash</p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-mono text-sm">{license.ipfsHash}</p>
                                        <a
                                            href={`https://gateway.pinata.cloud/ipfs/${license.ipfsHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Sidebar */}
                <div className="space-y-6">
                    {isAuthority && (
                        <div className="card">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Hành động</h4>
                            <div className="space-y-3">
                                {license.status === 0 && (
                                    <button
                                        onClick={() => setShowRenewModal(true)}
                                        className="w-full btn-primary flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Gia hạn
                                    </button>
                                )}

                                {license.status === 0 && (
                                    <button
                                        onClick={handleRevokeLicense}
                                        disabled={loading}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Thu hồi
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Thay thế phần File Preview */}
                    <div className="card">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Ảnh bằng lái</h4>
                        <div className="bg-gray-100 rounded-lg overflow-hidden">
                            {/* <img
                                src={`https://gateway.pinata.cloud/ipfs/${license.ipfsHash}`}
                                alt="License Document"
                                className="w-full h-auto object-contain rounded-lg max-h-96"
                                onError={(e) => {
                                    e.target.style.display = "none"
                                    e.target.nextSibling.style.display = "flex"
                                }}
                            /> */}
                            <img
                                src={`https://ipfs.io/ipfs/${license.ipfsHash}`}
                                alt={license.name}
                                className="w-full h-auto object-contain rounded-lg max-h-96"
                            />
                            <div className="hidden flex-col items-center gap-2 text-gray-500 p-8">
                                <FileText className="w-8 h-8" />
                                <p className="text-sm">Không thể tải ảnh</p>
                                <p className="text-xs text-gray-400">IPFS: {license.ipfsHash}</p>
                            </div>
                        </div>

                        {/* Link to view full image */}
                        {/* <div className="mt-3 flex items-center justify-between">
                            <p className="text-xs text-gray-500 font-mono">IPFS: {license.ipfsHash}</p>
                            <a
                                href={`https://gateway.pinata.cloud/ipfs/${license.ipfsHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Xem ảnh gốc
                            </a>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Renew Modal */}
            {showRenewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gia hạn bằng lái</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Ngày hết hạn mới</label>
                                <input
                                    type="date"
                                    value={newExpiryDate}
                                    onChange={(e) => setNewExpiryDate(e.target.value)}
                                    className="input-field"
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowRenewModal(false)} className="btn-secondary flex-1">
                                Hủy
                            </button>
                            <button onClick={handleRenewLicense} disabled={loading || !newExpiryDate} className="btn-primary flex-1">
                                {loading ? "Đang xử lý..." : "Gia hạn"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LicenseDetail
