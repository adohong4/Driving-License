"use client"
import { useWeb3 } from "../contexts/Web3Context"
import { Wallet, LogOut, Shield, Crown, User } from "lucide-react"

const Header = () => {
    const { account, isConnected, isAuthority, isOwner, connectWallet, disconnectWallet } = useWeb3()

    const formatAddress = (address) => {
        if (!address) return ""
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    const getRoleInfo = () => {
        if (isOwner) {
            return {
                label: "Owner",
                color: "text-yellow-800",
                bgColor: "bg-yellow-100",
                icon: Crown,
            }
        } else if (isAuthority) {
            return {
                label: "Authority",
                color: "text-blue-800",
                bgColor: "bg-blue-100",
                icon: Shield,
            }
        } else {
            return {
                label: "User",
                color: "text-gray-800",
                bgColor: "bg-gray-100",
                icon: User,
            }
        }
    }

    const roleInfo = getRoleInfo()
    const RoleIcon = roleInfo.icon

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">DL Blockchain</h1>
                            <p className="text-sm text-gray-500">Driving License System</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {isConnected ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.bgColor} ${roleInfo.color}`}
                                    >
                                        <RoleIcon className="w-3 h-3" />
                                        {roleInfo.label}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{formatAddress(account)}</p>
                                    <p className="text-xs text-gray-500">Đã kết nối</p>
                                </div>

                                <button
                                    onClick={disconnectWallet}
                                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Ngắt kết nối
                                </button>
                            </div>
                        ) : (
                            <button onClick={connectWallet} className="btn-primary flex items-center gap-2">
                                <Wallet className="w-4 h-4" />
                                Kết nối ví
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
