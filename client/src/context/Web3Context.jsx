import { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import DrivingLicenseNFT from "../abi/DrivingLicenseNFT.json";

const CONTRACT_ADDRESS = "0x9e86Cf9ae7a28155071Bdf9129f4cE5EFA542DFF";

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [isAuthority, setIsAuthority] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const connectWallet = async () => {
        try {
            if (!ethers.isAddress(CONTRACT_ADDRESS)) {
                throw new Error(`Địa chỉ hợp đồng không hợp lệ: ${CONTRACT_ADDRESS}`);
            }
            const web3Modal = new Web3Modal({
                network: "sepolia",
                cacheProvider: true,
                providerOptions: {},
            });
            const connection = await web3Modal.connect();
            const provider = new ethers.BrowserProvider(connection);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, DrivingLicenseNFT.abi, signer);
            const account = await signer.getAddress();

            const isAuth = await contract.authorities(account);
            setProvider(provider);
            setSigner(signer);
            setContract(contract);
            setAccount(account);
            setIsAuthority(isAuth);
            setError("");
            setSuccess("");
        } catch (error) {
            setError(`Kết nối ví MetaMask thất bại: ${error.message}`);
        }
    };

    useEffect(() => {
        if (contract) {
            setError("");
            setSuccess("");
        }
    }, [contract]);

    return (
        <Web3Context.Provider
            value={{
                provider,
                signer,
                contract,
                account,
                isAuthority,
                error,
                success,
                setError,
                setSuccess,
                connectWallet,
            }}
        >
            {children}
        </Web3Context.Provider>
    );
};