"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { ethers } from "ethers"
import Web3Modal from "web3modal"
import toast from "react-hot-toast"
import DrivingLicenseABI from "../abi/DrivingLicense.json"

const Web3Context = createContext()

export const useWeb3 = () => {
    const context = useContext(Web3Context)
    if (!context) {
        throw new Error("useWeb3 must be used within a Web3Provider")
    }
    return context
}

export const Web3Provider = ({ children }) => {
    const [provider, setProvider] = useState(null)
    const [signer, setSigner] = useState(null)
    const [contract, setContract] = useState(null)
    const [account, setAccount] = useState(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isAuthority, setIsAuthority] = useState(false)
    const [isOwner, setIsOwner] = useState(false)
    const [chainId, setChainId] = useState(null)

    const contractAddress = "0x7c680D03C5a0650F24266DF0F2aB67cf00F10Daa"

    const connectWallet = async () => {
        try {
            const web3Modal = new Web3Modal({
                network: "sepolia",
                cacheProvider: true,
                providerOptions: {},
            })

            const connection = await web3Modal.connect()
            const provider = new ethers.BrowserProvider(connection)
            const signer = await provider.getSigner()
            const account = await signer.getAddress()

            // Get network info
            const network = await provider.getNetwork()
            setChainId(network.chainId.toString())

            // Create contract instance
            const contract = new ethers.Contract(contractAddress, DrivingLicenseABI.abi, signer)

            setProvider(provider)
            setSigner(signer)
            setContract(contract)
            setAccount(account)
            setIsConnected(true)

            // Check user roles
            await checkUserRole(contract, account)

            toast.success("Kết nối ví thành công!")

            console.log("Connected to:", {
                account,
                network: network.name,
                chainId: network.chainId.toString(),
                contractAddress,
            })
        } catch (error) {
            console.error("Connection error:", error)
            toast.error("Lỗi khi kết nối ví: " + error.message)
        }
    }

    const checkUserRole = async (contract, address) => {
        try {
            const [isAuth, owner] = await Promise.all([contract.authorities(address), contract.owner()])

            setIsAuthority(isAuth)
            setIsOwner(owner.toLowerCase() === address.toLowerCase())

            console.log("User roles:", {
                address,
                isAuthority: isAuth,
                isOwner: owner.toLowerCase() === address.toLowerCase(),
            })
        } catch (error) {
            console.error("Error checking user role:", error)
            setIsAuthority(false)
            setIsOwner(false)
        }
    }

    const disconnectWallet = async () => {
        try {
            const web3Modal = new Web3Modal({
                network: "sepolia",
                cacheProvider: true,
                providerOptions: {},
            })

            await web3Modal.clearCachedProvider()

            setProvider(null)
            setSigner(null)
            setContract(null)
            setAccount(null)
            setIsConnected(false)
            setIsAuthority(false)
            setIsOwner(false)
            setChainId(null)

            toast.success("Đã ngắt kết nối ví!")
        } catch (error) {
            console.error("Disconnect error:", error)
        }
    }

    // Auto-connect if previously connected
    useEffect(() => {
        const autoConnect = async () => {
            try {
                const web3Modal = new Web3Modal({
                    network: "sepolia",
                    cacheProvider: true,
                    providerOptions: {},
                })

                if (web3Modal.cachedProvider) {
                    await connectWallet()
                }
            } catch (error) {
                console.error("Auto-connect failed:", error)
            }
        }

        autoConnect()
    }, [])

    // Listen for account/network changes
    useEffect(() => {
        if (provider && provider.provider) {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length === 0) {
                    disconnectWallet()
                } else if (accounts[0] !== account) {
                    connectWallet()
                }
            }

            const handleChainChanged = (chainId) => {
                setChainId(chainId)
                window.location.reload()
            }

            provider.provider.on("accountsChanged", handleAccountsChanged)
            provider.provider.on("chainChanged", handleChainChanged)

            return () => {
                provider.provider.removeListener("accountsChanged", handleAccountsChanged)
                provider.provider.removeListener("chainChanged", handleChainChanged)
            }
        }
    }, [provider, account])

    const value = {
        provider,
        signer,
        contract,
        account,
        isConnected,
        isAuthority,
        isOwner,
        chainId,
        connectWallet,
        disconnectWallet,
        contractAddress,
    }

    return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}
