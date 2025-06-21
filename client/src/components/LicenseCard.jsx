"use client"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar, User, CreditCard, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"

const LicenseCard = ({ license, onClick }) => {
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

    const isExpired = () => {
        return Date.now() / 1000 > license.expiryDate
    }

    return (
        <div
            onClick={onClick}
            className="card hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{license.name}</h3>
                        <p className="text-sm text-gray-500">ID: {license.licenseId}</p>
                    </div>
                </div>

                <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                >
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.label}
                </div>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>CCCD: {license.holderId}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                    <CreditCard className="w-4 h-4" />
                    <span>Loại: {license.licenseType}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Hết hạn: {formatDate(license.expiryDate)}</span>
                </div>
            </div>

            {isExpired() && license.status === 0 && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-600 font-medium">⚠️ Bằng lái đã hết hạn</p>
                </div>
            )}
        </div>
    )
}

export default LicenseCard
