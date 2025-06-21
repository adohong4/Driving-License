"use client"

import { useState } from "react"
import { useWeb3 } from "../contexts/Web3Context"
import { uploadToPinata } from "../utils/pinata"
import { Plus, Upload, Calendar, User, CreditCard, FileText } from "lucide-react"
import toast from "react-hot-toast"

const IssueLicense = () => {
    const { contract, isAuthority, account, isConnected } = useWeb3()
    const [loading, setLoading] = useState(false)
    const [uploadingFile, setUploadingFile] = useState(false)
    const [formData, setFormData] = useState({
        licenseId: "",
        holderAddress: "",
        holderId: "",
        name: "",
        dob: "",
        licenseType: "B1",
        issueDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
        authorityId: "CSGT-001",
    })
    const [selectedFile, setSelectedFile] = useState(null)
    const [ipfsHash, setIpfsHash] = useState("")

    const licenseTypes = [
        { value: "A1", label: "A1 - Xe máy dưới 175cc" },
        { value: "A2", label: "A2 - Xe máy trên 175cc" },
        { value: "B1", label: "B1 - Ô tô dưới 9 chỗ" },
        { value: "B2", label: "B2 - Ô tô từ 9-30 chỗ" },
        { value: "C", label: "C - Xe tải" },
        { value: "D", label: "D - Xe khách" },
        { value: "E", label: "E - Xe container" },
        { value: "F", label: "F - Xe chuyên dụng" },
    ]

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                // 5MB limit
                toast.error("File không được vượt quá 5MB!")
                return
            }
            setSelectedFile(file)
        }
    }

    const handleUploadFile = async () => {
        if (!selectedFile) {
            toast.error("Vui lòng chọn file!")
            return
        }

        try {
            setUploadingFile(true)
            const metadata = {
                name: `${formData.licenseId || "license"}-${formData.name || "document"}`,
                keyvalues: {
                    licenseId: formData.licenseId,
                    holderName: formData.name,
                    licenseType: formData.licenseType,
                },
            }
            const hash = await uploadToPinata(selectedFile, metadata)
            setIpfsHash(hash)
            toast.success("Upload file thành công!")
        } catch (error) {
            console.error("Error uploading file:", error)
            toast.error("Lỗi khi upload file: " + error.message)
        } finally {
            setUploadingFile(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!isConnected) {
            toast.error("Vui lòng kết nối ví!")
            return
        }

        if (!contract) {
            toast.error("Contract chưa được khởi tạo!")
            return
        }

        if (!ipfsHash) {
            toast.error("Vui lòng upload file trước!")
            return
        }

        try {
            setLoading(true)

            const issueTimestamp = Math.floor(new Date(formData.issueDate).getTime() / 1000)
            const expiryTimestamp = Math.floor(new Date(formData.expiryDate).getTime() / 1000)

            console.log("Issuing license with data:", {
                licenseId: formData.licenseId,
                holderAddress: formData.holderAddress,
                holderId: formData.holderId,
                name: formData.name,
                dob: formData.dob,
                licenseType: formData.licenseType,
                issueDate: issueTimestamp,
                expiryDate: expiryTimestamp,
                ipfsHash,
                authorityId: formData.authorityId,
            })

            const tx = await contract.issueLicense(
                formData.licenseId,
                formData.holderAddress,
                formData.holderId,
                formData.name,
                formData.dob,
                formData.licenseType,
                issueTimestamp,
                expiryTimestamp,
                ipfsHash,
                formData.authorityId,
            )

            toast.loading("Đang xử lý giao dịch...", { id: "issue-license" })
            console.log("Transaction sent:", tx.hash)

            const receipt = await tx.wait()
            console.log("Transaction confirmed:", receipt)

            toast.success("Cấp bằng lái thành công!", { id: "issue-license" })

            // Reset form
            setFormData({
                licenseId: "",
                holderAddress: "",
                holderId: "",
                name: "",
                dob: "",
                licenseType: "B1",
                issueDate: new Date().toISOString().split("T")[0],
                expiryDate: "",
                authorityId: "CSGT-001",
            })
            setSelectedFile(null)
            setIpfsHash("")
        } catch (error) {
            console.error("Error issuing license:", error)
            let errorMessage = "Lỗi khi cấp bằng lái"

            if (error.reason) {
                errorMessage += ": " + error.reason
            } else if (error.message) {
                errorMessage += ": " + error.message
            }

            toast.error(errorMessage, { id: "issue-license" })
        } finally {
            setLoading(false)
        }
    }

    if (!isConnected) {
        return (
            <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">Vui lòng kết nối ví</h2>
                <p className="text-gray-500">Kết nối ví MetaMask để sử dụng tính năng cấp bằng lái</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Plus className="w-6 h-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Cấp bằng lái xe mới</h2>
            </div>

            {!isAuthority && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                        ⚠️ Bạn không có quyền Authority. Chỉ có thể xem form nhưng không thể cấp bằng lái.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="card space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="label">
                            <CreditCard className="w-4 h-4 inline mr-1" />
                            Mã bằng lái *
                        </label>
                        <input
                            type="text"
                            name="licenseId"
                            value={formData.licenseId}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="VD: BL001234"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">
                            <User className="w-4 h-4 inline mr-1" />
                            Địa chỉ ví người sở hữu *
                        </label>
                        <input
                            type="text"
                            name="holderAddress"
                            value={formData.holderAddress}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="0x..."
                            required
                        />
                    </div>

                    <div>
                        <label className="label">
                            <FileText className="w-4 h-4 inline mr-1" />
                            Số CCCD *
                        </label>
                        <input
                            type="text"
                            name="holderId"
                            value={formData.holderId}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="VD: 123456789012"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">
                            <User className="w-4 h-4 inline mr-1" />
                            Họ và tên *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="VD: Nguyễn Văn A"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Ngày sinh *
                        </label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">
                            <CreditCard className="w-4 h-4 inline mr-1" />
                            Loại bằng lái *
                        </label>
                        <select
                            name="licenseType"
                            value={formData.licenseType}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                        >
                            {licenseTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Ngày cấp *
                        </label>
                        <input
                            type="date"
                            name="issueDate"
                            value={formData.issueDate}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Ngày hết hạn *
                        </label>
                        <input
                            type="date"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="label">
                            <FileText className="w-4 h-4 inline mr-1" />
                            ID cơ quan cấp *
                        </label>
                        <input
                            type="text"
                            name="authorityId"
                            value={formData.authorityId}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="VD: CSGT-001"
                            required
                        />
                    </div>
                </div>

                <div className="border-t pt-6">
                    <label className="label">
                        <Upload className="w-4 h-4 inline mr-1" />
                        Upload file đính kèm *
                    </label>
                    <div className="space-y-3">
                        <input type="file" onChange={handleFileSelect} className="input-field" accept="image/*,.pdf" />

                        {selectedFile && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <span className="text-sm text-gray-600">
                                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                                <button
                                    type="button"
                                    onClick={handleUploadFile}
                                    disabled={uploadingFile}
                                    className="btn-secondary text-sm"
                                >
                                    {uploadingFile ? "Đang upload..." : "Upload"}
                                </button>
                            </div>
                        )}

                        {ipfsHash && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-600">✅ File đã upload thành công: {ipfsHash}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                    <button
                        type="submit"
                        disabled={loading || !ipfsHash || !isAuthority}
                        className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                Cấp bằng lái
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default IssueLicense
