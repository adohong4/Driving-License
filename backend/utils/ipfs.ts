import PinataClient from "@pinata/sdk";

const pinata = new PinataClient(
    process.env.PINATA_API_KEY as string,
    process.env.PINATA_API_SECRET as string
);

export async function uploadToIPFS(data: any): Promise<string> {
    const result = await pinata.pinJSONToIPFS(data);
    return result.IpfsHash;
}