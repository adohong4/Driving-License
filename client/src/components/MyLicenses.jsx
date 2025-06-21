"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "../contexts/Web3Context"
import LicenseCard from "./LicenseCard"
import { User, RefreshCw, FileText } from "lucide-react"
import toast from "react-hot-toast"

const MyLicenses = ({ onSelectLicense }) => {
    const { contract, account, isConnected } = useWeb3()
    const [licenses, setLicenses] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchMyLicenses = async () => {
        if (!contract || !account) return

        try {
            setLoading(true)
            console.log("Fetching licenses for address:", account)

            const myLicenses = await contract.getLicensesByHolder(account)
            console.log("Raw my licenses data:", myLicenses)

            const formattedLicenses = myLicenses.map((license, index) => ({
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

            console.log("Formatted my licenses:", formattedLicenses)
            setLicenses(formattedLicenses)
        } catch (error) {
            console.error("Error fetching my licenses:", error)
            toast.error("Lỗi khi tải bằng lái của bạn: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (contract && account && isConnected) {
            fetchMyLicenses()
        }
    }, [contract, account, isConnected])

    if (!isConnected) {
        return (
            <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Vui lòng kết nối ví</h3>
                <p className="text-gray-500">Kết nối ví MetaMask để xem bằng lái của bạn</p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
                <span className="ml-2 text-gray-600">Đang tải bằng lái của bạn...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <User className="w-6 h-6 text-primary-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Bằng lái của tôi ({licenses.length})</h2>
                </div>

                <button onClick={fetchMyLicenses} className="btn-secondary flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Làm mới
                </button>
            </div>

            {licenses.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Bạn chưa có bằng lái nào</h3>
                    <p className="text-gray-500">Liên hệ cơ quan có thẩm quyền để được cấp bằng lái xe</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {licenses.map((license, index) => (
                        <LicenseCard key={license.licenseId || index} license={license} onClick={() => onSelectLicense(license)} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyLicenses
