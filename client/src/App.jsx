import { Web3Provider } from "./context/Web3Context";
import Home from "./pages/Home";
import "./App.css";

function App() {
  return (
    <Web3Provider>
      <Home />
    </Web3Provider>
  );
}

export default App;