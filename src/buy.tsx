import React, { MouseEventHandler, useContext, useState } from "react";
import { EthContext, ctx } from "./ethContext";
import {
  Transaction,
  TransactionReceipt,
  BigNumberish,
  Contract,
  BrowserProvider,
  BaseContract,
} from "ethers";
import listings_abi_v1 from "./abi/listings.abi.json";
import erc20_abi from "./abi/erc20.abi.json";
import item_abi from "./abi/item.abi.json";
import Async from "react-async";
import "./App.css";

const loadNumFiles = async (contract: Contract) => {
  let numFiles: number | null = null;
  numFiles = await (contract as any).numFiles();

  if (!numFiles) {
    return 0;
  }

  return numFiles;
};

async function buy(
  itemNum: BigNumberish,
  owner: string,
  spender: string,
  priceUntyped: BigNumberish,
  tokenContract: BaseContract,
  provider: BrowserProvider
) {
  const allowance = await (tokenContract as any).allowance(owner, spender);

  const price = BigInt(priceUntyped);
  if (allowance < price) {
    let tx: Transaction | null = null;

    try {
      tx = await (tokenContract as any).approve(spender, price - allowance);
    } catch (e) {
      console.log(e);
    }

    if (!tx || !tx.hash) {
      return;
    }

    let txReceipt: TransactionReceipt | null = null;

    try {
      txReceipt = await provider.waitForTransaction(tx.hash);
    } catch (e) {
      console.log(e);
    }

    if (!txReceipt) {
      return;
    }

    if (txReceipt.status !== 1) {
      console.log(txReceipt);

      return;
    }
  }

  const listingContract = new Contract(spender, listings_abi_v1, provider);
  const signer = await provider.getSigner();
  const connected = listingContract.connect(signer);

  let tx: Transaction | null = null;

  try {
    tx = await (connected as any).buy(itemNum);
  } catch (e) {
    console.log(e);
  }

  if (!tx || !tx.hash) {
    return;
  }

  let txReceipt: TransactionReceipt | null = null;

  try {
    txReceipt = await provider.waitForTransaction(tx.hash);
  } catch (e) {
    console.log(e);
  }

  if (!txReceipt) {
    return;
  }

  if (txReceipt.status !== 1) {
    console.log(txReceipt);

    return;
  }
}

const BuyButton: React.FC<{
  nftAddress: string;
  onClick: MouseEventHandler;
  progress: boolean;
}> = (props) => {
  const { address, provider } = useContext(EthContext) as ctx;

  if (!address) {
    return <></>;
  }

  const itemContract = new Contract(props.nftAddress, item_abi, provider);

  return (
    <div>
      <Async
        promiseFn={async () => {
          const res = await (itemContract as any).balanceOf(address);
          return res;
        }}
      >
        <Async.Resolved>
          {(data: bigint) => {
            if (data === 0n) {
              return (
                <button onClick={props.onClick}>
                  {props.progress ? "Buying..." : "Buy"}
                </button>
              );
            }
            return <button>Bought</button>;
          }}
        </Async.Resolved>
        <Async.Loading>
          <button>Loading...</button>
        </Async.Loading>
      </Async>
    </div>
  );
};

const Item: React.FC<{ contract: Contract; itemNum: BigNumberish }> = (
  props
) => {
  const { address, formatPrice, namePrice, shortenAddress, provider, config } =
    useContext(EthContext) as ctx;
  const [progress, setProgress] = useState(false);

  return (
    <Async
      key={props.itemNum.toString()}
      promiseFn={async () => {
        const res = await (props.contract as any).files(props.itemNum);
        return res as Array<any>;
      }}
    >
      <Async.Pending>
        <>Loading item {props.itemNum}...</>
      </Async.Pending>
      <Async.Fulfilled>
        {(data: Array<any>) => {
          if (data[5].toLowerCase() === address?.toLowerCase()) {
            return <></>;
          }

          const onClick = async () => {
            if (progress) {
              return;
            }
            setProgress(true);
            await buy(
              props.itemNum,
              address || "",
              config.contractAddress,
              data[2],
              new Contract(data[3], erc20_abi, provider).connect(
                await (provider as BrowserProvider).getSigner()
              ),
              provider as BrowserProvider
            );
            setProgress(false);
          };

          return (
            <div className="Buy">
              <strong>File</strong>
              <pre>{data[0]}</pre>
              <strong>Description</strong>
              <pre>{data[1]}</pre>
              <strong>Price</strong>
              <pre>
                {formatPrice.get(data[3])?.call(null, data[2])}{" "}
                {namePrice.get(data[3])}
              </pre>
              <strong>Seller</strong>
              <pre>{shortenAddress(data[5])}</pre>
              {(window as any).ethereum && address && (
                <BuyButton
                  nftAddress={data[4]}
                  onClick={onClick}
                  progress={progress}
                />
              )}
            </div>
          );
        }}
      </Async.Fulfilled>
      <Async.Rejected>
        {(error) => {
          return (
            <>
              Error getting item {props.itemNum}: {error}
            </>
          );
        }}
      </Async.Rejected>
    </Async>
  );
};

const AllItems: React.FC<{ contract: Contract }> = (props) => {
  return (
    <>
      <Async promiseFn={loadNumFiles.bind(null, props.contract)}>
        <Async.Resolved>
          {(data: bigint) => {
            const rows = [];
            for (let i = data - 1n; i >= 0; i--) {
              rows.push(Item({ contract: props.contract, itemNum: i }));
            }
            return <>{rows}</>;
          }}
        </Async.Resolved>
        <Async.Loading>LOADING</Async.Loading>
      </Async>
    </>
  );
};

export default function Buy() {
  const { config, provider } = useContext(EthContext) as ctx;

  const listingContract = new Contract(
    config.contractAddress,
    listings_abi_v1,
    provider
  );

  return (
    <>
      <AllItems contract={listingContract} />
    </>
  );
}
