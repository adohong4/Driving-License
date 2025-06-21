"use client"

import { useState } from "react"
import { useWeb3 } from "../contexts/Web3Context"
import { uploadToPinata } from "../utils/pinata"
import { Plus, Upload, Calendar, User, CreditCard, FileText, X, ImageIcon } from "lucide-react"
import toast from "react-hot-toast"

const IssueLicense = () => {
    const { contract, isAuthority, account, isConnected } = useWeb3()
    const [loading, setLoading] = useState(false)
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
    const [imagePreview, setImagePreview] = useState(null)

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
        if (!file) return

        // Kiểm tra loại file
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if (!allowedTypes.includes(file.type)) {
            toast.error("Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)!")
            return
        }

        // Kiểm tra kích thước file (tối đa 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            toast.error("Kích thước ảnh không được vượt quá 5MB!")
            return
        }

        // Nếu tất cả đều OK
        setSelectedFile(file)
        setImagePreview(URL.createObjectURL(file))
        toast.success("Ảnh hợp lệ!")
    }

    const handleRemoveImage = () => {
        setSelectedFile(null)
        setImagePreview(null)
        // Reset input file
        const fileInput = document.querySelector('input[type="file"]')
        if (fileInput) fileInput.value = ""
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

        if (!selectedFile) {
            toast.error("Vui lòng chọn ảnh bằng lái!")
            return
        }

        // Validate form data
        if (
            !formData.licenseId ||
            !formData.holderAddress ||
            !formData.holderId ||
            !formData.name ||
            !formData.dob ||
            !formData.expiryDate
        ) {
            toast.error("Vui lòng điền đầy đủ thông tin!")
            return
        }

        try {
            setLoading(true)

            // Step 1: Upload image to IPFS
            toast.loading("Đang upload ảnh lên IPFS...", { id: "issue-license" })
            console.log("Uploading file to IPFS:", selectedFile.name)

            const metadata = {
                name: `${formData.licenseId}-${formData.name}`,
                keyvalues: {
                    licenseId: formData.licenseId,
                    holderName: formData.name,
                    licenseType: formData.licenseType,
                    fileType: "license-image",
                },
            }
            console.log("selectedFile: ", selectedFile)
            console.log("metadata: ", metadata)

            const ipfsHash = await uploadToPinata(selectedFile, metadata)
            console.log("IPFS Hash:", ipfsHash)

            // Step 2: Create license on blockchain
            toast.loading("Đang tạo bằng lái trên blockchain...", { id: "issue-license" })

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
            handleRemoveImage()
        } catch (error) {
            console.error("Error issuing license:", error)
            let errorMessage = "Lỗi khi cấp bằng lái"

            if (error.message.includes("upload")) {
                errorMessage = "Lỗi khi upload ảnh lên IPFS: " + error.message
            } else if (error.reason) {
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
        <div className="max-w-4xl mx-auto">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="lg:col-span-2">
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

                        <div className="flex gap-4 pt-6 border-t">
                            <button
                                type="submit"
                                disabled={loading || !selectedFile || !isAuthority}
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

                {/* Image Upload Section */}
                <div className="space-y-6">
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            <Upload className="w-5 h-5 inline mr-2" />
                            Ảnh bằng lái xe *
                        </h3>

                        {!imagePreview ? (
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-sm text-gray-600 mb-2">Chọn ảnh bằng lái xe</p>
                                    <input
                                        type="file"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        id="license-image"
                                    />
                                    <label
                                        htmlFor="license-image"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Chọn ảnh
                                    </label>
                                </div>

                                <div className="text-xs text-gray-500 space-y-1">
                                    <p>• Chỉ chấp nhận: JPG, PNG, WEBP</p>
                                    <p>• Kích thước tối đa: 5MB</p>
                                    <p>• Ảnh sẽ được upload tự động khi cấp bằng lái</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Image Preview */}
                                <div className="relative">
                                    <div className="bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 max-h-80">
                                        <img
                                            src={imagePreview || "/placeholder.svg"}
                                            alt="License Preview"
                                            className="w-full h-auto object-contain"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* File Info */}
                                {selectedFile && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-900">{selectedFile.name}</p>
                                            <p className="text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                )}

                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-600 font-medium">✅ Ảnh đã sẵn sàng!</p>
                                    <p className="text-xs text-blue-500 mt-1">Ảnh sẽ được upload lên IPFS khi bạn nhấn "Cấp bằng lái"</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* License Preview Card */}
                    {imagePreview && formData.name && (
                        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                            <h4 className="text-sm font-medium text-blue-900 mb-3">Preview Bằng lái</h4>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                                        <img
                                            src={imagePreview || "/placeholder.svg"}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{formData.name}</p>
                                        <p className="text-sm text-gray-500">{formData.licenseId}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <p>Loại: {formData.licenseType}</p>
                                    <p>CCCD: {formData.holderId}</p>
                                    <p>Sinh: {formData.dob}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default IssueLicense
