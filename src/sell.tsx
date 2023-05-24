import { useContext } from "react";
import { useState } from "react";
import { EthContext, ctx } from "./ethContext";
import listings_abi_v1 from "./abi/listings.abi.json";
import {
  BrowserProvider,
  Contract,
  parseUnits,
  Transaction,
  TransactionReceipt,
} from "ethers";

async function listItem(
  fileName: string,
  fileDesc: string,
  price: string,
  priceToken: string,
  priceDecimals: number,
  to: string,
  provider: BrowserProvider
): Promise<boolean> {
  const listingContract = new Contract(to, listings_abi_v1, provider);
  const signer = await provider.getSigner();
  const connected = listingContract.connect(signer);
  const amount = parseUnits(price, priceDecimals);

  let tx: Transaction | null = null;

  try {
    tx = await (connected as any).add(fileName, fileDesc, amount, priceToken);
  } catch (e) {
    console.log(e);
  }

  if (!tx || !tx.hash) {
    return false;
  }

  let txReceipt: TransactionReceipt | null = null;

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
  const { address, config, provider } = useContext(EthContext) as ctx;

  const options = config.priceTokens.map((el, i) => (
    <option value={i} key={i}>
      {el.symbol}
    </option>
  ));

  const listItemHandler = async () => {
    if (!(provider instanceof BrowserProvider)) {
      console.log("wrong etheres provider, website is read-only");
      return;
    }

    setSending(true);

    if (
      await listItem(
        title,
        desc,
        price.toString(10),
        config.priceTokens[currency].address,
        config.priceTokens[currency].decimals,
        config.contractAddress,
        provider as BrowserProvider
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
        <strong>Filename</strong>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
      </div>
      <div className="SellRow">
        <strong>Description</strong>
        <textarea
          value={desc}
          onChange={(e) => {
            setDesc(e.target.value);
          }}
          className="SellDescription"
        />
      </div>
      <div className="SellRow">
        <strong>Price</strong>
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
          {address && sending && "Sending..."}
        </p>
      </div>
    </div>
  );
}
