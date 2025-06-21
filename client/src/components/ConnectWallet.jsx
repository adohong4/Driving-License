import { useContext } from "react";
import { Web3Context } from "../context/Web3Context";

export default function ConnectWallet() {
    const { account, connectWallet } = useContext(Web3Context);

    if (account) return null;

    return (
        <div className="text-center">
            <button
                onClick={connectWallet}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition"
            >
                Kết nối MetaMask
            </button>
        </div>
    );
}