"use client"

import { useState } from "react"
import { useWeb3 } from "./contexts/Web3Context"
import Header from "./components/Header"
import LicenseList from "./components/LicenseList"
import IssueLicense from "./components/IssueLicense"
import LicenseDetail from "./components/LicenseDetail"
import MyLicenses from "./components/MyLicenses"
import AuthorityManagement from "./components/AuthorityManagement"
import { Car, FileText, User, Plus, Shield } from "lucide-react"

function App() {
  const { account, isConnected, isAuthority, isOwner } = useWeb3()
  const [activeTab, setActiveTab] = useState("my-licenses")
  const [selectedLicense, setSelectedLicense] = useState(null)

  // Định nghĩa tabs dựa trên quyền
  const getTabs = () => {
    const tabs = []

    if (isOwner) {
      // Owner: Tất cả bằng lái + Cấp bằng lái + Quản lý Authority
      tabs.push(
        { id: "list", label: "Tất cả bằng lái", icon: FileText },
        { id: "issue", label: "Cấp bằng lái", icon: Plus },
        { id: "authorities", label: "Quản lý Authority", icon: Shield },
      )
    } else if (isAuthority) {
      // Authority: Tất cả bằng lái + Cấp bằng lái
      tabs.push(
        { id: "list", label: "Tất cả bằng lái", icon: FileText },
        { id: "issue", label: "Cấp bằng lái", icon: Plus },
      )
    } else {
      // User bình thường: Chỉ bằng lái của tôi
      tabs.push({ id: "my-licenses", label: "Bằng lái của tôi", icon: User })
    }

    return tabs
  }

  const tabs = getTabs()

  // Set default tab based on role
  useState(() => {
    if (isOwner || isAuthority) {
      setActiveTab("list")
    } else {
      setActiveTab("my-licenses")
    }
  }, [isOwner, isAuthority])

  const renderContent = () => {
    if (selectedLicense) {
      return <LicenseDetail license={selectedLicense} onBack={() => setSelectedLicense(null)} />
    }

    switch (activeTab) {
      case "list":
        return <LicenseList onSelectLicense={setSelectedLicense} />
      case "my-licenses":
        return <MyLicenses onSelectLicense={setSelectedLicense} />
      case "issue":
        return <IssueLicense />
      case "authorities":
        return <AuthorityManagement />
      default:
        if (isOwner || isAuthority) {
          return <LicenseList onSelectLicense={setSelectedLicense} />
        } else {
          return <MyLicenses onSelectLicense={setSelectedLicense} />
        }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Car className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Hệ thống Bằng lái xe Blockchain</h1>
        </div>

        {!isConnected ? (
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Vui lòng kết nối ví để sử dụng</h2>
            <p className="text-gray-500">Kết nối ví MetaMask để truy cập hệ thống bằng lái xe blockchain</p>
          </div>
        ) : (
          <>
            {/* Role-based navigation */}
            {!selectedLicense && tabs.length > 0 && (
              <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === tab.id
                          ? "bg-primary-600 text-white"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Role indicator */}
            <div className="mb-4">
              {isOwner && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  Owner - Toàn quyền quản lý
                </div>
              )}
              {isAuthority && !isOwner && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  Authority - Quyền cấp bằng lái
                </div>
              )}
              {!isAuthority && !isOwner && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  <User className="w-4 h-4" />
                  User - Xem bằng lái cá nhân
                </div>
              )}
            </div>

            {renderContent()}
          </>
        )}
      </div>
    </div>
  )
}

export default App
