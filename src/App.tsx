import React from "react";
import { Routes, Route, Outlet, Link } from "react-router-dom";
import "./App.css";
import Sell from "./sell";
import Buy from "./buy";
import { EthContext, ctx } from "./ethContext";
import { BrowserProvider } from "ethers";

export default function App() {
  const { setAddress, shortenAddress, ensLooker, setDisplayAddr } =
    React.useContext<ctx | null>(EthContext) as ctx;

  if ((window as any).ethereum) {
    (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
      setAddress(accounts[0]);
      setDisplayAddr(shortenAddress(accounts[0]));
      (async () => {
        const ensName = await ensLooker.reverseLookup(accounts[0]);
        if (ensName) {
          setDisplayAddr(ensName);
        }
      })();
    });

    (window as any).ethereum.on("chainChanged", (_: string) => {});
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Buy />} />
        <Route path="sell" element={<Sell />} />
        <Route path="*" element={<NoMatch />} />
      </Route>
    </Routes>
  );
}

function Layout() {
  const {
    address,
    setAddress,
    setProvider,
    shortenAddress,
    ensLooker,
    displayAddr,
    setDisplayAddr,
  } = React.useContext(EthContext) as ctx;

  const connect = async () => {
    await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    const connectedAddr = (window as any).ethereum.selectedAddress;
    setAddress(connectedAddr);
    setDisplayAddr(shortenAddress(connectedAddr || ""));
    setProvider(new BrowserProvider((window as any).ethereum));
    const ensName = await ensLooker.reverseLookup(connectedAddr);
    if (ensName) {
      setDisplayAddr(ensName);
    }
  };

  return (
    <div className="App">
      <div className="Layout">
        <div>
          <Link to="/">Buy</Link>
        </div>
        <div>
          <Link to="/sell">Sell</Link>
        </div>
        <div>
          {(window as any).ethereum && !address && (
            <button onClick={connect}>Connect</button>
          )}
          {(window as any).ethereum && address && <div>{displayAddr}</div>}
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
