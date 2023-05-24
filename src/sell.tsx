import React from "react";
import { useState } from "react";
import { EthContext, ctx } from "./ethContext";
import listings_abi_v1 from "./abi/listings.abi.json";
import { ethers } from "ethers";

async function listItem(
  fileName: string,
  fileDesc: string,
  price: string,
  priceToken: string,
  priceDecimals: number,
  to: string
): Promise<boolean> {
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const listingContract = new ethers.Contract(to, listings_abi_v1, provider);
  const signer = await provider.getSigner();
  const connected = listingContract.connect(signer);
  const amount = ethers.parseUnits(price, priceDecimals);

  let tx: ethers.Transaction | null = null;

  try {
    tx = await (connected as any).add(fileName, fileDesc, amount, priceToken);
  } catch (e) {
    console.log(e);
  }

  if (!tx || !tx.hash) {
    return false;
  }

  let txReceipt: ethers.TransactionReceipt | null = null;

  try {
    txReceipt = await provider.waitForTransaction(tx.hash);
  } catch (e) {
    console.log(e);
  }

  if (!txReceipt) {
    return false;
  }

  if (txReceipt.status !== 1) {
    console.log(txReceipt);

    return false;
  }

  return true;
}

export default function Sell() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState(Number(0));
  const [currency, setCurrency] = useState<number>(0);
  const [sending, setSending] = useState<boolean>(false);

  const { address, config } = React.useContext(EthContext) as ctx;

  const options = config.priceTokens.map((el, i) => (
    <option value={i} key={i}>
      {el.symbol}
    </option>
  ));

  const listItemHandler = async () => {
    setSending(true);

    if (
      await listItem(
        title,
        desc,
        price.toString(10),
        config.priceTokens[currency].address,
        config.priceTokens[currency].decimals,
        config.contractAddress
      )
    ) {
      setTitle("");
      setDesc("");
      setPrice(0);
      setCurrency(0);
    }

    setSending(false);
  };

  return (
    <div className="Sell">
      <div className="SellRow">
        <p>Filename</p>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
      </div>
      <div className="SellRow">
        <p>Description</p>
        <textarea
          value={desc}
          onChange={(e) => {
            setDesc(e.target.value);
          }}
          className="SellDescription"
        />
      </div>
      <div className="SellRow">
        <p>Price</p>
        <input
          type="number"
          step="0.0001"
          value={price}
          onChange={(e) => {
            setPrice(Number(e.target.value));
          }}
        />
        <select
          value={currency}
          onChange={(e) => {
            setCurrency(Number(e.target.value));
          }}
        >
          {options}
        </select>
      </div>
      <div className="SellRow">
        <p>
          {address && !sending && (
            <button onClick={listItemHandler}>List File For Sale</button>
          )}
          {address && sending && <div>Sending...</div>}
        </p>
      </div>
    </div>
  );
}
