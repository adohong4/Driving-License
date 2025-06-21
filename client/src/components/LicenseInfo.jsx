import { QRCodeSVG } from "qrcode.react";

export default function LicenseInfo({ license }) {
    return (
        <div className="mt-6 max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-primary mb-4">Thông Tin GPLX</h3>
            <p><span className="font-semibold">Mã GPLX:</span> {license.licenseId}</p>
            <p><span className="font-semibold">Họ tên:</span> {license.name}</p>
            <p><span className="font-semibold">Ngày sinh:</span> {license.dob}</p>
            <p><span className="font-semibold">Loại GPLX:</span> {license.licenseType}</p>
            <p><span className="font-semibold">Ngày cấp:</span> {new Date(license.issueDate * 1000).toLocaleDateString()}</p>
            <p><span className="font-semibold">Ngày hết hạn:</span> {new Date(license.expiryDate * 1000).toLocaleDateString()}</p>
            <p>
                <span className="font-semibold">Trạng thái:</span>
                <span
                    className={`inline-block px-2 py-1 rounded ${license.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                    {license.status}
                </span>
            </p>
            <p><span className="font-semibold">Cơ quan cấp:</span> {license.authorityId}</p>
            <p>
                <span className="font-semibold">IPFS Hash:</span>{" "}
                <a
                    href={`https://ipfs.io/ipfs/${license.dataHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                >
                    {license.dataHash}
                </a>
            </p>
            <div className="mt-4 flex justify-center">
                <QRCodeSVG value={JSON.stringify({ licenseId: license.licenseId, dataHash: license.dataHash })} size={150} />
            </div>
        </div>
    );
}