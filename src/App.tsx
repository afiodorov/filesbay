import React from "react";
import { Routes, Route, Outlet, Link } from "react-router-dom";
import "./App.css";
import Sell from "./sell";
import Listed from "./listed";
import { EthContext, ctx } from "./ethContext";

export default function App() {
  const { setAddress } = React.useContext<ctx | null>(EthContext) as ctx;

  if ((window as any).ethereum) {
    (window as any).ethereum.on("accountsChanged", (accounts: any) => {
      setAddress(accounts[0]);
    });
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Listed />} />
        <Route path="sell" element={<Sell />} />
        <Route path="*" element={<NoMatch />} />
      </Route>
    </Routes>
  );
}

function Layout() {
  const { address, setAddress, shortenAddress } = React.useContext(
    EthContext
  ) as ctx;

  const connect = async () => {
    await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    setAddress((window as any).ethereum.selectedAddress);
  };

  return (
    <div className="App">
      <div className="Layout">
        <div>
          <Link to="/">Listed Items</Link>
        </div>
        <div>
          <Link to="/sell">Sell</Link>
        </div>
        <div>
          {(window as any).ethereum && !address && (
            <button onClick={connect}>Connect</button>
          )}
          {(window as any).ethereum && address && (
            <div>{shortenAddress(address)}</div>
          )}
        </div>
      </div>

      <Outlet />
    </div>
  );
}

function NoMatch() {
  return (
    <div>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}
