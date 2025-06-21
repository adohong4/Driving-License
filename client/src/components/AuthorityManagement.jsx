"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "../contexts/Web3Context"
import { Shield, Plus, User, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"

const AuthorityManagement = () => {
    const { contract, provider, isOwner, isConnected } = useWeb3()
    const [authorities, setAuthorities] = useState([])
    const [loading, setLoading] = useState(false)
    const [addingAuthority, setAddingAuthority] = useState(false)
    const [newAuthorityAddress, setNewAuthorityAddress] = useState("")

    const fetchAuthoritiesFromEvents = async () => {
        if (!contract || !provider) return

        try {
            setLoading(true)
            console.log("Fetching AuthorityAdded events...")

            // Get AuthorityAdded events from contract
            const filter = contract.filters.AuthorityAdded()
            const events = await contract.queryFilter(filter, 0, "latest")

            console.log("AuthorityAdded events:", events)

            const authoritiesData = []

            for (const event of events) {
                const { authority, timestamp } = event.args

                // Check if authority is still active
                const isActive = await contract.authorities(authority)

                // Get transaction details
                const tx = await provider.getTransaction(event.transactionHash)
                const block = await provider.getBlock(event.blockNumber)

                authoritiesData.push({
                    address: authority,
                    addedDate: new Date(Number(timestamp) * 1000),
                    blockNumber: event.blockNumber,
                    transactionHash: event.transactionHash,
                    addedBy: tx.from,
                    isActive: isActive,
                    timestamp: Number(timestamp),
                })
            }

            // Sort by timestamp (newest first)
            authoritiesData.sort((a, b) => b.timestamp - a.timestamp)

            console.log("Processed authorities:", authoritiesData)
            setAuthorities(authoritiesData)
        } catch (error) {
            console.error("Error fetching authorities from events:", error)
            toast.error("Lỗi khi tải danh sách Authority: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAddAuthority = async (e) => {
        e.preventDefault()

        if (!newAuthorityAddress) {
            toast.error("Vui lòng nhập địa chỉ Authority!")
            return
        }

        if (!contract) {
            toast.error("Contract chưa được khởi tạo!")
            return
        }

        try {
            setAddingAuthority(true)

            // Check if address is valid
            if (!newAuthorityAddress.startsWith("0x") || newAuthorityAddress.length !== 42) {
                toast.error("Địa chỉ không hợp lệ!")
                return
            }

            // Check if already an authority
            const isAlreadyAuthority = await contract.authorities(newAuthorityAddress)
            if (isAlreadyAuthority) {
                toast.error("Địa chỉ này đã là Authority!")
                return
            }

            console.log("Adding authority:", newAuthorityAddress)

            const tx = await contract.addAuthority(newAuthorityAddress)

            toast.loading("Đang xử lý giao dịch...", { id: "add-authority" })
            console.log("Transaction sent:", tx.hash)

            const receipt = await tx.wait()
            console.log("Transaction confirmed:", receipt)

            toast.success("Thêm Authority thành công!", { id: "add-authority" })

            // Reset form and refresh list
            setNewAuthorityAddress("")
            await fetchAuthoritiesFromEvents()
        } catch (error) {
            console.error("Error adding authority:", error)
            let errorMessage = "Lỗi khi thêm Authority"

            if (error.reason) {
                errorMessage += ": " + error.reason
            } else if (error.message) {
                errorMessage += ": " + error.message
            }

            toast.error(errorMessage, { id: "add-authority" })
        } finally {
            setAddingAuthority(false)
        }
    }

    useEffect(() => {
        if (contract && provider && isConnected && isOwner) {
            fetchAuthoritiesFromEvents()
        }
    }, [contract, provider, isConnected, isOwner])

    const formatAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    const formatDate = (date) => {
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    if (!isConnected) {
        return (
            <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Vui lòng kết nối ví</h3>
                <p className="text-gray-500">Kết nối ví MetaMask để quản lý Authority</p>
            </div>
        )
    }

    if (!isOwner) {
        return (
            <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Không có quyền truy cập</h3>
                <p className="text-gray-500">Chỉ Owner mới có thể quản lý Authority</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Quản lý Authority</h2>
            </div>

            {/* Add Authority Form */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm Authority mới</h3>
                <form onSubmit={handleAddAuthority} className="space-y-4">
                    <div>
                        <label className="label">
                            <User className="w-4 h-4 inline mr-1" />
                            Địa chỉ ví Authority *
                        </label>
                        <input
                            type="text"
                            value={newAuthorityAddress}
                            onChange={(e) => setNewAuthorityAddress(e.target.value)}
                            className="input-field"
                            placeholder="0x..."
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={addingAuthority || !newAuthorityAddress}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {addingAuthority ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                Thêm Authority
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Authorities List */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Danh sách Authority ({authorities.filter((a) => a.isActive).length} hoạt động / {authorities.length} tổng)
                    </h3>
                    <button
                        onClick={fetchAuthoritiesFromEvents}
                        disabled={loading}
                        className="btn-secondary text-sm flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Làm mới
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
                        <span className="ml-2 text-gray-600">Đang tải từ blockchain...</span>
                    </div>
                ) : authorities.length === 0 ? (
                    <div className="text-center py-8">
                        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">Chưa có Authority nào được thêm</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Địa chỉ Authority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày thêm
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Người thêm
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Block/TX
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {authorities.map((authority, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                                                    <Shield className="w-5 h-5 text-primary-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 font-mono">{authority.address}</div>
                                                    <div className="text-sm text-gray-500">{formatAddress(authority.address)}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">{formatDate(authority.addedDate)}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-mono text-gray-900">{formatAddress(authority.addedBy)}</div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {authority.isActive ? (
                                                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Hoạt động
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Không hoạt động
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-500">
                                                <div>Block: {authority.blockNumber}</div>
                                                <div className="font-mono">TX: {formatAddress(authority.transactionHash)}</div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="card bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Lưu ý về Authority</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Authority có quyền cấp, gia hạn và thu hồi bằng lái</li>
                            <li>• Chỉ Owner mới có thể thêm Authority mới</li>
                            <li>• Danh sách được lấy từ AuthorityAdded events trên blockchain</li>
                            <li>• Trạng thái được kiểm tra real-time từ contract</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Event Log */}
            {authorities.length > 0 && (
                <div className="card bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Thống kê Events</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                            <div className="text-lg font-bold text-primary-600">{authorities.length}</div>
                            <div className="text-gray-600">Tổng Events</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{authorities.filter((a) => a.isActive).length}</div>
                            <div className="text-gray-600">Authority Hoạt động</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-600">
                                {authorities.length > 0 ? authorities[0].blockNumber : 0}
                            </div>
                            <div className="text-gray-600">Block Mới nhất</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AuthorityManagement
