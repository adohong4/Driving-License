// Mock Pinata service for demo purposes
const PINATA_API_KEY = "demo_api_key"
const PINATA_API_SECRET = "demo_api_secret"

export const uploadToPinata = async (file) => {
    try {
        // Simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Generate mock IPFS hash
        const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

        console.log("Mock upload successful:", mockHash)
        return mockHash
    } catch (error) {
        console.error("Mock upload error:", error)
        throw new Error("Failed to upload file to IPFS (Mock)")
    }
}
