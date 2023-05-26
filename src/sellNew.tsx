import { useContext } from "react";
import { useState } from "react";
import { EthContext, ctx } from "./ethContext";
import listings_abi_v1 from "./abi/listings.abi.json";
import {
  BigNumberish,
  BrowserProvider,
  Contract,
  parseUnits,
  Transaction,
  TransactionReceipt,
} from "ethers";
import { decrypt, encrypt, fromHexString } from "./encryption";

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

async function setMessage(
  fileNum: BigNumberish,
  msg: Uint8Array,
  listingContractAddr: string,
  provider: BrowserProvider
) {
  const listingContract = new Contract(
    listingContractAddr,
    listings_abi_v1,
    provider
  );
  const signer = await provider.getSigner();
  const connected = listingContract.connect(signer);

  let tx: Transaction | null = null;

  try {
    tx = await (connected as any).setEncryptedMessage(fileNum, msg);
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

export const EditableItem: React.FC<{
  fileNum: BigNumberish;
  title: string;
  desc: string;
  price: string;
  currency: string;
  encryptedMessage: string;
  nftAddress: string;
}> = (props) => {
  const [title, setTitle] = useState(props.title);
  const [desc, setDesc] = useState(props.desc);
  const [encryptedMessage, setEncryptedMessage] = useState("");
  const [price, setPrice] = useState(Number(props.price));
  const [sending, setSending] = useState<boolean>(false);
  const { address, config, provider } = useContext(EthContext) as ctx;

  (async () => {
    const decoded = fromHexString(props.encryptedMessage);
    if (decoded.length > 0) {
      setEncryptedMessage(await decrypt(decoded));
    }
  })();

  const setEncryptedMessageHandler = async () => {
    if (!(provider instanceof BrowserProvider)) {
      console.log("wrong etheres provider, website is read-only");
      return;
    }

    setSending(true);

    const rawMsg = encrypt(
      encryptedMessage,
      props.nftAddress,
      Number(config.chainID)
    );

    await setMessage(props.fileNum, rawMsg, config.contractAddress, provider);

    setSending(false);
  };

  return (
    <div className="Sell">
      <strong>File</strong>
      <pre>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
      </pre>
      <strong>Description</strong>
      <pre>
        <textarea
          value={desc}
          onChange={(e) => {
            setDesc(e.target.value);
          }}
          className="SellDescription"
        />
      </pre>
      <strong>Encrypted Message</strong>
      <pre>
        <textarea
          value={encryptedMessage}
          onChange={(e) => {
            setEncryptedMessage(e.target.value);
          }}
          className="SellDescription"
        />
      </pre>
      <strong>Price</strong>
      <pre>
        <input
          type="number"
          step="0.0001"
          value={price}
          onChange={(e) => {
            setPrice(Number(e.target.value));
          }}
        />
        {props.currency}
      </pre>
      <p>
        {address && !sending && (
          <button onClick={setEncryptedMessageHandler}>
            Set Encrypted Message
          </button>
        )}
        {address && sending && "Setting Encrypted Message..."}
      </p>
    </div>
  );
};

export default function SellNew() {
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
      <strong>File</strong>
      <pre>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
      </pre>
      <strong>Description</strong>
      <pre>
        <textarea
          value={desc}
          onChange={(e) => {
            setDesc(e.target.value);
          }}
          className="SellDescription"
        />
      </pre>
      <strong>Price</strong>
      <pre>
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
      </pre>
      <p>
        {address && !sending && (
          <button onClick={listItemHandler}>List File For Sale</button>
        )}
        {address && sending && "Sending..."}
      </p>
    </div>
  );
}
