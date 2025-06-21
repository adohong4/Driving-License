async function uploadToPinata(file, metadata = {}) {
    try {
        const url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
        const formData = new FormData()
        formData.append("file", file)

        const pinataMetadata = {
            name: metadata.name || `license-document-${Date.now()}`,
            keyvalues: {
                type: "driving-license",
                uploadedAt: new Date().toISOString(),
                ...metadata.keyvalues,
            },
        }
        formData.append("pinataMetadata", JSON.stringify(pinataMetadata))

        const response = await fetch(url, {
            method: "POST",
            headers: {
                pinata_api_key: "c7817b9ff6f35987a4e2",
                pinata_secret_api_key: "bf691a9f84ca722407c8fceb23610ca89efb4a24694627f9404b41154c9f289f",
            },
            body: formData,
        })

        const result = await response.json()
        console.log("Pinata response:", result)

        if (result.IpfsHash) {
            return result.IpfsHash
        } else {
            throw new Error("Failed to upload to Pinata: " + JSON.stringify(result))
        }
    } catch (error) {
        console.error("Error uploading to Pinata:", error)
        throw error
    }
}

export { uploadToPinata }
