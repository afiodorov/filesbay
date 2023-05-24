import React, { useContext } from "react";
import { EthContext, ctx } from "./ethContext";
import { BigNumberish, Contract } from "ethers";
import listings_abi_v1 from "./abi/listings.abi.json";
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

const Item: React.FC<{ contract: Contract; itemNum: BigNumberish }> = (
  props
) => {
  const { formatPrice, namePrice } = useContext(EthContext) as ctx;
  return (
    <div className="Buy">
      <Async
        promiseFn={async () => {
          const res = await (props.contract as any).files(props.itemNum);
          return res as Array<any>;
        }}
      >
        <Async.Pending>
          <>Loading item {props.itemNum}...</>
        </Async.Pending>
        <Async.Fulfilled>
          {(data: Array<any>) => (
            <div>
              <strong>File</strong>
              <pre>{data[0]}</pre>
              <strong>Description</strong>
              <pre>{data[1]}</pre>
              <strong>Price</strong>
              <pre>
                {formatPrice.get(data[3])?.call(null, data[2])}{" "}
                {namePrice.get(data[3])}
              </pre>
            </div>
          )}
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
    </div>
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
